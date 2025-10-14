import './poster.scss'
import { $ } from '@tooooools/ui/state'
import Poster from '/components/Poster'
import { $listen } from '/controllers/WebSocket'
import { map } from 'missing-math'

const store = {
  $parole: $listen('parole'),

  // Controlled by pads
  // $brushIntensity: (null),
  // $brushRadius: $(null),
  // $brushShape: $(null),

  $fontSize: $($listen('pad[0].x', 0), v => map(v, -1, 1, 10, 30)),
  $multA: $listen('pad[0].x', 0),
  $multB: $listen('pad[0].x', 0)
}

const patch = {
  /* Your variables here */
  pad1: $([$listen('pad[0].x'), $listen('pad[0].y')], ([x, y]) => [x ?? 0, y ?? 0]),
  pad2: $([$listen('pad[1].x'), $listen('pad[1].y')], ([x, y]) => [x ?? 0, y ?? 0]),

  // TODO
  // gradients: $([
  //   store.$multA,
  //   store.$multB,
  // ], ([multA, multB]) => JSON.stringify({
  //   multA,
  //   multB,
  // }))
}

export default () => (
  <main
    id='poster'
    class={[{
      'is-loading': WebSocket.$connected
    }]}
  >
    <Poster
      showWords
      patch={patch}
      fontSize={store.$fontSize}
      parole={$(store.$parole, p => p?.transcript)}
    />
  </main>
)
