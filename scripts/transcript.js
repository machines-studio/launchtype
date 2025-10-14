const path = require('path')
const fs = require('node:fs/promises')
const chalk = require('chalk').default
const { spawn } = require('child_process')
const { glob } = require('glob')
const { uid } = require('uid')

// SEE https://github.com/ggml-org/whisper.cpp/tree/master/models#available-models
const MODEL = 'large-v3'
const LANG = 'FR'

// Paths
const root = path.join(__dirname, '..')
const whisper = path.join(root, 'scripts/bin/whisper.cpp')
const paroles = path.join(root, 'assets/paroles')
const model = `./models/ggml-${MODEL}.bin`

/**
  $ brew install cmake
  $ git clone https://github.com/ggml-org/whisper.cpp.git
  $ cd whisper.cpp
  $ sh ./models/download-ggml-model.sh small
  $ cmake -B build
  $ cmake --build build -j --config Release

  $ cd whisper.cpp
  $ ./build/bin/whisper-cli -m ./models/ggml-small.bin -f ../chien.wav -ml 1 -sow -l FR > transcript.txt
**/

;(async () => {
  // Whisper installation
  if ((await run('test', ['-d', whisper])).code === 1) {
    console.log(chalk.yellow('Installing whisper.cpp…'))

    await run('git', ['clone', 'https://github.com/ggml-org/whisper.cpp.git', whisper], __dirname)

    if ((await run('which', ['cmake'])).code === 1) {
      console.log(chalk.yellow('Installing cmake…'))
      await run('brew', ['install', 'cmake'])
    }

    await run('cmake', ['-B', 'build'], whisper)
    await run('cmake', ['--build', 'build', '-j', '--config', 'Release'], whisper)
  }

  // Model download
  if ((await run('test', ['-f', path.join(whisper, model)])).code === 1) {
    await run('sh', ['./models/download-ggml-model.sh', MODEL], whisper)
  }

  // Transcription
  let entries = process.argv.slice(2).map(entry => path.join(process.cwd(), entry))
  if (!entries?.length) entries = await glob(path.join(paroles, '**/*.wav'), { nodir: true })
  for (const entry of entries) {
    const basedir = path.dirname(entry)
    const basename = path.basename(entry, '.wav')
    const json = path.join(basedir, basename + '.json')

    // Run transcription
    const { stdout, stderr, code } = await run('./build/bin/whisper-cli', [
      '--model', model,
      '--file', entry,
      '--max-len', 1,
      '--language', LANG,
      '--suppress-nst',
      '--split-on-word',
      // '-ng' // Make it works on macOs Intel
    ], whisper, { verbose: true })

    if (code === 1) console.error(stderr)
    else {
      // Read exising json data
      const data = await (async () => {
        try {
          return JSON.parse(await fs.readFile(json, 'utf8'))
        } catch (error) {
          return {}
        }
      })()

      // Write transcript to json data
      data.sound = path.relative(path.join(root, 'assets'), entry)
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
    }
  }
})()

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
