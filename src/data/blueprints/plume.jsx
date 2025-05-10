import { stagger } from 'animejs'
import ADSR from '/controllers/ADSR'
import { M, L, AUTO, left, right } from '/components/Poster'

export { default as style } from './plume.module.scss'
export const name = 'plume'

export const effects = {
  evaporate: ADSR({
    '--blur': ['10px'],
    opacity: [0],
    attack: { duration: 1000, ease: 'inSine' },
    release: { duration: 10_000, ease: 'outExpo' }
  }),

  fade: ADSR({
    '--blur': ['4px'],
    opacity: [0, 1],
    attack: { duration: 100, ease: 'inSine' },
    release: { duration: 10_000, delay: stagger(100), ease: 'outExpo' }
  })
}

export const layout = [
  L([left('evaporate'), right('evaporate')]),
  L([left('evaporate'), right('evaporate')]),
  L([left('evaporate'), right('evaporate')]),
  AUTO(undefined, { class: 'gradient' }),
  M([left('fade', 'span'), right('fade', 'span')]),
  M([left('fade', 'span'), right('fade', 'span')]),
  M([left('fade', 'span'), right('fade', 'span')]),
  M([left('fade', 'span'), right('fade', 'span')])
]
