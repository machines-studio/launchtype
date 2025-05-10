export default (a, prng = Math.random) => {
  let j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(prng() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}
