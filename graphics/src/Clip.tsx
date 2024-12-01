import { useEffect, useRef, useState } from 'react'
import logo from './assets/linguoclips.svg'
import { ArrowRight, PaperclipIcon } from 'lucide-react'

import {
  LANGUAGE,
  TRANSCRIPT,
  TRANSLATION,
  PODCAST_NAME,
  EPISODE_NAME,
  DICTIONARY,
  PODCAST_LOGO,
  AUDIO,
  MEDIA
} from './input/EXAMPLE/data.ts' // <-- replace the folder name here

const MS_CLOSING_LENGTH = 2000

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
      return { start: parseFloat(start) * 1000, end: parseFloat(end) * 1000, token, pronunciation: pronunciation?.join(' ')}
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
  end: (MEDIA?.[i + 1]?.start ?? 1_000) * 1000 - OFFSET - 1,
  isVideo: ['.mp4', '.mov', '.avi', '.mkv', '.webm'].some((ext) => source.split('?')[0].endsWith(ext))
}))

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
    return { start, end: (translationsWithoutEnd?.[i + 1]?.start ?? 1_000_000) - 1, ...rest }
  })

const underlinedWords = DICTIONARY.flatMap(({ base, also }) => [base.toLowerCase(), ...(also?.map(word => word.toLowerCase()) ?? [])]) 

console.log(media)

const Clip = () => {
  const lastIntervalId = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  
  const currentTime = currentFrame * (1000 / FRAME_RATE)

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
  const currentBackground = media.find(({ start, end }) => currentTime >= start && currentTime < end)

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
                  src={currentBackground.source}
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
          </div>
        )}
        <div className={'absolute left-0 top-0 z-50 bg-[#0000004a] p-4 text-white ' + (IS_PREVIEW_MODE ? 'opacity-1' : 'opacity-0')} id="metadata">
          # frame: <span id="frame">{currentFrame}</span><br/>
          ms/frame: {Math.round(MS_PER_FRAME)}<br/>
          Total frames: <span id="total-frames">{CLIP_TOTAL_FRAMES}</span>
        </div>
        <img src={logo} className='absolute right-[4vw] top-[4vw] z-40 w-[25vw] opacity-50' />
        <div className='absolute left-0 right-0 top-0 bottom-0 z-20 p-[4vw] flex flex-col justify-end items-start pb-[26vw]'>
          <div className='mb-[4vw] font-bold leading-snug text-white w-full'>
            {currentSegment?.tokens.map(({ start, token, pronunciation }) => (
              <div style={{ padding: `${LANGUAGE === 'chinese' ? '2' : '1.2'}vw` }} className={`inline-block flex-col items-center leading-tight text-center ` + (start < currentTime ? 'bg-[#0000009d]' : '')}>
                <div className={'border-b-[0.8vw] border-dashed ' + (underlinedWords.includes(token.replace(/[。，！？,.?!]/g, '').toLowerCase()) ? 'border-b-white' : 'border-b-transparent')}>
                  <div className={`text-border`} style={{ fontSize: `${LANGUAGE === 'chinese' ? '8' : '7'}vw` }}>
                    {token}
                  </div>
                </div>
                {pronunciation && <div className='inline-block text-[4vw] font-thin font-mono'>{pronunciation}</div>}
              </div>
            ))}
          </div>
          {currentTranslation && <div className='text-[4vw] text-[#eaeaea] bg-[#0000005b] p-[2vw]'>{currentTranslation}</div>}
        </div>
        <div className='absolute top-0 left-0 p-[4vw] text-white self-start z-20'>
          <div className='text-[3.5vw] mb-[2vw] flex items-center gap-[1.5vw]'><PaperclipIcon className='inline w-[4vw] h-[4vw]' /> Podcast Episode</div>
          <div className='flex gap-[4vw] items-center self-start'>
            <img src={PODCAST_LOGO} className='h-[12vw] w-[12vw] rounded-[1.5vw]' />
            <div>
              <div className='text-[4vw] font-bold'>{PODCAST_NAME}</div>
              <div className='text-[3.5vw]'>{EPISODE_NAME}</div>
            </div>
          </div>
        </div>
        {(currentTime > CLIP_LENGTH + MS_BREATH) && (
          <div className='bg-[tomato] left-0 top-0 h-full w-full absolute z-30 flex items-center'>
            <div className='text-white text-center p-[8vw] leading-snug w-full'>
              <div className='grid grid-cols-[1fr_min-content_1fr] items-center mb-12' style={{ gap: `${LANGUAGE === 'chinese' ? 2 : 8}vw`}}>
                {DICTIONARY.map(({ base, pronunciation, translation }) => {
                  return (
                    <>
                      <div className='flex flex-col justify-start items-start'>
                        <div className={`border-b-[0.8vw] border-dashed border-b-white item-start font-bold`} style={{ fontSize: `${LANGUAGE === 'chinese' ? '8' : '6'}vw` }}>
                          {base}
                        </div>
                        {pronunciation && <div className='text-[4vw] font-thin font-mono text-center'>{pronunciation}</div>}
                      </div>
                      <div><ArrowRight className='w-[5vw] h-[5vw]' /></div>
                      <div className='text-[5vw]'>{translation}</div>
                    </>
                  )
                })}
              </div>
            </div>
            <div className='text-[5vw] absolute left-0 -rotate-3 bottom-0 w-full p-[4vw] pb-[26vw] text-white text-center'>
              <b>Subscribe</b> for more clips!
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