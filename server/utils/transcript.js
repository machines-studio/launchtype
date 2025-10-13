const path = require('path')
const fs = require('node:fs/promises')
const { uid } = require('uid')
const chalk = require('chalk').default
const { spawn } = require('child_process')

const whisper = path.join(__dirname, '../../scripts/bin/whisper.cpp')

module.exports = async (filepath, {
  model = 'large-v3',
  lang = 'FR'
} = {}) => {
  const basedir = path.dirname(filepath)
  const basename = path.basename(filepath, '.wav')
  const json = path.join(basedir, basename + '.json')

  // Run transcription
  const { stdout, stderr, code } = await run('./build/bin/whisper-cli', [
    '--model', `./models/ggml-${model}.bin`,
    '--file', filepath,
    '--max-len', 1,
    '--language', lang,
    '--suppress-nst',
    '--split-on-word'
  ], whisper, { verbose: false })

  if (code === 1) throw new Error(stderr)

  // Write transcript to json data
  const data = {}
  // data.sound = path.relative(path.join(root, 'assets'), file)
  data.timestamps = (() => {
    const segments = []
    for (const segment of stdout.split('\n')) {
      if (!segment || !segment.length) continue
      const [, start, end, text] = /\[(\d{2}:\d{2}:\d{2}.\d{3})\s-->\s(\d{2}:\d{2}:\d{2}.\d{3})\]\s+(\S*)/.exec(segment)
      if (!text) continue

      segments.push({
        uuid: 'segment_' + uid(),
        text: text.replace(/[.,«»/]/gi, ''),
        start,
        startMs: timestampToMilliseconds(start),
        end,
        endMs: timestampToMilliseconds(end)
      })
    }

    return segments
  })()
  data.transcript = data.timestamps.map(({ text }) => text).join(' ')

  await fs.writeFile(json, JSON.stringify(data, null, 2), 'utf8')
  return data
}

function run (cmd, args = [], cwd = process.cwd(), { verbose = true } = {}) {
  return new Promise(resolve => {
    console.log(chalk.blue('→', [cmd, ...args].join(' ')))

    const proc = spawn(cmd, args, { cwd })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', data => {
      stdout += data
      if (verbose) process.stdout.write(data)
    })

    proc.stderr.on('data', data => {
      stderr += data
      if (verbose) process.stderr.write(data)
    })

    proc.on('close', code => resolve({ stdout, stderr, code }))
  })
}

function timestampToMilliseconds (string) {
  const [, h, m, s, ms] = /(\d{2}):(\d{2}):(\d{2}).(\d{3})/.exec(string)
  return (
    (+h) * 60 * 60 * 1000 +
    (+m) * 60 * 1000 +
    (+s) * 1000 +
    (+ms)
  )
}
