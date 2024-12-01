import ffmpeg from 'fluent-ffmpeg'
import * as fsP from 'fs/promises'
import * as path from 'path'
import { exec } from 'child_process'
import puppeteer, { Page } from 'puppeteer'
import { existsSync, mkdirSync } from 'fs'

export const delay = async (seconds: number) => new Promise(r => setTimeout(r, seconds * 1000))

export const ensureFolderExists = (folderName: string) => {
  const folderPath = path.join(process.cwd(), folderName)
  if (!existsSync(folderPath)) mkdirSync(folderPath, { recursive: true })
}

export const setupBrowser = async (
  width: number,
  height: number,
  frameRate: number,
  platform: string,
) => {
  console.log('Spinning up the browser...')

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width, height },
    args: [
      `--window-size=${width},${height}`,
      '--start-maximized'
    ]
  })
  
  const page = await browser.newPage()  
  await page.goto(`http://localhost:5173?mode=build&frame-rate=${frameRate}&platform=${platform}`)  
  await page.setViewport({ width, height })
  
  return { page, browser }
}

export const deleteAllFilesInFolder = async (folderName: string) => {
  try {
    console.log(`Deleting old files...`)
    const files = await fsP.readdir(folderName)

    const deletePromises = files
      .filter((file) => file !== '.gitignore')
      .map((file) =>
        fsP.unlink(path.join(folderName, file))
      )
    await Promise.all(deletePromises)

  } catch (error) {
    console.error(`Error deleting files in folder "${folderName}":`, error.message)
    throw error
  }
}

export const captureScreenshots = async (
  page: Page,
  totalFrames: number,
  screenshotsFolder: string
) => {
  for (let currentFrame = 0; currentFrame < totalFrames; currentFrame++) {
    const progressPercentage = Math.floor(((currentFrame + 1) / totalFrames) * 100)
    
    process.stdout.cursorTo(0)
    process.stdout.write(`Generating frames... ${progressPercentage}%`)

    await page.screenshot({
      optimizeForSpeed: false,
      // quality: 100, only applicable for jpg
      path: `${screenshotsFolder}/screenshot-${currentFrame}.png`
    })
    await page.locator('#start').click() // advance on the clip
  }
  console.log('')
}

export const createVideoFromScreenshots = (
  frameRate: number,
  screenshotFolder: string,
  outputPath: string
) => {
  console.log('Creating video...')

  return new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(`${screenshotFolder}/screenshot-%d.png`)
      .inputOptions([
        '-start_number 0',
        `-framerate ${frameRate}` // 1 frame per second, adjust as needed
      ])
      .output(outputPath)
      .outputOptions([
        '-c:v libx264', // Use H.264 codec for the video
        '-pix_fmt yuv420p', // Ensure compatibility with most players
        `-r ${frameRate}`, // frame rate
      ])
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

/**
 * Adds audio to a video file.
 * @param {string} videoPath - Path to the silent video file.
 * @param {string} audioPath - Path to the audio file.
 * @param {string} outputPath - Path for the output video with audio.
 * @returns {Promise<void>}
 */
export const addAudioToVideo = (
  videoPath: string,
  audioPath: string,
  outputPath: string
) => {
  console.log('Adding audio...')

  // fallback to process because ffmpeg-fluent had an unexpected bug
  const command = `ffmpeg -i ${videoPath} -i ${audioPath} -c:v copy -c:a aac -y ${outputPath}`;


  return new Promise((resolve, reject) => {
    // Execute the command
    exec(command, { cwd: path.resolve('./') }, (error) => {
      if (error) {
        console.error('FFmpeg execution error:', error.message)
        reject(`Error: ${error.message}`)
        return
      }

      resolve(true);
    })
  })

  // return new Promise((resolve, reject) => {
  //   const ffmpegCommand = ffmpeg()
  //     .input(videoPath) // Input the video file
  //     .input(audioPath) // Input the audio file
  //     .outputOptions('-c:v copy') // Copy the video codec to avoid re-encoding
  //     .outputOptions('-c:a aac') // Encode the audio in AAC format for compatibility

  //   // Capture the exact FFmpeg command
  //   const commandLine = ffmpegCommand._getArguments().join(' ');
  //   console.log('Full FFmpeg Command:', commandLine);

  //   ffmpegCommand
  //     .on('start', (commandLine) => {
  //       console.log('Spawned FFmpeg with command:', commandLine);
  //     })
  //     .on('end', () => {
  //       console.log('Audio added successfully');
  //       resolve(0);
  //     })
  //     .on('error', (err) => {
  //       console.error('Error adding audio:', err);
  //       console.error('FFmpeg error details:', err.message);
  //       reject(err);
  //     })
  //     .save(outputPath);

    // ffmpeg()
    // .input(videoPath) // Input the video file
    // .input(audioPath) // Input the audio file
    // .outputOptions('-c:v copy') // Copy the video codec to avoid re-encoding
    // .outputOptions('-c:a aac') // Encode the audio in AAC format for compatibility
    // // .outputOptions('-shortest') // Ensure the output duration matches the shorter input
    // .on('end', () => {
    //   console.log('Audio added successfully');
    //   resolve(0);
    // })
    // .on('error', (err) => {
    //   console.error('Error adding audio:', err.message);
    //   reject(err);
    // })
    // .save(outputPath); // Save the output video with audio
  // });
}
