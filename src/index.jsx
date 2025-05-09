import '/index.scss'

import { render } from '@tooooools/ui'
import App from '/components/App'
import preventDoubleTap from '/utils/prevent-double-tap'

render(<App />)

// Prevent magnifying glass on double tap on iOS
document.body.addEventListener('touchstart', preventDoubleTap(200), { passive: false })
