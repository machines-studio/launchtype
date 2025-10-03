import '/index.scss'

import { render } from '@tooooools/ui'
import { Toast } from '@tooooools/ui/components'
import preventDoubleTap from '/utils/prevent-double-tap'
import * as Icons from '/data/icons'
import App from '/components/App'

window.app = render(<App />).components[0]

// Prevent magnifying glass on double tap on iOS
document.body.addEventListener('touchstart', preventDoubleTap(200), { passive: false })

// Prevent pinch zoom gestures
document.addEventListener('gesturestart', e => e.preventDefault())
document.addEventListener('gesturechange', e => e.preventDefault())
document.addEventListener('gestureend', e => e.preventDefault())

// Display warnings
const warn = console.warn.bind(console)
console.warn = (...args) => {
  warn(...args)
  Toast.display(args.map(a => <p>{a}</p>), {
    icon: Icons.warning,
    tone: 'warning',
    duration: 5000
  })
}
