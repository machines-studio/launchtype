import ADSR from '/controllers/ADSR'
import { S, M, L, AUTO, left, right, center } from '/components/Poster'

const color = ADSR({
  color: ['rgb(0, 0, 255)', 'rgb(255, 0, 0)'],
  // scale: [2, 0.1],
  attack: { duration: 100, ease: 'outExpo' },
  decay: { duration: 3000, ease: 'inSine' },
  release: { duration: 800, ease: 'outBounce' }
})

export const name = 'Exemple #2'
export const effects = { color }
export const layout = [
  L([left('color'), right('color')]),
  AUTO([center('color')], { class: 'black' }),
  S([left('color'), right('color')]),
]
