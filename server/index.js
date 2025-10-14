#!/usr/bin/env node

process.env.HTTP_PORT = process.env.HTTP_PORT ?? 8888
process.env.NODE_ENV = process.env.NODE_ENV ?? 'production'

const fs = require('fs-extra')
const cors = require('cors')
const path = require('path')
const https = require('https')
const express = require('express')
const bodyParser = require('body-parser')
const { uid } = require('uid')
const multer = require('multer')
const { glob } = require('glob')
const { WebSocketServer } = require('ws')
const logger = require('./utils/logger')
const ffmpeg = require('./utils/ffmpeg')
const transcript = require('./utils/transcript')

const saves = path.join(__dirname, '.saves')
const recordings = path.join(__dirname, '.recordings')

// Instanciate express server
const app = express()
const server = https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'selfsigned.key')),
  cert: fs.readFileSync(path.join(__dirname, 'selfsigned.crt'))
}, app)

const upload = multer({
  storage: multer.diskStorage({
    destination: recordings,
    filename: (req, file, callback) => callback(null, Date.now() + '_' + Math.round(Math.random() * 1e9) + '.ogg')
  })
})

// Enable CORS
app.use(cors())
app.use(bodyParser.json())

// Log request
app.use((req, res, next) => {
  logger({ color: 'gray', prefix: '[EXPRESS]' })(req.originalUrl)
  next()
})

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'build')))

// Handle saving png
// TODO refactor with multer
// TODO prefix with /api/ etc
app.post('/save', (req, res, next) => {
  fs.ensureDirSync(saves)

  const filepath = path.join(saves, String(Date.now()))
  fs.writeFileSync(filepath + '.png', Buffer.from(req.body.png.replace(/^data:image\/\w+;base64,/, ''), 'base64'))
  fs.writeJsonSync(filepath + '.json', JSON.parse(req.body.json))

  res.status(201).json({ status: 'ok' })
})

// Handle saving and transcripting audio recordings
app.post('/api/transcript/prepare', upload.single('sound'), async (req, res, next) => {
  try {
    const file = req.file
    const filename = file.filename + '.wav'

    // Convert to wav
    await ffmpeg(recordings, [
      '-i', file.filename,
      '-ar', '16000',
      '-ac', '1',
      '-c:a', 'pcm_s16le',
      filename
    ])

    // Delte ogg
    await fs.unlink(file.path)

    // Send back transcript and filename
    res.status(200).json({
      filename,
      transcript: await transcript(file.path + '.wav')
    })
  } catch (error) {
    next(error)
  }
})

// Save JSON transcript alongside its audio file
app.post('/api/transcript/commit', (req, res) => {
  fs.writeJsonSync(path.join(recordings, req.body.filename + '.json'), req.body)
  res.status(201).json({ status: 'ok' })
})

// Redirect subdirectories to index, enabling front routing
app.get('/:path', (req, res) => res.sendFile(path.join(__dirname, '..', 'build', '/index.html')))

// Get the list of all commited transcripts
app.get('/api/paroles/', async (req, res) => {
  const paroles = []
  const entries = await glob(path.join(recordings, '*.json'), { nodir: true })
  for (const entry of entries.sort((a, b) => a - b)) paroles.push(fs.readJsonSync(entry))
  res.status(200).json(paroles)
})

// Log errors
app.use((error, req, res, next) => {
  logger({ color: 'red', prefix: '[EXPRESS]', level: 'error' })(error)
  res.status(500).json({ error: error.message })
})

// Start HTTP server
server.listen(process.env.HTTP_PORT, () => {
  logger({
    color: 'cyan',
    prefix: '[EXPRESS]'
  })(`HTTP server is up and running on port ${process.env.HTTP_PORT}`)
})

// Simple WS broadcast server
const clients = new Map()
new WebSocketServer({ port: 1337 }).on('connection', ws => {
  const log = logger({
    color: 'blue',
    prefix: '[WEBSOCKET]'
  })

  // Reference the client in a map by UID
  ws.uid = uid()
  clients.set(ws.uid, ws)
  log(`Client ${ws.uid} connected`)

  ws.on('close', () => {
    clients.delete(ws.uid)
    log(`Client ${ws.uid} disconnected`)
  })

  // Send back its UID
  ws.send(JSON.stringify({ event: 'handshake', message: ws.uid }))

  // Broadcast all incoming messages
  ws.on('message', data => {
    try {
      const d = data.toString()
      log(d)
      for (const [, client] of clients) client.send(d)
    } catch (error) {
      console.error(new Date(), error)
    }
  })
})
