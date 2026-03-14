/**
 * API Route: POST /api/translate
 *
 * In Next.js, files inside app/api/ become server-side API endpoints.
 * This replaces the separate Express backend from the Vite version —
 * Next.js handles everything in one project.
 *
 * Body:    { text: "English string" }
 * Returns: { translation: "Chinese string" }
 *
 * The Google API key lives in .env.local (server-only, never exposed to the browser).
 */

import { NextResponse } from 'next/server'

// Simple in-memory cache — avoids translating the same phrase twice
const cache = new Map()

export async function POST(request) {
  const body = await request.json()
  const { text } = body

  if (!text || typeof text !== 'string') {
    return NextResponse.json(
      { error: 'Body must contain { text: "string to translate" }' },
      { status: 400 }
    )
  }

  // Return cached result if we've seen this string before
  if (cache.has(text)) {
    return NextResponse.json({ translation: cache.get(text), cached: true })
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) {
    // In Phase 1, the API key might not be set yet — return a clear message
    return NextResponse.json(
      { error: 'GOOGLE_TRANSLATE_API_KEY not set in .env.local. See setup guide.' },
      { status: 503 }
    )
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: 'en', target: 'zh-CN', format: 'text' }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message ?? 'Translation API error')
    }

    const data        = await response.json()
    const translation = data.data.translations[0].translatedText

    cache.set(text, translation)
    return NextResponse.json({ translation })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
