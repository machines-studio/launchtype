import './poster.scss'
import { $ } from '@tooooools/ui/state'
import Poster from '/components/Poster'
import { $listen } from '/controllers/WebSocket'

const PAROLES = Object.entries(import.meta.glob('@assets/paroles/**/*.json', { eager: true })) // WIP

const Store = {
  $playing: $(false),
  $parole: $(PAROLES[0][1]),
  $showWordsBbox: $(false),

  // Controlled by pads
  $brushIntensity: (null),
  $brushRadius: $(null),
  $brushShape: $(null),
  $fontColor: $(null),
  $fontSize: $(null),
  $fontFamily: $(null),
  $multA: $(1),
  $multB: $(1)
}

const patch = {
  /* Your variables here */
  pad1: $([$listen('pad[0].x'), $listen('pad[0].y')], ([x, y]) => [x ?? 0, y ?? 0]),
  pad2: $([$listen('pad[1].x'), $listen('pad[1].y')], ([x, y]) => [x ?? 0, y ?? 0])
}

export default () => (
  <main
    id='poster'
    class={{
      'is-loading': WebSocket.$connected
    }}
  >
    <Poster
      playing={Store.$playing}
      parole={Store.$parole}
      patch={patch}
      showWordsBbox={Store.$showWordsBbox}
      brushIntensity={Store.$brushIntensity}
      brushRadius={Store.$brushRadius}
      brushShape={Store.$brushShape}
      fontColor={Store.$fontColor}
      fontSize={Store.$fontSize}
      fontFamily={Store.$fontFamily}
    />
  </main>
)
