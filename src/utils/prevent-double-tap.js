export default function preventDoubleTap (timeout) {
  let dblTapTimer = 0
  let dblTapPressed = false

  return e => {
    window.clearTimeout(dblTapTimer)
    if (dblTapPressed) {
      e.preventDefault()
      dblTapPressed = false
    } else {
      dblTapPressed = true
      dblTapTimer = window.setTimeout(() => { dblTapPressed = false }, timeout)
    }
  }
}
