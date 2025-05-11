import ADSR from '/controllers/ADSR'
import { S, M, L, AUTO, left, right, center } from '/components/Poster'

export { default as style } from './60-comp-gluten-S.module.scss'

export const name = '30-comp-tilt-S'

export const effects = {
  fat: ADSR({
    '--wght': [400],
    'letter-spacing': ['-3vw'],
    'color': ['#FFF'],
    attack: { duration: 800, ease: 'outExpo' },
    decay: { duration: 0, ease: 'inSine' },
    release: {duration: 500, ease: 'outBounce' }
  })
}

export const layout = [
  L([center('fat')]),
  L([center('fat')]),
  L([center('fat')]),
  L([center('fat')]),
  L([center('fat')]),
  L([center('fat')]),
  L([center('fat')]),
  AUTO([center('pan')], { class: 'banner' })
]
