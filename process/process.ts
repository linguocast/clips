import {
  addAudioToVideo,
  captureScreenshots,
  createVideoFromScreenshots,
  delay,
  deleteAllFilesInFolder,
  ensureFolderExists,
  setupBrowser
} from './utils.ts'

// 1) Change here the name of the folder that use created in graphics 
const FOLDER_NAME = 'EXAMPLE'

// 2) If neccesary, change the name of the audio file that you used in graphics
const AUDIO_NAME = 'audio.mp3'

// 3) Adjust the frame rate. For testing use 1, else, you should use 30.
const FRAME_RATE = 30

// 4) Save the file! That was it here. No need to change anything below...
const CLIP_PATH = `${FOLDER_NAME}.mp4`
const AUDIO_PATH = `../graphics/src/input/${FOLDER_NAME}/${AUDIO_NAME}`
const VIDEO_PATH = 'mute-video.mp4'

const PLATFORM = 'youtube'  // no effect for now
const SCREENSHOTS_FOLDER = 'screenshots' 

const WIDTH = 1080
const HEIGHT = 1920

console.log('Started generating clip...')
const { page, browser } = await setupBrowser(WIDTH, HEIGHT, FRAME_RATE, PLATFORM)
await delay(3)
const TOTAL_FRAMES = await page.$eval('#total-frames', (el) => {
  if (!el.textContent) throw new Error('Total frames not found.')
  return parseInt(el.textContent)
})
await ensureFolderExists(SCREENSHOTS_FOLDER)
await deleteAllFilesInFolder(SCREENSHOTS_FOLDER)
await captureScreenshots(page, TOTAL_FRAMES, SCREENSHOTS_FOLDER)
await browser.close()
await createVideoFromScreenshots(FRAME_RATE, SCREENSHOTS_FOLDER, VIDEO_PATH)
await deleteAllFilesInFolder(SCREENSHOTS_FOLDER)
await ensureFolderExists('output')
await addAudioToVideo(VIDEO_PATH, AUDIO_PATH, 'output/' + CLIP_PATH)
console.log('Finished.')
