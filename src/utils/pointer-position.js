/* global TouchEvent */

export default (e, { round = true } = {}) => {
  const r = v => round ? Math.round(v) : v

  if (window.TouchEvent && (e instanceof TouchEvent)) {
    const touch = e.targetTouches[0]
    return touch ? [r(touch.clientX), r(touch.clientY)] : [-1, -1]
  }

  return e.pointerType === 'pen'
    ? [r(e.clientX), r(e.clientY), e.pressure]
    : [r(e.clientX), r(e.clientY)]
}
