/* global __VERSION__, localStorage */
import '/test/test.scss'

import { render } from '@tooooools/ui'
import App from '/components/App'

const BLUEPRINTS = Object.values(import.meta.glob('/data/blueprints/*.jsx', { eager: true }))

// Disable localStorage
localStorage.setItem(window.location.pathname + '__app.words', '')

// Render app and a special #test marker
window.app = render(<App />).components[0]
render(<div id='test' innerText={`${__VERSION__}-${import.meta.env.MODE}`}/>)

// Set your blueprint here
window.app.state.blueprint.set(BLUEPRINTS[0])

// Define [word, cellIndex] couples
for (const [word, cellIndex] of [
  ['il', 1],
  ['❤', 12],
  ['rencontre', 13],
  ['un autre', 34],
  ['chien', 58]
]) {
  window.app.addWord(word)
  window.app.refs.poster.refs.cells[cellIndex].appendChild(window.app.refs.words[window.app.refs.words.length - 1])
}
