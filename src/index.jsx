import '/index.scss'

import { render } from '@tooooools/ui'
import { Toast } from '@tooooools/ui/components'
import preventDoubleTap from '/utils/prevent-double-tap'
import * as Icons from '/data/icons'

;(async () => {
  try {
    const ROUTES = {
      '/': await import('/views/app'),
      '/pads': await import('/views/pads'),
      '/poster': await import('/views/poster'),
      '/recorder': await import('/views/recorder'),
      '/text': await import('/views/text')
    }

    // Basic front router
    window.view = render(await (async () => {
      for (const route in ROUTES) {
        const params = []

        // Create from this route to match any pathname, and store its params
        // Handle /endpoint/:param1/:param2
        const regexp = route.replace(/:([^/]+)/g, (_, key) => {
          params.push(key)
          return '([^\\/]+)'
        })

        const match = window.location.pathname.match(new RegExp(`^${regexp}$`))
        if (!match) continue

        return ROUTES[route]?.default(params.reduce((params, name, index) => ({
          ...params,
          [name]: match[index + 1]
        }), {}))
      }
    })() ?? <pre>Not found</pre>).components[0]
  } catch (error) {
    displayError(error)
  }
})()

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

// Display errors
window.addEventListener('error', e => displayError(e.error))

function displayError (error) {
  Toast.display([
    <p>Une erreur inconnue est survenue{error.stack?.length ? '\u2009:' : ''}</p>,
    error.stack?.length && <pre>{error.stack}</pre>
  ], {
    icon: Icons.error,
    tone: 'error'
  })
}
