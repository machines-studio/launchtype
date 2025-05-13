import ADSR from '/controllers/ADSR'

export const name = 'tiny'
export { default as style } from './tiny.module.scss'


const randomDeg = () => Math.floor(Math.random() * 360) + 'deg'

export const adsr = ADSR({
  '--wght': [200],
  //'letterSpacing': ['-0.25em'],
  //rotate: [randomDeg()],
  attack: { duration: 500, ease: 'outExpo' },
  decay: { duration: 300, ease: 'inSine' },
  release: { duration: 5000, ease: 'outBack' }
})


