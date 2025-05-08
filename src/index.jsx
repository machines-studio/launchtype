import '/index.scss'

import { render } from '@tooooools/ui'
import App from '/components/App'

window.app = render(<App />).components[0]

let i = 0
for (const c of [0, 7, 3, 4]) window.app.refs.poster.refs.cells[c].appendChild(window.app.refs.words[i++])
