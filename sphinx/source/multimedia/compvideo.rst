Introduction to Computer Video
==============================

Video has become the dominant form of digital content in our modern world. From streaming platforms and social media to professional filmmaking and video conferencing, digital video technology touches nearly every aspect of our daily lives. Understanding the fundamentals of computer video is essential for anyone working with digital media, whether you’re a content creator, developer, or simply a curious technology enthusiast.

The Challenge of Digital Video
------------------------------

Digital video presents a unique challenge: raw, uncompressed video data is enormous. At its core, video is simply a sequence of photographs (called frames) displayed rapidly to create the illusion of motion. This fundamental nature of video—being essentially thousands of individual images—is what creates the storage and bandwidth challenge. Consider a single frame of 4K video at 24 frames per second:

* **Resolution**: 3840 × 2160 pixels
* **Color depth**: 8 bits per channel (RGB)
* **Frame size**: 3840 × 2160 × 3 = 24,883,200 bytes ≈ 24.9 MB per frame
* **Data rate**: 24.9 MB × 24 fps = 597.6 MB per second
* **One minute**: 597.6 MB × 60 = 35.8 GB per minute

Even a short 10-second clip would require nearly 6 GB of storage in uncompressed form. This is why video compression is not just important—it’s absolutely essential for practical digital video applications. Imagine trying to stream a movie without compression: you’d need to download over 2 terabytes of data for a typical 2-hour film!

ffmpeg: the Swiss Army Knife of Video Processing
------------------------------------------------

When people talk about essential tools in the world of media, few names carry the same weight as ffmpeg. It is more than just a program you run from the command line: it is a full-fledged multimedia framework capable of decoding, encoding, transcoding, muxing, demuxing, filtering, and streaming almost any video or audio format you can think of. From YouTube rippers and screen recorders to large-scale media platforms, ffmpeg quietly works in the background, making the flow of video across the internet seamless.

What makes ffmpeg so powerful is its universality. It is not tied to a single operating system or vendor, and it supports an astonishing variety of codecs and containers. Developers rely on it to implement video processing pipelines in web services, desktop applications, and even embedded devices. In modern infrastructure, ffmpeg often plays a hidden but vital role: transcoding user uploads into multiple formats for adaptive streaming, generating thumbnails for video previews, normalizing audio levels, or re-encoding live streams on the fly. If you watch video online today, there is a good chance that ffmpeg has touched it somewhere along the path from creator to viewer.

Using ffmpeg may feel intimidating at first, with its long strings of options and parameters, but once you understand its syntax, it becomes a remarkably flexible tool. Need to convert a giant video archive to a different format? Cut clips from an interview? Add subtitles, apply filters, or resize content for mobile devices? ffmpeg handles all of that with a single command. Its performance is impressive too, as it can leverage hardware acceleration on modern CPUs and GPUs, making large-scale processing practical.

During my years at Orgtechservice, LLC, I worked extensively with ffmpeg, and it never failed me. No matter how complex or unusual the video processing tasks were, ffmpeg provided the tools to get the job done reliably and efficiently.

Video Containers and Codecs
---------------------------

Understanding the difference between containers and codecs is fundamental to working with digital video.

.. note::
   **Container** (also called wrapper or format) is a file format that can hold multiple types of data: video streams, audio streams, subtitles and captions, metadata, and chapter information.

.. note::
   **Codec** (coder-decoder) is an algorithm that compresses and decompresses video and audio data. The codec determines how the actual video/audio data is stored within the container.

Common containers include:

* **MP4** — Most widely supported, good for web delivery
* **MKV** — Open source, supports almost any codec
* **MOV** — Apple’s QuickTime format
* **AVI** — Older Windows format, limited codec support
* **WebM** — Open web standard, good for streaming

Example: Remuxing between containers without re-encoding
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can change the container format without re-encoding the video, which is much faster and preserves quality:

.. code-block:: bash

    # Convert from MKV to MP4 without re-encoding
    ffmpeg -i input.mkv -c copy output.mp4
    
    # Convert from AVI to MP4 without re-encoding
    ffmpeg -i input.avi -c copy output.mp4
    
    # Extract video and audio streams to separate files
    ffmpeg -i input.mp4 -c:v copy -an video-only.mp4
    ffmpeg -i input.mp4 -c:a copy -vn audio-only.aac

    # Combine video and audio into a single file
    ffmpeg -i video-only.mp4 -i audio-only.aac -c:a copy -c:v copy output.mp4

Video Compression Fundamentals
------------------------------

Video compression works by exploiting spatial and temporal redundancy in video data:

**Spatial compression** reduces redundancy within individual frames by:

* Converting RGB to YUV color space
* Applying discrete cosine transform (DCT)
* Quantizing frequency coefficients
* Using entropy coding

**Temporal compression** reduces redundancy between frames by:

* Motion estimation and compensation
* Inter-frame prediction
* Keyframe (I-frame) insertion
* Delta frame (P-frame and B-frame) encoding

Lossy vs. Lossless Compression
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

**Lossy compression** permanently removes data to achieve smaller file sizes:

* Irreversible quality loss
* Much higher compression ratios
* Used in most consumer applications
* Examples: H.264, H.265, VP9, AV1

**Lossless compression** preserves all original data:

* No quality loss
* Lower compression ratios
* Used in professional workflows
* Examples: FFV1, Huffyuv, Apple ProRes 4444

Color Depth and Bit Depth
-------------------------

Color depth (bit depth) determines how many colors can be represented and affects both quality and file size.

**8-bit color** (most common):

* 256 levels per color channel
* 16.7 million total colors
* Standard for web and consumer video
* Compatible with most displays

**10-bit color**:

* 1,024 levels per color channel
* 1.07 billion total colors
* Better gradient representation
* Used in HDR content and professional workflows

You’ve probably encountered videos on YouTube or Instagram that appear significantly brighter than others—brighter even than the pure white color in the app’s interface! This is 10-bit HDR video in action, showcasing the dramatic difference that higher bit depth can make.

**12-bit and higher** (professional):

* 4,096+ levels per color channel
* Used in high-end cinema cameras
* Requires specialized hardware and software

Chroma Subsampling
------------------

Chroma subsampling reduces color information to save bandwidth while maintaining acceptable visual quality.

.. note::
   **Chroma subsampling** is a technique that reduces color information to save bandwidth while maintaining acceptable visual quality. Common formats include 4:4:4 (no subsampling), 4:2:2 (2:1 horizontal subsampling), and 4:2:0 (2:1 horizontal and vertical subsampling).

**4:4:4** — No subsampling:

* Full color resolution
* Used in professional workflows
* Larger file sizes

**4:2:2** — 2:1 horizontal subsampling:

* Good balance of quality and efficiency
* Common in professional video
* Used by many broadcast standards

**4:2:0** — 2:1 horizontal and vertical subsampling:

* Most common in consumer video
* Significant bandwidth savings
* Standard for web video and streaming

This is why your favorite streaming service can deliver high-quality video even on slower internet connections—the clever reduction of color information allows for much smaller file sizes while maintaining visual quality that’s perfectly acceptable for most viewers.

Example: Converting between color formats
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

    # Convert to 10-bit H.264 with 4:2:2 chroma subsampling
    ffmpeg -i input.mp4 -c:v libx264 -pix_fmt yuv422p10le -crf 18 output.mp4
    
    # Convert to 8-bit with 4:2:0 subsampling (web standard)
    ffmpeg -i input.mp4 -c:v libx264 -pix_fmt yuv420p -crf 23 output.mp4
    
    # Check pixel format of existing video
    ffprobe -v quiet -select_streams v:0 -show_entries stream=pix_fmt -of csv=p=0 input.mp4

Professional Video Formats
--------------------------

Professional video workflows often use specialized formats designed for high quality and efficient processing.

Apple ProRes
^^^^^^^^^^^^

Apple ProRes is a family of professional video codecs designed for post-production workflows:

* **ProRes 422 Proxy** — Low bitrate, good for offline editing
* **ProRes 422 LT** — Light version, good for online editing
* **ProRes 422** — Standard version, balanced quality/size
* **ProRes 422 HQ** — High quality version
* **ProRes 4444** — Lossless, supports alpha channel
* **ProRes 4444 XQ** — Highest quality, 12-bit support

Logarithmic Color Profiles
--------------------------

Logarithmic (log) color profiles are designed to capture more dynamic range and provide better color grading flexibility in post-production.

**What is Log?**

* Non-linear color encoding that mimics film response
* Preserves more highlight and shadow detail
* Requires color grading to look “normal”
* Used in professional cameras and workflows

**Common Log formats:**

* **S-Log** (Sony)
* **C-Log** (Canon) 
* **V-Log** (Panasonic)
* **Log-C** (ARRI)
* **Apple Log** (Apple)

Color Grading Log Footage
^^^^^^^^^^^^^^^^^^^^^^^^^

Log footage appears flat and desaturated and requires color grading to achieve the desired look. If you’ve ever seen behind-the-scenes footage from a movie set, you might have noticed how “washed out” and gray the raw footage looks—this is Log in action, preserving all the detail for later color grading. Professional color grading is typically performed using specialized software such as DaVinci Resolve Studio or Final Cut Pro. These applications provide advanced tools for applying Look-Up Tables (LUTs), manual color correction using curves and wheels, converting between different color spaces, and working with HDR content.

Modern Video Codecs
-------------------

The video codec landscape continues to evolve, with new formats offering better compression efficiency.

**H.264 (AVC)** — Still widely used:

* Excellent compatibility
* Good compression efficiency
* Hardware acceleration widely available
* Standard for web video

**H.265 (HEVC)** — Next generation:

* 50% better compression than H.264
* Better HDR support
* More complex encoding/decoding
* Patent licensing issues

**VP9** — Google’s open codec:

* Royalty-free
* Good compression efficiency
* Limited hardware support (i.e it just hangs on iPhone in Telegram app)
* Used by YouTube

You might have noticed that some YouTube videos take longer to load or stutter on certain devices—this is often due to VP9’s limited hardware acceleration support, forcing the device to decode the video using software, which is much more demanding on the processor.

**AV1** — Next-generation open codec:

* Best compression efficiency
* Royalty-free
* Growing hardware support
* Future of web video

Example: Comparing codec efficiency
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

    # H.264 encoding
    ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium output_h264.mp4
    
    # H.265 encoding (better compression)
    ffmpeg -i input.mp4 -c:v libx265 -crf 28 -preset medium output_h265.mp4
    
    # VP9 encoding (open source)
    ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 output_vp9.webm
    
    # AV1 encoding (best compression)
    ffmpeg -i input.mp4 -c:v libaom-av1 -crf 30 -b:v 0 output_av1.mkv

Streaming and Adaptive Bitrate
------------------------------

Modern video delivery relies heavily on adaptive bitrate streaming, which adjusts video quality based on available bandwidth.

**Key concepts:**

* Multiple quality versions of the same content
* Automatic switching between qualities
* Reduced buffering and improved user experience
* Used by Netflix, YouTube, and other major platforms

Example: Creating adaptive bitrate streams
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: bash

    # Create multiple quality versions
    ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset fast -s 1920x1080 output_1080p.mp4
    ffmpeg -i input.mp4 -c:v libx264 -crf 26 -preset fast -s 1280x720 output_720p.mp4
    ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset fast -s 854x480 output_480p.mp4
    
    # Create HLS playlist for adaptive streaming
    ffmpeg -i input.mp4 \
      -c:v libx264 -c:a aac \
      -b:v 1000k -b:a 128k -s 1280x720 \
      -f hls -hls_time 10 -hls_playlist_type vod \
      output_720p.m3u8
