import ADSR from '/controllers/ADSR'
import { S, M, L, AUTO, left, right, center } from '/components/Poster'

export { default as style } from './example-1.module.scss'

export const name = 'Exemple #1'

export const effects = {
  color: ADSR({
    color: ['rgb(0, 0, 255)', 'rgb(255, 0, 0)'],
    scale: [2, 0.1],
    attack: { duration: 1000, ease: 'outExpo' },
    decay: { duration: 3000, ease: 'inSine' },
    release: { duration: 800, ease: 'outBounce' }
  }),

  pan: ADSR({
    x: ['-100%', '-100%'],
    attack: { duration: 10000, ease: 'outExpo' },
    release: { duration: 800, ease: 'inSine' }

  })
}

export const layout = [
  S([left('color', 'span'), right('color')]),
  S([left('color', 'span'), right('color')]),
  S([left('color', 'span'), right('color')]),
  S([left('color', 'span'), right('color')]),
  S([left('color', 'span'), right('color')]),
  S([left('color', 'span'), right('color')]),
  S([left('color', 'span'), right('color')]),
  M([left('color'), center('color'), right('color')]),
  L([left('color'), right('color')]),
  AUTO([left('pan')], { class: 'black' }),
  S([left('color'), right('color')]),
]
