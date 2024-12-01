
# LinguoClips
This program automates the creation of LinguoClips (short videos) from podcast episodes, ready to upload to social platforms like YouTube, Instagram, and TikTok.

**It is still under development, it aims to streamline and simplify the process.**

## Overview
The program consist of two main parts: the graphics and the process.

The graphics is a React app which renders the frames in the web, frame by frame. It takes the transcript, translations, dictionary and images to render the visual part.  

The process is a Node script that with a browser (via Puppeteer) captures the frames of the clip, compiles it into a video and attatch the audio to generate the clip.

## Setup
### Prerequisite
- [Node >= v22.9](https://nodejs.org/en/download/package-manager)
- Yarn
- Git
- Ffmpeg
- Chrome or Chromium
- (Optional but recommended) [Visual Studio Code](https://code.visualstudio.com/download)
### Installation
- Clone this repository in the desired folder.
```sh
git clone https://github.com/linguocast/clips
```
- Place the terminal in the folder ``graphics`` and install dependencies.
```sh
cd graphics
yarn install
```
- Place yourself in the folder ``process`` and install dependencies.
```sh
cd ../process
yarn install
```

### Creating the first clip
- Place the terminal in the folder ``graphics`` and run.
```sh
yarn dev
```

Now, when you visit [http://localhost:5173](http://localhost:5173) in a browser you should see the clip, which should start playing when you click anywhere on the window.

Tips:
- The clip will restart everytime you click on the window.
- Is better to adjust the width so it resembles it to a vertical screen. 

Now that the graphics are working, it's time to generate the video. Place the the terminal in the process folder and run:
```sh
yarn build
```
Now, if everything is correctly installed, the terminal will show that the video is being generated. It make take 10 minutes, depending on the computer hardware and frame rate (by default is set to 10 frames per second).

When the terminal shows 'Finished.' your should open the folder ``clips/process/output`` and it should show the generated video!

## Step by step on generating your custom clip

Start by copying the folder graphics/src/input/EXAMPLE_tomate_21-mi-viaje-por-europa_A in the input folder (the one you used for generating the first video).
It's recommended to follow this pattern (but it's completely up to you):

```
[PODCAST_NAME with dashes]_[EPISODE_NAME with dashes]_[A/B/C/... clip letter]
```

Copy the name that you used and replace it in the line 15 in the file `clips/graphics/Clip.tsx` and save it.

Now it's time to modify what it is inside the folder to customize it to the new clip!
Start by opening the file data.ts (recommend using Visual Studio Code so it shows you if there is any error, but you can use any text editor like Notepad).
Inside that file you will find all the neccesary info to customize your clip in the form of comments.
As you make the changes, you can save and go back to the browser to see the changes in real time.

When you are satisfied with how it looks, it's time to generate the video!
Open the file `clips/process/process.ts` and adjust the parameters that are explained there.

Making sure that the the graphics process is still running (you should not close the terminal), open a new terminal tab and place yourself in the folder `clips/process` and then run:
```bash
yarn build
```
After a few minutes, when the processing is completed, the file should be saved in `clips/process/output`, ready to be uploaded to the social platforms.

How did it turn out?
