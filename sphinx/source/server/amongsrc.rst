VPS IP change protection
========================

When building virtualization systems for mass VPS hosting, the following problem can arise: regardless of the IP assignment mechanism in use (static, DHCP), there is always a possibility that a subscriber who has root access to their server will set another subscriber’s IP address on their own machine. At the very least this can disrupt the network, and at worst — it allows that subscriber to steal another tenant’s user data through phishing.

The root cause is that a tenant with root can configure the guest network stack however they please. We cannot trust anything the guest *says* about itself — neither its source IP, nor even its source MAC. So the enforcement has to happen one layer below the guest, on the host, at the very point where the guest’s traffic enters our network.

Where to enforce it
-------------------

In a typical KVM-based setup each guest is started as a ``qemu-kvm`` instance, and for every running VM QEMU creates a host-side ``tapN`` interface that is plugged into a bridge. Everything the guest transmits leaves through its ``tapN`` interface, and everything destined for the guest is written into it. That ``tapN`` interface is the natural choke point: it belongs to the host, the tenant cannot touch it, and we know exactly which subscriber (and therefore which MAC/IP pair) is supposed to be behind it.

Since we are working with a bridge, ordinary ``iptables`` (which lives at L3) is the wrong tool — the traffic we want to police is bridged at L2, and a malicious guest can spoof L3 fields anyway. The right tool is ``ebtables``, the Ethernet bridge firewall. And it just so happens that ``ebtables`` ships with a match that was practically designed for this exact task: ``among``.

The ``among`` match
-------------------

The ``among`` match takes a list of ``MAC=IP`` pairs and tests the source (``--among-src``) or destination (``--among-dst``) of the frame against it:

.. code-block:: text

   --among-src MAC1=IP1,MAC2=IP2,...

The semantics are exactly what we need for anti-spoofing: the frame passes the match only if its source MAC is in the list **and**, for frame types that carry an IP (ARP, IPv4, IPv6), the MAC=IP pairing matches one of the listed pairs. In other words, a guest can only send a frame if both its hardware address and its network address are the ones we assigned to it. Swap one of them — wrong MAC, or the “neighbour’s” IP — and the match fails.

.. note ::

   The ``among`` match is provided by the ``ebt_among`` kernel module. On a modern ``nftables``-based distribution the classic ``ebtables`` command is usually a thin compatibility wrapper (``ebtables-nft``); everything below works the same way through it.

.. note ::

   On server editions of Ubuntu there are two different packages — ``ebtables`` and ``ebtables-legacy`` — and in production I sometimes ran into problems with the plain ``ebtables`` (the one without the ``legacy`` suffix). The symptom was that every so often the ``tapN`` chains would stop accepting even the correct MAC/IP pair, and traffic would simply grind to a halt — something that never happened with ``ebtables-legacy``. I didn’t get to the bottom of it back then and just started force-installing the ``legacy`` variant, but it would really be worth figuring out properly.

Per-interface chains
--------------------

The plan is straightforward:

#. For every ``tapN`` interface, create a user-defined chain with the same name.
#. Set that chain’s default policy to ``DROP``, so anything not explicitly allowed is silently dropped.
#. Add ``ACCEPT`` rules for the legitimate ``MAC=IP`` pairs via ``--among-src``.
#. Hook the chain into ``FORWARD`` (and ``INPUT``, if the host itself has an address on the bridge) based on the input interface.

Unlike ``iptables``, ``ebtables`` lets you set a policy on user-defined chains, so we can literally make the chain default to ``DROP``.

Here is the core of it for a single guest:

.. code-block:: bash

   TAP=tap0
   MAC=52:54:00:11:22:33
   IP4=203.0.113.10
   IP6=2001:db8:1::10

   # A dedicated chain that drops everything by default.
   ebtables -N "$TAP"
   ebtables -P "$TAP" DROP

   # Direct this guest's egress traffic into its chain.
   ebtables -A FORWARD -i "$TAP" -j "$TAP"
   ebtables -A INPUT   -i "$TAP" -j "$TAP"

   # Accept frames whose source MAC/IP pairing is the one we assigned.
   ebtables -A "$TAP" -p IPv4 --among-src "$MAC=$IP4" -j ACCEPT
   ebtables -A "$TAP" -p ARP  --among-src "$MAC=$IP4" -j ACCEPT
   ebtables -A "$TAP" -p IPv6 --among-src "$MAC=$IP6" -j ACCEPT

The three ``among-src`` rules already cover the common case: normal IPv4 traffic, ARP (so the guest can resolve its gateway, but only while claiming its own IP), and routed IPv6. A guest that tries to put up a neighbour’s IPv4, or to answer ARP for an address it doesn’t own, gets dropped before its frames ever reach the bridge.

But there are two important pieces that ``--among-src $MAC=$IP`` does **not** cover on its own, because in those cases the source IP in the frame is legitimately *not* the assigned address yet.

Letting DHCP through
--------------------

If addresses are handed out over DHCP, a freshly booted guest does not have its IP yet. A ``DHCPDISCOVER``/``DHCPREQUEST`` is sent from source IP ``0.0.0.0`` to the broadcast ``255.255.255.255``, with UDP source port 68 and destination port 67. That frame will never match ``--among-src $MAC=$IP4`` — its IP is ``0.0.0.0``, not the assigned one — so with the chain above it would be dropped and the guest could never obtain a lease.

We therefore add an explicit exception for the DHCP client → server handshake, still pinned to the correct source MAC so a tenant can’t abuse it as a generic bypass:

.. code-block:: bash

   # Allow the DHCP client handshake (bootpc -> bootps), pinned to the guest's MAC.
   ebtables -A "$TAP" -p IPv4 -s "$MAC" \
       --ip-proto udp --ip-sport 68 --ip-dport 67 -j ACCEPT

Note that we only permit traffic *from* the client port *to* the server port. The guest may request a lease, but it cannot pretend to be a DHCP server for the rest of the segment.

Letting IPv6 Neighbor Discovery through
---------------------------------------

IPv6 has an analogous chicken-and-egg problem, and it is easy to miss. Neighbor Discovery (the IPv6 equivalent of ARP) and address autoconfiguration run over ICMPv6, and the guest sends a lot of this traffic from its **link-local** address (``fe80::/10``), or even from the unspecified address ``::`` during Duplicate Address Detection — not from the global address we put in the ``among`` list. So ``--among-src $MAC=$IP6`` will not match those frames, and without an exception the guest’s IPv6 simply never comes up: it can’t do DAD, can’t send Router Solicitations, can’t resolve its neighbours.

We allow the essential ND/autoconf message types, again pinned to the guest’s MAC:

.. code-block:: bash

   # Allow IPv6 Neighbor Discovery / autoconfiguration, pinned to the guest's MAC.
   #   133 Router Solicitation
   #   135 Neighbor Solicitation
   #   136 Neighbor Advertisement
   for t in router-solicitation neighbour-solicitation neighbour-advertisement; do
       ebtables -A "$TAP" -p IPv6 -s "$MAC" \
           --ip6-proto ipv6-icmp --ip6-icmp-type "$t" -j ACCEPT
   done

.. note ::

   We deliberately do **not** allow type 134 (Router Advertisement) from the guest — in a hosting environment the router is the host/upstream, not the tenant, and a guest sending RAs could hijack autoconfiguration for everyone else on the segment. Pinning every rule to ``-s $MAC`` means even the ND exceptions can’t be used to impersonate another tenant at L2.

Putting it together
-------------------

In a real virtualization system you don’t type these commands by hand — you run them from the hook that fires when a VM’s ``tap`` interface appears (and a teardown hook when it goes away). A self-contained version looks like this:

.. code-block:: bash

   #!/bin/sh
   # Usage: tap-firewall.sh up   TAP MAC IP4 IP6
   #        tap-firewall.sh down TAP
   set -eu

   ACTION=$1
   TAP=$2

   case "$ACTION" in
   up)
       MAC=$3; IP4=$4; IP6=$5

       ebtables -N "$TAP" 2>/dev/null || ebtables -F "$TAP"
       ebtables -P "$TAP" DROP

       # Legitimate assigned IP/MAC pairings.
       ebtables -A "$TAP" -p IPv4 --among-src "$MAC=$IP4" -j ACCEPT
       ebtables -A "$TAP" -p ARP  --among-src "$MAC=$IP4" -j ACCEPT
       ebtables -A "$TAP" -p IPv6 --among-src "$MAC=$IP6" -j ACCEPT

       # DHCP client handshake.
       ebtables -A "$TAP" -p IPv4 -s "$MAC" \
           --ip-proto udp --ip-sport 68 --ip-dport 67 -j ACCEPT

       # IPv6 Neighbor Discovery / autoconfiguration.
       for t in router-solicitation neighbour-solicitation neighbour-advertisement; do
           ebtables -A "$TAP" -p IPv6 -s "$MAC" \
               --ip6-proto ipv6-icmp --ip6-icmp-type "$t" -j ACCEPT
       done

       # Hook the chain in, once.
       ebtables -A FORWARD -i "$TAP" -j "$TAP"
       ebtables -A INPUT   -i "$TAP" -j "$TAP"
       ;;
   down)
       ebtables -D FORWARD -i "$TAP" -j "$TAP" 2>/dev/null || true
       ebtables -D INPUT   -i "$TAP" -j "$TAP" 2>/dev/null || true
       ebtables -F "$TAP" 2>/dev/null || true
       ebtables -X "$TAP" 2>/dev/null || true
       ;;
   esac

When a guest with several assigned addresses needs to be supported, just list all the pairs in a single ``--among-src`` rule (``$MAC=$IP_A,$MAC=$IP_B,...``), or, for a large fleet, use ``--among-src-file`` and point it at a file you regenerate from your address-management database.

Why this holds up
-----------------

The strength of the scheme is that it never trusts the guest. The ``DROP`` policy means the default answer is “no”, and every ``ACCEPT`` is conditioned on a MAC the tenant cannot change without us noticing (it’s our ``tap``, our rule) paired with an IP we assigned. A tenant can put any IP they like inside their VM, but the moment a spoofed frame hits ``tapN`` it is dropped on the host — it never reaches the bridge, the gateway, or the neighbouring tenant. The only “open” paths are the narrow, MAC-pinned exceptions required for DHCP and IPv6 ND to function, neither of which can be turned into an impersonation primitive.
