import './pads.scss'
import { $broadcast } from '/controllers/WebSocket'
import Pad from '/components/Pad'

const x1 = $broadcast('pad[0].x', 0)
const y1 = $broadcast('pad[0].y', 0)
const x2 = $broadcast('pad[1].x', 0)
const y2 = $broadcast('pad[1].y', 0)

export default () => (
  <main id='pads'>
    <Pad
      trail='#8a80d7'
      maps={[
        { value: x1, src: '/pad-maps/norm-x.png', mode: 'value', range: [-1, 1] },
        { value: y1, src: '/pad-maps/norm-y.png', mode: 'value', range: [-1, 1] }
      ]}
    />

    <Pad
      trail='#52d685'
      maps={[
        { value: x2, src: '/pad-maps/norm-x.png', mode: 'value', range: [-1, 1] },
        { value: y2, src: '/pad-maps/norm-y.png', mode: 'value', range: [-1, 1] }
      ]}
    />
  </main>
)
