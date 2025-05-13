import ADSR from '/controllers/ADSR'

export const name = 'gluten-leger-tourne'
export { default as style } from './gluten-leger-tourne.module.scss'

export const adsr = ADSR({
  '--wght': [1000],
  rotate: ['180deg'],
  attack: { duration: 500, ease: 'inOutSin' },
  decay: { duration: 300, ease: 'inSine' },
  release: { duration: 5000, ease: 'outBack' }
  //TODO
})
