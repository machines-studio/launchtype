const ffmpegBin = require('ffmpeg-static')
const { spawn } = require('node:child_process')

/**
 * Spawn a ffmpeg process and return a Promise resolving when done
 */

module.exports = (cwd, params = []) => new Promise((resolve, reject) => {
  const ffmpeg = spawn(ffmpegBin, params, { cwd })

  let error = null
  ffmpeg.stderr.on('data', data => {
    error = data.toString()
  })

  // Resolve/reject when subprocess closes
  ffmpeg.on('close', code => {
    if (code) reject(new Error(`ffmpeg exited with code ${code}.\n${error}`))
    else resolve()
  })
})
