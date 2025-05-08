const chalk = require('chalk').default

module.exports = ({
  prefix,
  color,
  level = 'log'
} = {}) => (...args) => {
  const pre = []
  if (prefix) pre.push(prefix)
  pre.push(...args)

  const output = color
    ? pre.map(p => typeof p === 'object' ? p : chalk[color](p))
    : pre
  if (process.env.NODE_ENV !== 'development') output.unshift(new Date())

  return console[level](...output)
}
