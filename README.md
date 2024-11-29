
# LinguoClips
This program automates the creation of LinguoClips (short video snippets) from your favorite podcast episodes, ready for platforms like YouTube Shorts, Instagram Reels, and TikTok.

**Still under development, it aims to streamline and simplify the process.**

## Overview
The program consist of two main parts: the graphics and the processor (called *process*).

The graphics is a React app which renders the frames in the web. It takes the transcript, translations, dictionary and images to render the visual parts.  

The processor is a Node script which a browser (via Puppeteer), it captures the frames of the clips, compiles it into a video and attatch the audio to generate the clip ready to be uploaded.

## Setup
### Prerequisite
- Node >= v22.9
- Yarn
- Git
- Ffmpeg
- Chrome or Chromium
### Installation
- Clone this repository in the desired folder.
```sh
git clone https://github.com/linguocast/clips
```
- Place yourself in the folder graphics and install dependencies.
```sh
cd graphics
yarn install
```
- Place yourself in the folder graphics and install dependencies.
```sh
cd process
yarn install
```

## Generate clip

Within the *graphics/src/Clip.tsx*:

- Substitute the PODCAST_NAME and EPISODE_NAME.
- Copy the desired part of the transcript in the RAW_TRANSCRIPT variable. Notice that the showed lines are separated by a double return.
- Translate the lines and place it in RAW_TRANSLATIONS
- Search for the background images and place them in graphics/assets/images
- Search the podcast images and place it in graphics/assets/images
- Import all the images
- In RAW_IMAGES set their start timing (notice that this are milliseconds)
- Complete the dictionary (to show at the end)

  

In the console navigate spin off the graphics server with the following commands:
```sh
cd graphics
yarn dev
```
It should not give any error and you should be able to view the clip (without sound) visiting [http://localhost:5173](http://localhost:5173/) in your browser. Adjust the elements you worked on as necessary.

Now its time to generate the clip:
Within the process/process.ts:
- Generate the audio cut from the original podcast. I recommend [Mp3cut](https://mp3cut.net/)
- Place the audio in the folder /process and set the audio path AUDIO_PATH.
- Set the platform and language on PLATFORM and LANGUAGE.
- Set the clip file name (ending in .mp4) in CLIP_PATH.
- Finally, with the graphics app running, run yarn build

The clip should have been generated! It's ready to be uploaded.
