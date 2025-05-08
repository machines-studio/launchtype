/* global __VERSION__ */

import '/test/test.scss'

import { render } from '@tooooools/ui'
import ADSR from '/controllers/ADSR'
import { stagger } from 'animejs'

console.log('Hello from test.jsx')
console.log(`${__VERSION__}-${import.meta.env.MODE}`)

render(
  <main>
    {
      [
        'hello',
        'world'
      ].map(string => (
        <h1
          event-mousedown={start}
          event-touchstart={start}
          event-mouseup={release}
          event-touchend={release}
          event-mouseleave={destroy}
        >
          {string.split('').map(c => <span innerText={c} />)}
        </h1>
      ))
    }
  </main>
)

const adsr = ADSR({
  color: [0, 'rgb(255, 0, 0)'],
  y: [-50, 0],
  letterSpacing: [0, '20px'],

  attack: { duration: 100, ease: 'outExpo' },
  decay: { duration: 300, delay: 100, ease: 'inSine' },
  release: { duration: 800, ease: 'outBounce', delay: stagger(20, { ease: 'inOut(3)' }) }
})

function start (e) {
  e.preventDefault()
  adsr.start(e.currentTarget, 'span')
}

function release (e) {
  adsr.stop(e.currentTarget, 'span')
}

function destroy (e) {
  e.currentTarget.adsr?.destroy()
}
