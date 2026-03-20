Hardware Video Encoding
=======================

I often encode video. Sometimes these are very large 4K-resolution files that need to be quickly downscaled to 1080p. Transcoding them using only the CPU takes a lot of time. What can we do? A graphics card and hardware acceleration of video operations come to the rescue. Let’s look at a simple example. We have a large, nearly 20‑gigabyte 4K video file. Codec — VP9, color depth — 8 bits per channel (not HDR; HDR is usually 10‑bit color). To transcode it into Full HD (1080p), the following steps are required:

* Decode the source stream into video frames
* Rescale each frame to the target size
* Encode the new frame sequence into the target codec

If you use only the CPU for all this, it will inevitably take several hours. Let’s see how we can speed up the process using hardware acceleration.

Example 1: Linux/BSD PC
-----------------------

On a desktop PC with an NVIDIA GPU (e.g., Core i3-14100F + RTX 4060) and a Linux/BSD operating system with the proprietary NVIDIA driver, you can use CUDA acceleration.

.. code-block:: bash

	ffmpeg -y \
	  -hwaccel cuda -hwaccel_output_format cuda \
	  -i "SomeVideo-4K.webm" \
	  -i "audio.m4a" \
	  -vf "scale_cuda=1920:-2" \
	  -c:v h264_nvenc -preset p7 -tune hq -profile:v high \
	  -rc vbr -cq 18 -b:v 0 -maxrate 20M -bufsize 40M \
	  -c:a copy \
	  -movflags +faststart \
	  "SomeVideo-FullHD.mp4"

Flag explanations
^^^^^^^^^^^^^^^^^

* ``-hwaccel cuda`` — enables CUDA hardware-accelerated decoding.
* ``-hwaccel_output_format cuda`` — outputs decoded frames in a CUDA-friendly format.
* ``-vf "scale_cuda=1920:-2"`` — resizes video frames on the GPU, width = 1920, height auto-scaled to even number.
* ``-c:v h264_nvenc`` — encode video using NVIDIA's NVENC H.264 hardware encoder.
* ``-preset p7`` — slowest but highest quality preset for NVENC.
* ``-tune hq`` — tunes encoder for high quality.
* ``-profile:v high`` — H.264 High profile for maximum compatibility.
* ``-rc vbr`` — variable bitrate mode.
* ``-cq 18`` — constant quality factor (lower = better quality).
* ``-b:v 0`` — disables strict target bitrate (lets CQ control quality).
* ``-maxrate 20M`` — maximum instantaneous bitrate.
* ``-bufsize 40M`` — buffer size for rate control.
* ``-c:a copy`` — copies the audio stream without re‑encoding.
* ``-movflags +faststart`` — rearranges MP4 atoms for faster streaming.

CPU-only example
^^^^^^^^^^^^^^^^

.. code-block:: bash

	ffmpeg -y \
	  -i "SomeVideo-4K.webm" \
	  -i "audio.m4a" \
	  -vf "scale=1920:-2:flags=bicubic" \
	  -c:v libx264 -preset slow -crf 18 \
	  -c:a copy \
	  -movflags +faststart \
	  "SomeVideo-FullHD.mp4"

.. note::

	You may have noticed the difference in the ``-vf`` option value: the CPU example has ``flags=bicubic``, while the GPU example doesn’t. This sets the resampling method used while resizing the frames, and the hardware resizers often don’t let you select the resampling method, while the CPU filter allows you to select from ``bilinear``, ``bicubic``, ``spline``, ``lanczos`` and probably some others.

Encoding time benchmark
^^^^^^^^^^^^^^^^^^^^^^^

* **GPU accelerated:** 35 minutes 3 seconds
* **CPU only:** 3 hours 18 minutes 35 seconds

Example 2: MacBook Air M1
-------------------------

Even a MacBook Air M1 contains hardware acceleration for video.

.. code-block:: bash

	ffmpeg -y \
	  -hwaccel videotoolbox \
	  -i "SomeVideo-4K.webm" \
	  -i "audio.m4a" \
	  -vf "scale_videotoolbox=1920:-2:flags=bicubic" \
	  -c:v h264_videotoolbox -b:v 10M \
	  -c:a copy \
	  -movflags +faststart \
	  "SomeVideo-FullHD.mp4"

Flag explanations
^^^^^^^^^^^^^^^^^

* ``-hwaccel videotoolbox`` — enables Apple VideoToolbox hardware decoding.
* ``-vf "scale_videotoolbox=1920:-2:flags=bicubic"`` — scales using VideoToolbox hardware (if supported).
* ``-c:v h264_videotoolbox`` — encodes video using Apple’s VideoToolbox H.264 encoder.
* ``-b:v 10M`` — sets target bitrate to 10 Mbps.
* ``-c:a copy`` — copies the audio stream without re‑encoding.
* ``-movflags +faststart`` — rearranges MP4 atoms for faster streaming.

CPU-only example
^^^^^^^^^^^^^^^^

.. code-block:: bash

	ffmpeg -y \
	  -i "SomeVideo-4K.webm" \
	  -i "audio.m4a" \
	  -vf "scale=1920:-2:flags=bicubic" \
	  -c:v libx264 -preset slow -crf 18 \
	  -c:a copy \
	  -movflags +faststart \
	  "SomeVideo-FullHD.mp4"

VideoToolbox codec support table
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

+-----------------+----------------------+--------------------+
| Codec           | Decode support       | Encode support     |
+=================+======================+====================+
| H.264           | Yes (hardware)       | Yes (hardware)     |
+-----------------+----------------------+--------------------+
| HEVC (H.265)    | Yes (hardware)       | Yes (hardware)     |
+-----------------+----------------------+--------------------+
| VP9             | Partial (8-bit only) | No                 |
+-----------------+----------------------+--------------------+
| AV1             | No (M1 only; later   | No (M1 only; later |
|                 | chips support)       | chips support)     |
+-----------------+----------------------+--------------------+
