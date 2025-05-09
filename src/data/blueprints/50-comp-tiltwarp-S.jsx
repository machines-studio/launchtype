import ADSR from '/controllers/ADSR'
import { S, M, L, AUTO, left, right, center } from '/components/Poster'

export { default as style } from './50-comp-tiltwarp-S.module.scss'

export const name = '30-comp-tilt-S'

export const effects = {
  fat: ADSR({
    '--yrot': [-45],
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
  S([left('fat'), right('fat')]),
  S([left('fat'), right('fat')]),
  S([left('fat'), right('fat')]),
  S([left('fat'), right('fat')]),
  S([left('fat'), right('fat')]),
  S([left('fat'), right('fat')]),
  M([left('fat'), right('fat')]),
  L([center('fat')]),
  AUTO([center('pan')], { class: 'banner' })
]
