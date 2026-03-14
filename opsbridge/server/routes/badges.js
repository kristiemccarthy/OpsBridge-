/**
 * POST /api/badges/check
 * Body:    { workerId: "uuid" }
 * Returns: { awarded: [ { badge_id, name_en, name_zh, icon_url }, ... ] }
 *
 * Called after a worker completes a task.
 * Checks all badge conditions and awards any newly earned badges.
 */

const express    = require('express')
const router     = express.Router()
const badgeEngine = require('../services/badgeEngine')

router.post('/check', async (req, res) => {
  const { workerId } = req.body
  if (!workerId) {
    return res.status(400).json({ error: 'workerId is required' })
  }

  try {
    const awarded = await badgeEngine.checkAndAwardBadges(workerId)
    res.json({ awarded })
  } catch (err) {
    console.error('Badge check error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
