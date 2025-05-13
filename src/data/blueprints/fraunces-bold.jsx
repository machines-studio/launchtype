import ADSR from '/controllers/ADSR'
import {stagger} from 'animejs'

export const name = 'fraunces-bold'
export { default as style } from './fraunces-bold.module.scss'


const randomDeg = () => Math.floor(Math.random() * 360) + 'deg'

export const adsr = ADSR({
  '--wght': [300],
  //'--blurLetter': [0],
  'letterSpacing': ['.025em'],
  //rotate: [randomDeg()],
  //attack: {delay:stagger(25), duration: 500, ease: 'outExpo' },
  attack: {duration: 500, ease: 'outExpo' },
  decay: { duration: 300, ease: 'inSine' },
  release: { duration: 5000, ease: 'outBack' }
})

export const selector = "span";
