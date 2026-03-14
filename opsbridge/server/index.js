/**
 * OpsBridge Express Backend
 *
 * Handles operations that must NOT run in the browser:
 *  - Translation API calls (keeps the API key secret)
 *  - Badge award logic (server-side trust)
 *
 * Run with: npm run dev (in the /server directory)
 * Runs on:  http://localhost:3001
 * The Vite dev server proxies /api/* requests here automatically.
 */

require('dotenv').config({ path: '../.env' })  // reads the .env file in the parent folder
const express = require('express')
const cors    = require('cors')

const translateRouter = require('./routes/translate')
const badgesRouter    = require('./routes/badges')

const app  = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))  // Allow requests from Vite dev server
app.use(express.json())

// Routes
app.use('/api/translate', translateRouter)
app.use('/api/badges',    badgesRouter)

// Health check — visit http://localhost:3001/api/health to confirm server is running
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'OpsBridge API is running' })
})

app.listen(PORT, () => {
  console.log(`✅ OpsBridge server running on http://localhost:${PORT}`)
})
