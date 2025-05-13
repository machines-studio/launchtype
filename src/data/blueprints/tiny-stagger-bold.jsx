import ADSR from '/controllers/ADSR'
import {stagger} from 'animejs'

export const name = 'tiny-stagger-bold'
export { default as style } from './tiny-stagger-bold.module.scss'


const randomDeg = () => Math.floor(Math.random() * 360) + 'deg'

export const adsr = ADSR({
  '--wght': [50],
  //'letterSpacing': ['-0.25em'],
  //rotate: [randomDeg()],
  attack: {delay:stagger(50), duration: 500, ease: 'outExpo' },
  decay: { duration: 300, ease: 'inSine' },
  release: { duration: 5000, ease: 'outBack' }
})

export const selector = "span";
