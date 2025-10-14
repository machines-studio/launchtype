import './poster.scss'
import { $ } from '@tooooools/ui/state'
import Poster from '/components/Poster'
import { $listen } from '/controllers/WebSocket'
import { map } from 'missing-math'

const store = {
  $parole: $listen('parole'),
  $fontSize: $($listen('pad[0].x', 0), v => map(v, -1, 1, 10, 30))
}

const patch = {
  /* Your variables here */
  x1: $listen('pad[0].x', 0),
  y1: $listen('pad[0].y', 0),
  x2: $listen('pad[1].x', 0),
  y2: $listen('pad[1].y', 0)
}

export default () => (
  <main
    id='poster'
    class={[{ 'is-loading': WebSocket.$connected }]}
  >
    <Poster
      showWords
      patch={patch}
      fontSize={store.$fontSize}
      parole={$(store.$parole, p => p?.transcript)}
    />
  </main>
)
