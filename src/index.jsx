import '/index.scss'

import { render } from '@tooooools/ui'
import App from '/components/App'

const app = render(<App />).components[0]
window.app = app
