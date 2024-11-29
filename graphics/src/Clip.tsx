import { useRef, useState } from 'react'
import audioClip from './assets/audios/clip.mp3'
import logo from './assets/linguoclips.svg'
import { ArrowRight, PaperclipIcon } from 'lucide-react'

// import image and podcast logo
import podcastLogo from './assets/images/dapeng.jpg'
import image1 from './assets/images/market.jpg'
import image2 from './assets/images/watermelon.jpg'
import image3 from './assets/images/angry.jpg'
import image4 from './assets/images/round.webp'

const PODCAST_NAME = 'Chinese With DaPeng'
const EPISODE_NAME = 'Daily Expression # 270 狗拿耗子 / 多管闲事'

const RAW_TRANSCRIPT = `287.055 287.275 我 wǒ
287.275 287.416 就 jiù
287.416 287.576 有 yǒu
287.576 287.936 一个 yī gè
287.936 288.256 很 hěn
288.256 288.766 挑剔 tiāo tì
288.766 288.837 的 de
288.837 289.977 朋友 péng yǒu

289.977 290.098 有 yǒu
290.098 290.518 一次 yī cì
290.518 290.778 我们 wǒ men
290.778 291.138 一起 yī qǐ
291.138 291.379 去 qù
291.379 291.799 市场 shì chǎng
291.799 291.919 里 lǐ
291.919 292.199 买 mǎi
292.199 293.5 西瓜 xī guā

293.5 294.521 在我看来 zài wǒ kàn lái
294.521 295.001 哪个 nǎ gè
295.001 295.382 西瓜 xī guā
295.382 295.542 都 dōu
295.542 295.682 不错 bù cuò

296.501 296.801 可是 kě shì
296.801 296.921 我 wǒ
296.921 297.081 的 de
297.081 297.842 朋友 péng yǒu
297.842 298.262 一定 yí dìng
298.262 298.522 要 yào
298.522 298.802 挑 tiāo
298.802 299.443 一个 yī gè

299.443 299.803 像 xiàng
299.803 300.363 足球 zú qiú
300.363 300.723 一样 yī yàng
300.723 300.943 圆 yuán
300.943 301.083 的 de
301.083 302.594 西瓜 xī guā

302.594 302.664 我 wǒ
302.664 302.824 就 jiù
302.824 302.944 跟 gēn
302.944 303.165 他 tā
303.165 304.225 说 shuō

304.225 304.605 哪有 nǎ yǒu
304.605 304.966 这种 zhè zhǒng
304.966 305.326 西瓜 xī guā
305.326 306.196 呀 ya

306.196 306.346 你 nǐ
306.346 306.706 太 tài
306.706 307.567 吹毛求疵 chuī máo qiú cī
307.567 308.717 了 le`

const RAW_TRANSLATIONS = `287.055 289.977 I have a very picky friend
289.977 293.5 One time, we went to the market together to buy a watermelon
293.5 296.501 To me, all the watermelons looked good
296.501 299.443 But my friend insisted on choosing one
299.443 302.594 that was as round as a soccer ball
302.594 304.225 I told him,
304.225 306.196 where can you even find such a watermelon?
306.196 99999 You're too nitpicky!`

const RAW_IMAGES = [
  { img: image1, start: 0 },
  { img: image2, start: 293500 },
  { img: image4, start: 299443 },
  { img: image3, start: 304225 }
]

const DICTIONARY = {
  '挑剔': { pronunciation: 'tiāo tì', translation: 'to be picky' },
  '市场': { pronunciation: 'shì chǎng', translation: 'market' },
  '挑': { pronunciation: 'tiāo', translation: 'to pick' },
  '足球': { pronunciation: 'zú qiú', translation: 'football ball' },
  '吹毛求疵': { pronunciation: 'chuī máo qiú cī', translation: 'nitpicking' }
}

const MS_CLOSING_LENGTH = 2000

// Pre-processing
const transcript = RAW_TRANSCRIPT
  .replace(/\t/g, ' ')
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
const CLIP_TOTAL_FRAMES = Math.round(CLIP_LENGTH / MS_PER_FRAME) + Math.round(MS_CLOSING_LENGTH / MS_PER_FRAME)

const backgroundImages = RAW_IMAGES.map(({img, start }, index) => ({
  img,
  start: start - OFFSET,
  end: RAW_IMAGES[index + 1] ? RAW_IMAGES[index + 1].start - OFFSET : 1_000_000 
}))

const translations = RAW_TRANSLATIONS
  .replace(/\t/g, ' ')
  .split('\n')
  .map(sentence => {
    const [start, end, ...translation] = sentence.split(' ')
    return { start: parseFloat(start) * 1000 - OFFSET, end: parseFloat(end) * 1000 - OFFSET, translation: translation.join(' ') }
  })

const Clip = () => {
  const lastIntervalId = useRef<number | null>(null)
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

  return (
    <div className='bg-black flex flex-col items-center justify-center h-screen' onClick={advanceFrame} id="start">
      <div className='relative w-full h-full overflow-hidden'>
        <div className="relative w-full h-full overflow-hidden">
          {backgroundImages.map(({ start, end, img }, index) => {
            const isActive = currentTime >= start && currentTime < end;
            const isNext = index > 0 && currentTime >= backgroundImages[index - 1].start && currentTime < backgroundImages[index - 1].end;
            
            return (
              <div
                key={index}
                className="absolute left-0 top-0 w-full h-full"
                style={{
                  opacity: isActive ? 1 : 0,
                  zIndex: isActive ? 10 : 0,
                  visibility: isActive || isNext ? 'visible' : 'hidden',
                }}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            );
          })}
        </div>
        <div className={'absolute left-8 top-8 z-50 text-red-600 ' + (IS_PREVIEW_MODE ? 'opacity-1' : 'opacity-0')} id="metadata">
          #frame: <span id="frame">{currentFrame}</span><br/>
          ms/frame: {Math.round(MS_PER_FRAME)}<br/>
          final frame: <span id="total-frames">{CLIP_TOTAL_FRAMES}</span>
        </div>
        <img src={logo} className='absolute right-[4vw] top-[4vw] z-40 w-[25vw] opacity-50' />
        <div className='absolute left-0 right-0 top-0 bottom-0 z-20 p-[4vw] flex flex-col justify-end items-start pb-[26vw]'>
          <div className='mb-[2vw] font-bold leading-snug text-white w-full'>
            {currentSegment?.tokens.map(({ start, token, pronunciation }) => (
              <div className={'inline-block p-[2vw] flex-col items-center leading-tight text-center ' + (start < currentTime ? 'bg-[#0000009d] text-white' : '')}>
                <div className={'border-b-[0.8vw] border-dashed ' + (token in DICTIONARY ? 'border-b-white' : 'border-b-transparent')}>
                  <div className="text-[9vw] font-bold">
                    {token}
                  </div>
                </div>
                {pronunciation && <div className='inline-block text-[4vw] font-thin font-mono'>{pronunciation}</div>}
              </div>
            ))}
          </div>
          {currentTranslation && <div className='text-[4vw] text-[#ffffffc1] bg-[#0000005b] p-[2vw]'>{currentTranslation}</div>}
        </div>
        <div className='absolute top-0 left-0 p-[4vw] text-white self-start z-20'>
          <div className='text-[3.5vw] mb-[2vw] flex items-center gap-[1.5vw]'><PaperclipIcon className='inline w-[4vw] h-[4vw]' /> Podcast Episode</div>
          <div className='flex gap-[4vw] items-center self-start'>
            <img src={podcastLogo} className='h-[12vw] w-[12vw] rounded-[1.5vw]' />
            <div>
              <div className='text-[4vw] font-bold'>{PODCAST_NAME}</div>
              <div className='text-[3.5vw]'>{EPISODE_NAME}</div>
            </div>
          </div>
        </div>
        {(currentTime > CLIP_LENGTH + 500) && (
          <div className='bg-[tomato] left-0 top-0 h-full w-full absolute z-30 flex items-center'>
            <div className='text-white text-center p-[8vw] leading-snug w-full'>
              <div className='grid grid-cols-[1fr_min-content_1fr] gap-[2vw] items-center mb-12'>
                {Object.keys(DICTIONARY).map(word => {
                  const { pronunciation, translation } = DICTIONARY[word as keyof typeof DICTIONARY]
                  return (
                    <>
                      <div className='flex flex-col justify-start items-start'>
                        <div className='border-b-[0.8vw] border-dashed border-b-white item-start text-[8vw] font-bold'>
                          {word}
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
        src={audioClip}  
        className="w-full hidden"
      />
    </div>
  )
}

export default Clip