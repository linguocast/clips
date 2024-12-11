import { Dictionary, Language, Variant } from '../../types'

/*
  1) Adjust the language and variant. This will affect the styles.
  Use null for variant is does not apply.
*/
export const LANGUAGE: Language = 'spanish'
export const VARIANT: Variant = null

// 2) Adjust the name of the podcast, and be consistent
export const PODCAST_NAME = 'Tomate 🍅'

// 3) Import the rounded flag from the assets/flag folder.
import FLAG from '../../assets/flags/spanish.svg'

// 4) Copy the cover image of the podcast and paste it in this folder, then adjust the name if necessary.
import PODCAST_LOGO from './logo.jpg'

// 5) Adjust the episode's title, and be consistent from here on.
export const EPISODE_NAME = '#21 Mi viaje por Europa'

/*
  6) Copy the desired part of the transcript in the transcript.txt file.
  Notice the format (and how elements  are separated by a space or tab):

  [START_IN_SEC] [END_IN_SEC] [TOKEN] [PRONUNCIATION]

  example:
  646.47  647.038 podríamos

  Pronunciation is optional, probably it only make sense for Chinese
  
  The sentences are separated by a double return like this:

  646.47  647.038 podríamos
  647.094 647.582 definirla
  647.606 647.838 así
                            <-- Double return here
  647.894 648.038 es
  648.054 648.254 también
  648.302 648.486 una
  648.518 649.374 plataforma

  These are shown separated as two sentences.
*/
import TRANSCRIPT from './transcript.txt?raw'

/*
  7) This are the translations that will show below the target language text.
  For each sentence of the transcript (the ones separated by 2 returns),
  translate the text and copy it with the format
  
  [START_IN_SEC] [TRANSLATION]

  example:
  646.47 we could define it like that

  The start time should coincide with the start of the sentence in the
  transcript, and there should be one translation line for each sentence in the
  transcript.
*/
import TRANSLATION from './translation.txt?raw'

/*
  8) Select the media (images or videos) from the web.

  Platforms to look for free resources:
    https://unsplash.com/
    https://www.pexels.com/
    https://www.videvo.net/
    https://www.freepik.com
    https://www.pixelbay.com
    https://mixkit.co/
    https://mixkit.co
    https://dareful.com
    https://coverr.co
    https://www.vidsplay.com

  Place the media files in the media folder and import them here.
*/
import image1 from './media/couchsurfing.png'
import video1 from './media/doggy.mp4'
import image2 from './media/travelerCrisp.jpg'
import image3 from './media/home.jpg'
import image4 from './media/surfing.jpg'

/*
  9) Then, set their start time
  I recommend to set the same start as the translations so it does not change in the middle of a sentence.
*/
export const MEDIA = [
  { source: image1, start: 641.718 },
  { source: video1, start: 646.47 },
  { source: image2, start: 649.462 },
  { source: image3, start: 656.99 },
  { source: image4, start: 665.214 }
]

/*
  10) Here it is the dictionary that will show at the end of the clip, and the words will show underlined.
  the base is the word that will show, you can add pronunciation, but probably only fmake sense for Chinese
  the also property, that is a list of words 
*/
export const DICTIONARY: Dictionary[] = [
  { base: 'comunidad', translation: 'community' },
  { base: 'hospedar', also: ['hospedarte', 'hospedo', 'hospedarse'], translation: 'to host' },
  { base: 'conmigo', translation: 'with me' },
  { base: 'definir', also: ['definirla'], translation: 'to define' },
  { base: 'viajero', also: ['viajeros'], translation: 'traveler' }
]

/*
  11) this is the audio file of the clip, extracted from the original podcast audio file.
  For now you need to generate it. I recommend the online tool [Mp3cut](https://mp3cut.net/).
  save the audio file in the folder and adjust the name if neccesary.
*/
import AUDIO from './audio.mp3'

// 12) A general offset to adjust the transcript, translations and video with the audio.
export const GENERAL_OFFSET_MS = 0

// 13) Save the file! Congrats you made it this far!
export { PODCAST_LOGO, TRANSCRIPT, TRANSLATION, AUDIO, FLAG }




