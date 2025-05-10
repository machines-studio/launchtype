import { stagger } from 'animejs'
import ADSR from '/controllers/ADSR'
import { AUTO, S, M, left } from '/components/Poster'
import shuffle from '/utils/array-shuffle'

export { default as style } from './scanlines.module.scss'
export const name = 'pixels'

// Quick and dirty seedable prng
let seed = 3
const prng = () => (Math.sin(++seed * 1337) + 1) / 2

export const effects = {
  unscan: ADSR({
    '--scan': [0, 50],
    '--bled': [0],
    '--word-length': [0],
    '--scale': [1, 0.3],
    color: [undefined, 'rgb(255, 255, 255)'],
    attack: { duration: 100, ease: 'linear' },
    decay: { duration: 1000, ease: 'inBounce' },
    release: { duration: 1_000, ease: 'outElastic', delay: stagger(50) }
  })
}

export const layout = shuffle([
  ...new Array(8).fill(true).map(() => S([left('unscan', 'span')])),
  ...new Array(6).fill(true).map(() => M([left('unscan', 'span')])),
  AUTO(left('unscan', 'span'))
], prng)
