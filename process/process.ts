import {
  addAudioToVideo,
  captureScreenshots,
  createVideoFromScreenshots,
  delay,
  deleteAllFilesInFolder,
  setupBrowser
} from './utils.ts'

const CLIP_PATH = 'processed-clip-3.mp4'
const VIDEO_PATH = 'combined-video.mp4'
const AUDIO_PATH = 'clip.mp3'

const FRAME_RATE = 10
const PLATFORM = 'youtube'
const LANGUAGE = 'mandarin'

const SCREENSHOTS_FOLDER = 'screenshots'

const WIDTH = 1080
const HEIGHT = 1920

console.log('Started generating clip...')
const { page, browser } = await setupBrowser(WIDTH, HEIGHT, FRAME_RATE, PLATFORM, LANGUAGE)
await delay(3)
const TOTAL_FRAMES = await page.$eval('#total-frames', (el) => {
  if (!el.textContent) throw new Error('Total frames not found.')
  return parseInt(el.textContent)
})
await deleteAllFilesInFolder(SCREENSHOTS_FOLDER)
await captureScreenshots(page, TOTAL_FRAMES, SCREENSHOTS_FOLDER)
await browser.close()
await createVideoFromScreenshots(FRAME_RATE, SCREENSHOTS_FOLDER, VIDEO_PATH)
await delay(2)
await addAudioToVideo(VIDEO_PATH, AUDIO_PATH, CLIP_PATH)
console.log('Finished.')
