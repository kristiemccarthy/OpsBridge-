/**
 * POST /api/translate
 * Body:    { text: "string to translate" }
 *          OR { texts: ["array", "of", "strings"] }  ← batch mode
 * Returns: { translation: "..." }
 *          OR { translations: ["...", "..."] }
 *
 * Uses Google Cloud Translation API (free tier: 500k chars/month).
 * The API key lives in .env — NEVER in the frontend code.
 */

const express = require('express')
const router  = express.Router()

// Simple in-memory cache — avoids re-translating identical strings
// Key: English text  |  Value: Chinese translation
const translationCache = new Map()

async function callGoogleTranslate(text) {
  // Return cached result if available
  if (translationCache.has(text)) {
    return translationCache.get(text)
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_TRANSLATE_API_KEY not set in .env file')
  }

  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`
  const body = {
    q:      text,
    source: 'en',
    target: 'zh-CN',
    format: 'text',
  }

  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Translation API error')
  }

  const data        = await response.json()
  const translation = data.data.translations[0].translatedText

  // Cache the result
  translationCache.set(text, translation)
  return translation
}

// Single translation
router.post('/', async (req, res) => {
  const { text } = req.body
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Request body must include { text: "string" }' })
  }

  try {
    const translation = await callGoogleTranslate(text)
    res.json({ translation })
  } catch (err) {
    console.error('Translation error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Batch translation — send multiple strings in one API call
router.post('/batch', async (req, res) => {
  const { texts } = req.body
  if (!Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: 'Request body must include { texts: ["..."] }' })
  }

  try {
    const translations = await Promise.all(texts.map(callGoogleTranslate))
    res.json({ translations })
  } catch (err) {
    console.error('Batch translation error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
