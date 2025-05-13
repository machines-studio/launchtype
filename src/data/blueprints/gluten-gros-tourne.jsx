import ADSR from '/controllers/ADSR'

export const name = 'gluten-gros-tourne'
export { default as style } from './gluten-gros-tourne.module.scss'

export const adsr = ADSR({
  '--wght': [400],
  rotate: ['180deg'],
  attack: { duration: 500, ease: 'inOutExpo' },
  decay: { duration: 0, ease: 'inSine' },
  release: { duration: 5000, ease: 'inOutBack' }
  //TODO
})
