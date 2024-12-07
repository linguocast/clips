import { useEffect, useRef, useState } from 'react'
import logo from './assets/linguoclips.svg'
import { PaperclipIcon } from 'lucide-react'

import {
  LANGUAGE,
  TRANSCRIPT,
  TRANSLATION,
  PODCAST_NAME,
  EPISODE_NAME,
  DICTIONARY,
  PODCAST_LOGO,
  AUDIO,
  MEDIA,
  FLAG
} from './input/CN_dapeng_ganggang_A/data.ts' // <-- replace the folder name here
import { animate, popAnimation } from './animations.tsx'
import LoadingRing from './ui/loading-ring.ui.tsx'

const MS_CLOSING_LENGTH = 3000
const IMG_INITIAL_SCALE = .2
const easingFunction = (x: number): number => {
  return -(Math.cos(Math.PI * (x < 0 ? 0 : (x > 1 ? 1 : x ))) - 1) / 2
}

// Pre-processing
const transcript = TRANSCRIPT
  .trim()
  .replace(/\r/g, '')
  .replace(/\t/g, ' ')
  .replace(/ +/g, ' ')
  .split('\n\n')
  .map((segment) => {
    const segmentTokens = segment
    .split('\n')
    .map(line => {
      const [start, end, token, ...pronunciation] = line.split(' ')
      return { start: parseFloat(start) * 1000, end: parseFloat(end) * 1000, token: token.replace(/_/g, ' '), pronunciation: pronunciation?.join(' ')}
    })
    return {
      start: segmentTokens[0].start,
      end: segmentTokens[segmentTokens.length -1].end,
      tokens: segmentTokens
    }
  })

const OFFSET =  transcript[0].start // the start of the first token
const CLIP_LENGTH = transcript[transcript.length - 1].end - OFFSET // the first number is the end time of the last token
const MS_BREATH = 1000

for (let i = 0; i < transcript.length; i++) {
  transcript[i].start -= OFFSET
  if (transcript[i + 1]?.start) {
    transcript[i].end = transcript[i + 1].start - OFFSET
  } else {
    transcript[i].end = 9999999
  }
  for (const token of transcript[i].tokens) {
    token.start = token.start - OFFSET
    token.end = token.end - OFFSET
  }
}

const urlParams = new URLSearchParams(window.location.search);

const rawFrameRate = urlParams.get('frame-rate')

const IS_PREVIEW_MODE = (urlParams.get('mode')?.toLowerCase() ?? 'preview') === 'preview' 
const FRAME_RATE = rawFrameRate ? parseInt(rawFrameRate) : 30
const MS_PER_FRAME = 1000 / FRAME_RATE // in ms, the longer the more time to capture the frame
const CLIP_TOTAL_FRAMES = Math.round((CLIP_LENGTH + MS_BREATH + MS_CLOSING_LENGTH) / MS_PER_FRAME)

const media = MEDIA.map(({ source, start }, i) => ({
  source,
  start: (start * 1000) - OFFSET,
  end: MEDIA?.[i + 1]?.start ? MEDIA?.[i + 1].start * 1000 - OFFSET - 1 : CLIP_LENGTH + MS_BREATH + 1000,
  isVideo: ['.mp4', '.mov', '.avi', '.mkv', '.webm'].some((ext) => source.split('?')[0].endsWith(ext))
}))

// console.log({ transcript, translations })

const translationsWithoutEnd = TRANSLATION
  .trim()
  .replace(/\r/g, '')
  .replace(/\t/g, ' ')
  .replace(/ +/g, ' ')
  .split('\n')
  .map(sentence => {
    const [start, ...translation] = sentence.split(' ')
    return { start: parseFloat(start) * 1000 - OFFSET, translation: translation.join(' ') }
  })

  const translations = translationsWithoutEnd
  .map(({ start, ...rest }, i) => {
    return { start, end: (translationsWithoutEnd?.[i + 1]?.start ?? 1_000_000), ...rest }
  })

const underlinedWords = DICTIONARY.flatMap(({ base, also }) => [base.toLowerCase(), ...(also?.map(word => word.toLowerCase()) ?? [])]) 

const Clip = () => {
  const lastIntervalId = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  
  const currentTime = currentFrame * (1000 / FRAME_RATE)
  const prevFrameTime = (currentFrame - 1) * (1000 / FRAME_RATE)

  const audioRef = useRef<HTMLAudioElement>(null);

  const playAudio = async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      await audioRef.current.play()
    }
  }

  const advanceFrame = () => {
    if (IS_PREVIEW_MODE) {
      setCurrentFrame(0)
      if (lastIntervalId.current) clearInterval(lastIntervalId.current)
      lastIntervalId.current = setInterval(() => {
        setCurrentFrame(f => f + 1)
      }, MS_PER_FRAME)
      playAudio()
    } else {
      setCurrentFrame(f => f + 1)
    }
  }

  const currentSegment = transcript.find(({ start, end }) => currentTime >= start && currentTime < end)
  const currentTranslation = translations.find(({ start, end }) => currentTime >= start && currentTime < end)?.translation
  
  
  const previousBackground = media.find(({ start, end }) => prevFrameTime >= start && prevFrameTime < end)
  const currentBackground = media.find(({ start, end }) => currentTime >= start && currentTime < end)

  const requestDelay = currentBackground !== previousBackground
  
  const scale = currentBackground ? 1 + IMG_INITIAL_SCALE * easingFunction(1 - ((currentTime - currentBackground.start) / (currentBackground?.end - currentBackground.start))) : NaN

  useEffect(() => {
    if (videoRef.current && currentBackground) {
      videoRef.current.currentTime = (currentTime - currentBackground.start) / 1000
    }
  }, [currentBackground, currentTime])

  return (
    <div className='bg-black flex flex-col items-center justify-center h-screen' onClick={advanceFrame} id="start">
      <div className='relative w-full h-full overflow-hidden'>
        {currentBackground && (
          <div className="relative w-full h-full overflow-hidden background-layer">
            <div
              className="absolute left-0 top-0 w-full h-full"
            >
              {currentBackground.isVideo && (
                <video
                  id="video"
                  ref={videoRef}
                  className="w-full h-full object-cover object-center"
                  muted
                  src={currentBackground.source}
                  autoPlay={false}
                >
                </video>
              )}
              {!currentBackground.isVideo && (
                <img
                  style={{ transform: `scale(${scale})` }}
                  src={currentBackground.source}
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
          </div>
        )}
        <div className={'absolute left-0 top-0 z-50 bg-[#0000004a] p-4 text-white ' + (IS_PREVIEW_MODE ? 'opacity-1' : 'opacity-0')} id="metadata">
          Time (ms): <span id="frame">{Math.ceil(currentTime)}</span><br/>
          # frame: <span id="frame">{currentFrame}</span><br/>
          ms/frame: {Math.round(MS_PER_FRAME)}<br/>
          Total frames: <span id="total-frames">{CLIP_TOTAL_FRAMES}</span><br />
          Delay frame: <span id="delay">{requestDelay ? 'true' : 'false'}</span>
        </div>
        <div className='absolute left-0 right-0 top-0 bottom-0 z-20 p-[4vw] flex flex-col justify-end items-center pb-[26vw]'>
          <img src={logo} className='w-[35vw] mb-[4vw] opacity-50' />
          <div className='mb-[4vw] font-bold leading-snug text-white w-full flex flex-wrap justify-center'>
            {currentSegment?.tokens.map(({ start, token, pronunciation }) => (
              <div style={{ padding: `${LANGUAGE === 'chinese' ? '1' : '1.2'}vw` }} className={`inline-block flex-col items-center leading-tight text-center `}>
                <div className={(underlinedWords.includes(token.replace(/[。，！？,.?!]/g, '').toLowerCase()) ? 'text-[tomato]' : 'border-b-transparent')}>
                  <div
                    className={`text-border`}
                    style={{
                      fontSize: `${LANGUAGE === 'chinese' ? '8' : '7'}vw`,
                      transform: `scale(${popAnimation(start, currentTime, 1.4, 250)})`
                    }}
                  >
                    {token}
                  </div>
                </div>
                {pronunciation && <div className='inline-block text-[4vw] font-thin font-mono'>{pronunciation}</div>}
              </div>
            ))}
          </div>
          {currentTranslation && <div className='text-[4vw] text-[#eaeaea] text-center bg-[#0000005b] px-[4vw] py-[2vw] rounded-[1vw]'>{currentTranslation}</div>}
        </div>
        <div className='absolute top-0 left-0 p-[4vw] text-white self-start z-20'>
          <div className='text-[3.5vw] mb-[3vw] flex items-center gap-[1.5vw]'>
            <PaperclipIcon className='inline w-[4vw] h-[4vw]' />
            New Podcast Episode
          </div>
          <div className='flex gap-[4vw] items-center self-start'>
            <div className='relative h-[15vw] w-[15vw] shrink-0'>
              <img src={PODCAST_LOGO} className='h-full w-full rounded-[1.6vw]' />
              <img className="absolute -bottom-[1.5vw] -right-[1.5vw] w-[8vw] h-[8vw]" src={FLAG} />
            </div>
            <div className='flex flex-col'>
              <div className='text-[5vw] font-bold line-clamp-1'>{PODCAST_NAME}</div>
              <div className='text-[4vw] line-clamp-1'>{EPISODE_NAME}</div>
            </div>
          </div>
        </div>
        {(currentTime > CLIP_LENGTH) && (
          <div className='left-0 top-0 h-full w-full absolute z-30 flex'>
            <div
              className='bg-[#212121] absolute left-0 top-0 w-full h-full'
              style={{ opacity: animate(0, 1, CLIP_LENGTH + MS_BREATH + 100, currentTime, 200)}}
            />
            <div
              className='text-white p-[4vw] absolute left-0 top-0 leading-snug w-full'
            >
              <div
                className='mb-[4vw] flex gap-[3vw] items-center text-[3.5vw]'
                style={{
                  opacity: animate(0, 1, CLIP_LENGTH + MS_BREATH + 300, currentTime, 150)
                }}
              >
                <LoadingRing
                  percentage={100 - ((currentTime - CLIP_LENGTH - MS_BREATH) / MS_CLOSING_LENGTH) * 100}
                  radius="3vw"
                  strokeWidth="1vw"
                />
                Challenging Words
              </div>
              <div
                className='grid grid-cols-2 items-center gap-[4vw]'
                style={{
                  transform: `scale(${popAnimation(CLIP_LENGTH + MS_BREATH, currentTime, 3, 250)})`,
                  opacity: animate(0, 1, CLIP_LENGTH + MS_BREATH, currentTime, 250)
                }}
              >
                {DICTIONARY.map(({ base, pronunciation, translation }) => {
                  return (
                    <>
                      <div className='p-[4vw] flex flex-col text-center justify-start items-center bg-[#3f3f3f] rounded-[.6vw] overflow-hidden'>
                        <div className={`item-end font-bold text-[tomato] text-border `} style={{ fontSize: `${LANGUAGE === 'chinese' ? '8' : '6'}vw` }}>
                          {base}
                        </div>
                        {pronunciation && <div className='text-[4vw]  font-mono  opacity-50'>{pronunciation}</div>}
                        <div className='text-[5vw] mt-[2vw] opacity-50'>{translation}</div>
                      </div>
                    </>
                  )
                })}
              </div>
              <div
                className='leading-[10vw] text-[4vw] bottom-0 w-full p-[4vw] mt-[6vw] text-white text-center'
                style={{
                  transform: `scale(${animate(4, 1, CLIP_LENGTH + MS_BREATH + MS_CLOSING_LENGTH / 2, currentTime, 150)})`,
                  opacity: animate(0, 1, CLIP_LENGTH + MS_BREATH  + MS_CLOSING_LENGTH / 2, currentTime, 150),
                  rotate: `${animate(10, -3, CLIP_LENGTH + MS_BREATH  + MS_CLOSING_LENGTH / 2, currentTime, 150)}deg`
                }}
              >
                <span className='wavy font-bold'>Subscribe</span> for more<br />
                <div className='flex gap-[2vw] justify-center'>
                  <img className="w-[9vw] h-[9vw]" src={FLAG} />
                  <img src={logo} className="w-[40vw]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <audio
        ref={audioRef}
        src={AUDIO}  
        className="w-full hidden"
      />
    </div>
  )
}

export default Clip