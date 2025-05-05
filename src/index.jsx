/* global __VERSION__ */

import '/index.scss'

import { render } from '@tooooools/ui'
import { writable } from '@tooooools/ui/state'
import { Range } from '@tooooools/ui/components'
import Nut from '/components/Nut'

console.log(`${__VERSION__}-${import.meta.env.MODE}`)

const speed = writable(1)

render(
  <main id='App'>
    <Nut speed={speed} />
    <Range
      class='speed-range'
      store-value={speed}
      min={0}
      max={2}
      step={0.1}
    />
  </main>
)
