import ADSR from '/controllers/ADSR'

export const name = 'gluten'
export { default as style } from './gluten.module.scss'

export const adsr = ADSR({
  '--wght': [400],
  rotate: ['90deg'],
  attack: { duration: 100, ease: 'outExpo' },
  decay: { duration: 0, ease: 'inSine' },
  release: { duration: 10_000, ease: 'outBounce' }
})
