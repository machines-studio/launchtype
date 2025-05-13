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
  ['Zut !', 11],
  ['Je crois', 21], 
  ['que le chien', 31],
  ['Sambuca', 41],
  ['préfère',51],
  ['le whisky', 61],
  ['au doux', 71],
  ['porto', 81]
]) {
  window.app.addWord(word)
  window.app.refs.poster.refs.cells[cellIndex].appendChild(window.app.refs.words[window.app.refs.words.length - 1])
}



