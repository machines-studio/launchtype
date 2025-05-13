import ADSR from '/controllers/ADSR'

export const name = 'gluten-leger-gras'
export { default as style } from './gluten-leger-gras.module.scss'

export const adsr = ADSR({
  '--wght': [1000],
  '--ital': [-45],
  //rotate: ['180deg'],
  attack: { duration: 500, ease: 'inOutExpo' },
  decay: { duration: 0, ease: 'inSine' },
  release: { duration: 2500, ease: 'inOutBack' }
  //TODO
})
