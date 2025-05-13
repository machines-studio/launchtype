import ADSR from '/controllers/ADSR'

export const name = 'sixtyfour'
export { default as style } from './sixtyfour.module.scss'


const randomDeg = () => Math.floor(Math.random() * 360) + 'deg'

export const adsr = ADSR({
  '--wght': [1000],
  rotate: [randomDeg()],
  attack: { duration: 500, ease: 'inOutSin' },
  decay: { duration: 300, ease: 'inSine' },
  release: { duration: 5000, ease: 'outBack' }
  //TODO
})
