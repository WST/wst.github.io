Using ExeGate SineTower SN2000
==============================

The ExeGate SineTower SN2000 is a line-interactive UPS. And, honestly, it’s a pretty good UPS. It costs noticeably less than double-conversion UPSes (the nJoy Aten PRO 2000, for example). It has excellent load capacity, indication of input and output voltage as well as battery charge level. It also features stepwise output voltage stabilization based on a tapped autotransformer. I use it as a backup power source for my computers, printers and other equipment. And on the whole it has never let me down, despite this brand’s generally not-so-stellar reputation.

Nonetheless, this UPS is not without its flaws. I identified two main issues that I really wanted to do something about. First, this UPS is very noisy: from time to time a fan kicks in whose “roar” reminds me more of server hardware than of a solution for home use. Second, this fan only switches on intermittently: at first the UPS runs for a long time with the fan off, after which the temperature gets so high that the UPS becomes literally painful to touch with your hand. After that the fan kicks in and runs until the insides of the UPS cool down. Then the cycle starts over. I’m no great expert on the factors affecting battery service life, but something tells me that such an operating mode is, to put it mildly, not the most favorable for them.

So I decided to take the UPS apart and make the simplest possible mod: replace the noisy fan with a quiet one and make it run continuously.

Inside, I found a fan with the following markings:

.. raw:: html

   <div class="swiper-slider-container" style="width: 100%; height: auto; margin: 20px 0;">
      <img src="/docs/_static/images/exegate/disenshitong-cooler.jpg" alt="Original cooler">
   </div>

All my attempts to find a quieter 3000 RPM fan turned out to be unsuccessful: they were all just as noisy. Then I decided to try a fan with a lower rotation speed, or simply to lower the supply voltage using a DC-DC step-down converter. I also found a 12V rail on the board and connected the fan directly to it instead of to the “Fan” pins, which allowed the fan to run continuously and thus avoid the heating-and-cooling cycles I described earlier.

In the end, the DeepCool XFan80 turned out to be a perfect fit — its noise level makes it practically inaudible. As a result, this dead-simple mod made the ExeGate SineTower SN2000 much more comfortable for home use.
