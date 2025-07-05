#!/usr/bin/env node

process.env.HTTP_PORT = process.env.HTTP_PORT ?? 8080
process.env.NODE_ENV = process.env.NODE_ENV ?? 'production'

const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const http = require('http')
const express = require('express')
const formData = require('express-form-data')
const logger = require('./utils/logger')

const saves = path.join(__dirname, '.saves')

// Instanciate express server
const app = express()
const server = http.createServer(app)

// Log request
app.use((req, res, next) => {
  logger({ color: 'gray', prefix: '[EXPRESS]' })(req.originalUrl)
  next()
})

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'build')))

// Handle formData
app.use(formData.parse({ uploadDir: os.tmpdir(), autoClean: true }))
app.use(formData.format())
app.use(formData.stream())

app.post('/save', (req, res, next) => {
  fs.ensureDirSync(saves)

  const filepath = path.join(saves, String(Date.now()))
  fs.writeFileSync(filepath + '.png', Buffer.from(req.body.png.replace(/^data:image\/\w+;base64,/, ''), 'base64'))
  fs.writeJsonSync(filepath + '.json', JSON.parse(req.body.json))

  res.status(201).json({ status: 'ok' })
})

// Log errors
app.use((error, req, res, next) => {
  logger({ color: 'red', prefix: '[EXPRESS]', level: 'error' })(error)
  res.status(500).json({ error: error.message })
})

// Start HTTP server
server.listen(process.env.HTTP_PORT, () => {
  logger({
    color: 'green',
    prefix: '[EXPRESS]'
  })(`HTTP server is up and running on port ${process.env.HTTP_PORT}`)
})
