/**
 * Badge Engine — Phase 5 logic
 *
 * checkAndAwardBadges(workerId):
 *   1. Fetches the worker's stats from Supabase
 *   2. Evaluates each badge condition
 *   3. Awards any badges not yet earned
 *   4. Returns the list of newly awarded badges
 *
 * This runs server-side so workers cannot manipulate their own badge awards.
 */

const { createClient } = require('@supabase/supabase-js')

// Use the service role key here — this bypasses RLS for trusted server operations.
// NEVER use the service role key in frontend code.
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // different from the anon key!
)

// ---------------------------------------------------------------
// Streak Detection
// Returns the number of consecutive calendar days (UTC+8) on
// which the worker completed at least one task.
// ---------------------------------------------------------------
async function streakCount(workerId) {
  const { data: completions, error } = await supabase
    .from('tasks')
    .select('completed_at')
    .eq('assigned_worker_id', workerId)
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })

  if (error || !completions?.length) return 0

  // Convert to UTC+8 date strings (YYYY-MM-DD)
  const UTC8_OFFSET = 8 * 60 * 60 * 1000
  const toDate = (iso) => {
    const d = new Date(new Date(iso).getTime() + UTC8_OFFSET)
    return d.toISOString().slice(0, 10)
  }

  // Get unique dates, sorted newest first
  const uniqueDates = [...new Set(completions.map(c => toDate(c.completed_at)))]
    .sort()
    .reverse()

  // Today and yesterday in UTC+8
  const nowUtc8 = new Date(Date.now() + UTC8_OFFSET)
  const todayStr     = nowUtc8.toISOString().slice(0, 10)
  const yesterdayStr = new Date(nowUtc8.getTime() - 86400000).toISOString().slice(0, 10)

  // Streak must start from today or yesterday (allows for tasks not yet done today)
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) return 0

  let streak = 0
  let expected = new Date(uniqueDates[0])

  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr)
    const diff = Math.round((expected - d) / 86400000)
    if (diff === 0) {
      streak++
      expected = new Date(d.getTime() - 86400000)
    } else {
      break
    }
  }

  return streak
}

// ---------------------------------------------------------------
// Main badge check function
// ---------------------------------------------------------------
async function checkAndAwardBadges(workerId) {
  // 1. Gather worker stats
  const [
    { count: totalCompleted },
    { data: recentCompletions },
    { count: qualityPassed },
    { count: issuesReported },
    { data: alreadyEarned },
    { data: allBadges },
  ] = await Promise.all([
    // Total tasks completed
    supabase.from('tasks').select('*', { count: 'exact', head: true })
      .eq('assigned_worker_id', workerId).eq('status', 'completed'),

    // Tasks completed in last 7 days (for streak)
    supabase.from('tasks').select('completed_at')
      .eq('assigned_worker_id', workerId).eq('status', 'completed')
      .gte('completed_at', new Date(Date.now() - 7 * 86400000).toISOString()),

    // Quality checks passed (no fail reports on quality_check steps)
    supabase.from('sop_steps').select('*', { count: 'exact', head: true })
      .eq('step_type', 'quality_check'),  // Simplified — refine in Phase 5

    // Quality issues reported by this worker
    supabase.from('quality_issues').select('*', { count: 'exact', head: true })
      .eq('worker_id', workerId),

    // Badges already earned
    supabase.from('worker_badges').select('badge_id').eq('worker_id', workerId),

    // All active badge definitions
    supabase.from('badge_definitions').select('*').eq('active', true),
  ])

  const earnedIds   = new Set((alreadyEarned || []).map(b => b.badge_id))
  const streak      = await streakCount(workerId)
  const newlyAwarded = []

  for (const badge of (allBadges || [])) {
    if (earnedIds.has(badge.id)) continue  // Already earned

    let earned = false

    switch (badge.trigger_type) {
      case 'first_task':
        earned = totalCompleted >= 1
        break
      case 'tasks_100':
        earned = totalCompleted >= 100
        break
      case 'streak_5_days':
        earned = streak >= (badge.trigger_value || 5)
        break
      case 'full_week':
        earned = streak >= 7
        break
      case 'issue_reporter_5':
        earned = issuesReported >= (badge.trigger_value || 5)
        break
      // Phase 5 will add more sophisticated checks for quality_20_pass, etc.
    }

    if (earned) {
      const { error } = await supabase
        .from('worker_badges')
        .insert({ worker_id: workerId, badge_id: badge.id })

      if (!error) {
        newlyAwarded.push(badge)

        // Update badge_points on the worker profile
        await supabase.rpc('increment_badge_points', {
          p_worker_id: workerId,
          p_points: 10,  // 10 points per badge — adjust as needed
        })
      }
    }
  }

  return newlyAwarded
}

module.exports = { checkAndAwardBadges, streakCount }
