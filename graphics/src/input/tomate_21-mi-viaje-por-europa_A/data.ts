import { Dictionary } from '../../types'

// 1) Adjust the language. This will affect the styles.
export const LANGUAGE: string = 'spanish'

// 2) Adjust the name of the podcast, and be consistent
export const PODCAST_NAME = 'Tomate 🍅'

// 3) Copy the cover image of the podcast and paste it in this folder, then adjust the name if necessary.
import PODCAST_LOGO from './logo.jpg'

// 4) Adjust the episode's title, and be consistent from here on.
export const EPISODE_NAME = '#21 Mi viaje por Europa'

/*
  5) Copy the desired part of the transcript in the transcript.txt file.
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
  6) This are the translations that will show below the target language text.
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
  7) Select the images from the web (you can use https://unsplash.com/ or others)
  Place the image files in the images folder and import them here.
*/
import image1 from './images/couchsurfing.png'
import image2 from './images/comunity.webp'
import image3 from './images/travelerCrisp.jpg'
import image4 from './images/home.jpg'
import image6 from './images/surfing.jpg'

/*
  7) Then, set their start time
  I recommend to set the same start as the translations so it does not change in the middle of a sentence.
*/
export const IMAGES = [
  { img: image1, start: 641.718 },
  { img: image2, start: 646.47 },
  { img: image3, start: 649.462 },
  { img: image4, start: 656.99 },
  { img: image6, start: 665.214 }
]

/*
  8) Here it is the dictionary that will show at the end of the clip, and the words will show underlined.
  the base is the word that will show, you can add pronunciation, but probably only fmake sense for Chinese
  the also property, that is a list of words 
*/
export const DICTIONARY: Dictionary[] = [
  { base: 'comunidad', translation: 'comunity' },
  { base: 'hospedar', also: ['hospedarte', 'hospedo', 'hospedarse'], translation: 'to host' },
  { base: 'conmigo', translation: 'with me' },
  { base: 'definir', also: ['definirla'], translation: 'to define' },
  { base: 'viajero', also: ['viajeros'], translation: 'traveler' }
]

/*
  9) this is the audio file of the clip, extracted from the original podcast audio file.
  For now you need to generate it. I recommend the online tool [Mp3cut](https://mp3cut.net/).
  save the audio file in the folder and adjust the name if neccesary.
*/
import AUDIO from './audio.mp3'

// 10) Save the file! Congrats you made it this far!
export { PODCAST_LOGO, TRANSCRIPT, TRANSLATION, AUDIO }




