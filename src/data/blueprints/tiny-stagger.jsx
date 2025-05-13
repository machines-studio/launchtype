import ADSR from '/controllers/ADSR'
import {stagger} from 'animejs'

export const name = 'tiny-stagger'
export { default as style } from './tiny-stagger.module.scss'


const randomDeg = () => Math.floor(Math.random() * 360) + 'deg'

export const adsr = ADSR({
  '--wght': [200],
  //'letterSpacing': ['-0.25em'],
  //rotate: [randomDeg()],
  attack: {delay:stagger(50), duration: 800, ease: 'outExpo' },
  decay: { duration: 300, ease: 'inSine' },
  release: { duration: 5000, ease: 'outBack' }
})

export const selector = "span";
