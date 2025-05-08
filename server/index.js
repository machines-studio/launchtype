#!/usr/bin/env node

process.env.HTTP_PORT = process.env.HTTP_PORT ?? 8080
process.env.NODE_ENV = process.env.NODE_ENV ?? 'production'

const path = require('path')
const http = require('http')
const express = require('express')
const logger = require('./utils/logger')

// Instanciate express server
const app = express()
const server = http.createServer(app)

// Log request
app.use((req, res, next) => {
  logger({ color: 'gray', prefix: '[EXPRESS]' })(req.originalUrl)
  next()
})

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')))
app.use(express.static(path.join(__dirname, '..', 'build')))

// TODO endpoint POST json save

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
