import ADSR from '/controllers/ADSR'
import {stagger} from 'animejs'

export const name = 'gluten-leger-tourne'
export { default as style } from './gluten-leger-tourne.module.scss'

export const adsr = ADSR({
  '--wght': [1000],
  rotate: ['360deg'],
  //rotate: [stagger(['20deg','300deg'])],
  attack: {delay:stagger(25,{from: 'center'}), duration: 300, ease: 'inOutSin' },
  decay: { duration: 300, ease: 'inSine' },
  release: { duration: 1000, ease: 'outBack' }
  //TODO
})

export const selector = "span";