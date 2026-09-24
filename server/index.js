import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import ExcelJS from 'exceljs'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const distPath = join(__dirname, '..', 'dist')

const app = express()
const port = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_, res) => {
  res.json({ ok: true, mode: 'supabase' })
})

app.post('/api/chat', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ reply: 'Chat is not configured yet. Add ANTHROPIC_API_KEY to your .env file.' })
  }

  const { messages, system } = req.body || {}

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system,
        messages,
      }),
    })

    const data = await response.json()
    return res.status(200).json({ reply: data?.content?.[0]?.text || 'No response returned.' })
  } catch (error) {
    return res.status(500).json({ reply: 'Something went wrong. Please try again.' })
  }
})

async function fetchAllRows(client, table, columns) {
  const pageSize = 1000
  let from = 0
  const all = []

  while (true) {
    const { data, error } = await client
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1)

    if (error) throw error
    all.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }

  return all
}

function addSheet(workbook, name, columns, rows) {
  const sheet = workbook.addWorksheet(name)
  sheet.columns = columns
  rows.forEach(row => sheet.addRow(row))
  sheet.getRow(1).font = { bold: true }
  return sheet
}

// Shared gate for every /api/admin/* route: a single shared secret (not
// per-researcher accounts), checked the same way the export always has been.
function requireAdminKey(req, res) {
  const adminKey = process.env.ADMIN_EXPORT_KEY
  if (!adminKey) {
    res.status(500).json({ message: 'Admin access is not configured yet. Add ADMIN_EXPORT_KEY to your server .env file.' })
    return false
  }

  const providedKey = req.headers['x-admin-key'] || req.query.key
  if (providedKey !== adminKey) {
    res.status(401).json({ message: 'Invalid admin key' })
    return false
  }

  return true
}

function getSupabaseAdmin(res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ message: 'Add SUPABASE_SERVICE_ROLE_KEY to your server .env file.' })
    return null
  }
  return createClient(supabaseUrl, serviceRoleKey)
}

// ISO 8601 week key (e.g. "2026-W38") so "sessions per week" buckets match
// calendar weeks regardless of which day of the week a participant logs in.
// This is the grouping key only — the dashboard displays relative "Week N"
// numbers (see buildWeekSeries below), not the raw calendar week number,
// since a study's "week 1" is rarely January's.
function isoWeekKey(dateInput) {
  const date = new Date(Date.UTC(
    new Date(dateInput).getUTCFullYear(),
    new Date(dateInput).getUTCMonth(),
    new Date(dateInput).getUTCDate(),
  ))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

// Monday 00:00 UTC of the week containing dateInput.
function mondayOf(dateInput) {
  const date = new Date(Date.UTC(
    new Date(dateInput).getUTCFullYear(),
    new Date(dateInput).getUTCMonth(),
    new Date(dateInput).getUTCDate(),
  ))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() - dayNum + 1)
  return date
}

const WEEKDAY_FMT = { month: 'short', day: 'numeric', timeZone: 'UTC' }

// A continuous, zero-filled run of weeks from `startDate` through `endDate`
// (inclusive), labeled as relative "Week 1, Week 2, ..." rather than raw ISO
// week numbers — a participant's or the study's own week 1, not week 38 of
// the calendar year — with the real date range attached for the dashboard's
// hover tooltip.
function buildWeekSeries(startDate, endDate, countsByIsoWeek) {
  const series = []
  let cursor = mondayOf(startDate)
  const lastMonday = mondayOf(endDate)
  let weekNumber = 1

  while (cursor <= lastMonday) {
    const weekEnd = new Date(cursor)
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)
    const key = isoWeekKey(cursor)
    series.push({
      weekNumber,
      week: key,
      weekStart: cursor.toISOString().slice(0, 10),
      weekEnd: weekEnd.toISOString().slice(0, 10),
      label: `${cursor.toLocaleDateString('en-US', WEEKDAY_FMT)} – ${weekEnd.toLocaleDateString('en-US', WEEKDAY_FMT)}`,
      count: countsByIsoWeek.get(key) || 0,
    })
    cursor = new Date(cursor)
    cursor.setUTCDate(cursor.getUTCDate() + 7)
    weekNumber += 1
  }

  return series
}

// Admin-only export: pulls every participant's data into one Excel workbook
// for the research team. Never exposes the internal user id or synthetic
// login email — only the Study ID. `?studyId=` scopes every sheet to a
// single participant, for the dashboard's "export this participant" button.
app.get('/api/admin/export-excel', async (req, res) => {
  if (!requireAdminKey(req, res)) return
  const admin = getSupabaseAdmin(res)
  if (!admin) return

  const filterStudyId = req.query.studyId ? String(req.query.studyId).trim().toUpperCase() : null

  try {
    const [profilesAll, entriesAll, eventsAll] = await Promise.all([
      fetchAllRows(admin, 'profiles', 'id, study_id, display_name, created_at, updated_at'),
      fetchAllRows(admin, 'villa_entries', 'id, user_id, category, source, entry_date, entry_key, payload, updated_at'),
      fetchAllRows(admin, 'activity_events', 'id, user_id, event_type, villa, feature, created_at'),
    ])

    const profiles = filterStudyId ? profilesAll.filter(p => p.study_id === filterStudyId) : profilesAll
    if (filterStudyId && profiles.length === 0) {
      return res.status(404).json({ message: `No participant found with Study ID "${filterStudyId}"` })
    }
    const allowedUserIds = filterStudyId ? new Set(profiles.map(p => p.id)) : null
    const entries = allowedUserIds ? entriesAll.filter(e => allowedUserIds.has(e.user_id)) : entriesAll
    const events = allowedUserIds ? eventsAll.filter(e => allowedUserIds.has(e.user_id)) : eventsAll

    const studyIdByUser = new Map(profiles.map(p => [p.id, p.study_id]))
    const studyIdOf = userId => studyIdByUser.get(userId) || userId

    const { SCALES } = await import('../src/lib/assessments.js')
    const scaleById = Object.fromEntries(SCALES.map(s => [s.id, s]))

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Recovery Island'
    workbook.created = new Date()

    addSheet(workbook, 'Profiles', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Display Name', key: 'display_name', width: 20 },
      { header: 'Account Created', key: 'created_at', width: 22 },
    ], profiles.map(p => ({
      study_id: p.study_id,
      display_name: p.display_name,
      created_at: p.created_at,
    })))

    addSheet(workbook, 'Mood', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Mood Value (1-5)', key: 'value', width: 16 },
      { header: 'Mood Label', key: 'label', width: 14 },
      { header: 'Note', key: 'note', width: 40 },
    ], entries
      .filter(e => e.category === 'mood' && e.source === 'mood-diary')
      .map(e => ({
        study_id: studyIdOf(e.user_id),
        date: e.entry_date,
        value: e.payload?.value,
        label: e.payload?.label,
        note: e.payload?.note || '',
      })))

    addSheet(workbook, 'Journal', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Prompt', key: 'prompt', width: 40 },
      { header: 'Reflection', key: 'text', width: 60 },
      { header: 'Word Count', key: 'wordCount', width: 12 },
    ], entries
      .filter(e => e.category === 'journal' && e.source === 'mood-diary')
      .map(e => ({
        study_id: studyIdOf(e.user_id),
        date: e.entry_date,
        prompt: e.payload?.prompt || '',
        text: e.payload?.text || '',
        wordCount: e.payload?.wordCount ?? '',
      })))

    const assessmentColumns = [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Date', key: 'date', width: 14 },
    ]
    SCALES.forEach(s => {
      assessmentColumns.push({ header: `${s.shortName} Score`, key: `${s.id}_score`, width: 14 })
      assessmentColumns.push({ header: `${s.shortName} Severity`, key: `${s.id}_severity`, width: 20 })
    })
    addSheet(workbook, 'Assessments', assessmentColumns, entries
      .filter(e => e.category === 'assessment' && e.source === 'emotion-scales')
      .map(e => {
        const row = { study_id: studyIdOf(e.user_id), date: e.payload?.date || e.entry_date }
        SCALES.forEach(s => {
          const score = e.payload?.scores?.[s.id]?.score
          row[`${s.id}_score`] = score ?? ''
          row[`${s.id}_severity`] = score != null ? scaleById[s.id].getSeverity(score).label : ''
        })
        return row
      }))

    addSheet(workbook, 'Sleep', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Hours', key: 'hours', width: 10 },
      { header: 'Quality (1=Poor,3=Great)', key: 'quality', width: 22 },
    ], entries
      .filter(e => e.category === 'wellness' && e.source === 'sleep-tracker')
      .map(e => ({
        study_id: studyIdOf(e.user_id),
        date: e.entry_date,
        hours: e.payload?.hours ?? '',
        quality: e.payload?.quality ?? '',
      })))

    // Movement writes multiple rows per user per day (one per preset toggle
    // or custom activity add), each carrying the full combined state for
    // that day — keep only the freshest row per (user, day).
    const movementByDay = new Map()
    entries
      .filter(e => e.category === 'wellness' && e.source === 'movement-tracker')
      .forEach(e => {
        const dayKey = `${e.user_id}|${e.entry_date}`
        const existing = movementByDay.get(dayKey)
        if (!existing || new Date(e.updated_at) > new Date(existing.updated_at)) {
          movementByDay.set(dayKey, e)
        }
      })
    addSheet(workbook, 'Movement', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Preset Activities', key: 'preset', width: 30 },
      { header: 'Custom Activities', key: 'custom', width: 40 },
      { header: 'Total Minutes', key: 'minutes', width: 14 },
    ], Array.from(movementByDay.values()).map(e => {
      const preset = e.payload?.preset || []
      const custom = e.payload?.custom || []
      const customMinutes = custom.reduce((sum, c) => sum + (c.minutes || 0), 0)
      return {
        study_id: studyIdOf(e.user_id),
        date: e.entry_date,
        preset: preset.join(', '),
        custom: custom.map(c => `${c.label} (${c.minutes}min)`).join(', '),
        minutes: customMinutes,
      }
    }))

    addSheet(workbook, 'Nourishment', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Meal / Drink', key: 'text', width: 40 },
      { header: 'Moment', key: 'moment', width: 12 },
      { header: 'Mood Tag', key: 'mood', width: 14 },
      { header: 'Reflection', key: 'reflection', width: 40 },
    ], entries
      .filter(e => e.category === 'wellness' && e.source === 'nourishment-guide')
      .map(e => ({
        study_id: studyIdOf(e.user_id),
        date: e.entry_date,
        text: e.payload?.text || '',
        moment: e.payload?.moment || '',
        mood: e.payload?.mood || '',
        reflection: e.payload?.reflection || '',
      })))

    addSheet(workbook, 'Hydration', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Cups Logged', key: 'cups', width: 14 },
    ], entries
      .filter(e => e.category === 'wellness' && e.source === 'hydration-tracker')
      .map(e => ({
        study_id: studyIdOf(e.user_id),
        date: e.entry_date,
        cups: e.payload?.cups ?? '',
      })))

    // Routine Builder stores one row per (user, tab) holding the current
    // checklist, so this reflects the latest saved routine rather than a
    // daily history.
    addSheet(workbook, 'Routine', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Last Updated', key: 'date', width: 14 },
      { header: 'Routine', key: 'tab', width: 12 },
      { header: 'Selected Items', key: 'items', width: 60 },
    ], entries
      .filter(e => e.category === 'wellness' && e.source === 'routine-builder')
      .map(e => ({
        study_id: studyIdOf(e.user_id),
        date: e.entry_date,
        tab: e.payload?.tab || e.entry_key || '',
        items: (e.payload?.items || []).join(', '),
      })))

    addSheet(workbook, 'Quiz', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Attempts', key: 'attempts', width: 12 },
      { header: 'Best Score (out of 6)', key: 'bestScore', width: 18 },
    ], entries
      .filter(e => e.category === 'wellness' && e.source === 'wellness-quiz')
      .map(e => ({
        study_id: studyIdOf(e.user_id),
        date: e.entry_date,
        attempts: e.payload?.attempts ?? '',
        bestScore: e.payload?.bestScore ?? '',
      })))

    // Goal Tracker stores one row per user holding the current intention +
    // checklist state, so this reflects the latest saved goal, not a history.
    addSheet(workbook, 'Goals', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Last Updated', key: 'date', width: 14 },
      { header: 'Intention', key: 'intention', width: 40 },
      { header: 'Steps Checked Off', key: 'checked', width: 16 },
    ], entries
      .filter(e => e.category === 'inspiration' && e.source === 'goal-tracker')
      .map(e => ({
        study_id: studyIdOf(e.user_id),
        date: e.entry_date,
        intention: e.payload?.intention || '',
        checked: Object.values(e.payload?.checked || {}).filter(Boolean).length,
      })))

    addSheet(workbook, 'Gratitude', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Prompt', key: 'prompt', width: 40 },
      { header: 'Reflection', key: 'text', width: 60 },
    ], entries
      .filter(e => e.category === 'inspiration' && e.source === 'gratitude-practice')
      .map(e => ({
        study_id: studyIdOf(e.user_id),
        date: e.entry_date,
        prompt: e.payload?.prompt || '',
        text: e.payload?.text || '',
      })))

    // Sessions per (participant, calendar week) — answers "how many times
    // did they enter Recovery Island per week". Grouped by the week's actual
    // Monday date (not a raw ISO week number) so it's directly readable in
    // the spreadsheet without decoding "2026-W39".
    const sessionCounts = new Map() // `${userId}|${weekStart}` -> count
    events
      .filter(e => e.event_type === 'session_start')
      .forEach(e => {
        const key = `${e.user_id}|${mondayOf(e.created_at).toISOString().slice(0, 10)}`
        sessionCounts.set(key, (sessionCounts.get(key) || 0) + 1)
      })
    addSheet(workbook, 'Activity - Sessions', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Week Starting (Mon)', key: 'weekStart', width: 18 },
      { header: 'Sessions', key: 'count', width: 12 },
    ], Array.from(sessionCounts.entries())
      .map(([key, count]) => {
        const [userId, weekStart] = key.split('|')
        return { study_id: studyIdOf(userId), weekStart, count }
      })
      .sort((a, b) => a.study_id.localeCompare(b.study_id) || a.weekStart.localeCompare(b.weekStart)))

    // Total times each feature was used per participant — answers "how many
    // times did they use each feature". Counts villa page-views separately
    // from in-villa feature saves/clicks so both questions can be answered.
    const featureCounts = new Map() // `${userId}|${villa}|${feature}|${eventType}` -> count
    events
      .filter(e => e.event_type === 'villa_view' || e.event_type === 'feature_submit' || e.event_type === 'feature_click')
      .forEach(e => {
        const key = `${e.user_id}|${e.villa || ''}|${e.feature || ''}|${e.event_type}`
        featureCounts.set(key, (featureCounts.get(key) || 0) + 1)
      })
    addSheet(workbook, 'Activity - Feature Usage', [
      { header: 'Study ID', key: 'study_id', width: 16 },
      { header: 'Villa', key: 'villa', width: 16 },
      { header: 'Feature', key: 'feature', width: 20 },
      { header: 'Interaction Type', key: 'type', width: 16 },
      { header: 'Times Used', key: 'count', width: 12 },
    ], Array.from(featureCounts.entries())
      .map(([key, count]) => {
        const [userId, villa, feature, eventType] = key.split('|')
        return { study_id: studyIdOf(userId), villa, feature, type: eventType, count }
      })
      .sort((a, b) => a.study_id.localeCompare(b.study_id) || a.villa.localeCompare(b.villa)))

    const filenameSuffix = filterStudyId ? `-${filterStudyId}` : ''
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="recovery-island-export${filenameSuffix}-${new Date().toISOString().slice(0, 10)}.xlsx"`)
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error('Admin export failed', error)
    res.status(500).json({ message: error.message || 'Export failed' })
  }
})

// Aggregate KPIs + chart-ready series for the dashboard's overview section.
app.get('/api/admin/overview', async (req, res) => {
  if (!requireAdminKey(req, res)) return
  const admin = getSupabaseAdmin(res)
  if (!admin) return

  try {
    const [profiles, events] = await Promise.all([
      fetchAllRows(admin, 'profiles', 'id, study_id, created_at'),
      fetchAllRows(admin, 'activity_events', 'id, user_id, event_type, villa, feature, created_at'),
    ])

    const sessions = events.filter(e => e.event_type === 'session_start')
    const usageEvents = events.filter(e => e.event_type === 'feature_submit' || e.event_type === 'feature_click')
    const villaViews = events.filter(e => e.event_type === 'villa_view')

    // Last 8 calendar weeks of session counts, oldest first, zero-filled so
    // the trend chart doesn't skip weeks with no logins, labeled as relative
    // "Week 1..8" (not raw ISO week numbers) with real dates for hover.
    const sessionsByWeekMap = new Map()
    sessions.forEach(e => {
      const key = isoWeekKey(e.created_at)
      sessionsByWeekMap.set(key, (sessionsByWeekMap.get(key) || 0) + 1)
    })
    const eightWeeksAgo = new Date()
    eightWeeksAgo.setUTCDate(eightWeeksAgo.getUTCDate() - 7 * 7)
    const sessionsByWeek = buildWeekSeries(eightWeeksAgo, new Date(), sessionsByWeekMap)

    // Average villa visits per participant, per villa — "avg interaction per villa".
    const participantCount = profiles.length || 1
    const villaTotals = new Map()
    villaViews.forEach(e => {
      const villa = e.villa || 'unknown'
      villaTotals.set(villa, (villaTotals.get(villa) || 0) + 1)
    })
    const avgVisitsPerVilla = Array.from(villaTotals.entries())
      .map(([villa, total]) => ({ villa, total, avgPerParticipant: Math.round((total / participantCount) * 10) / 10 }))
      .sort((a, b) => b.total - a.total)

    // Most-used individual features (saves/clicks), across villas.
    const featureTotals = new Map()
    usageEvents.forEach(e => {
      const key = `${e.villa || 'unknown'}|${e.feature || 'unknown'}`
      featureTotals.set(key, (featureTotals.get(key) || 0) + 1)
    })
    const topFeatures = Array.from(featureTotals.entries())
      .map(([key, total]) => {
        const [villa, feature] = key.split('|')
        return { villa, feature, total }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 12)

    res.json({
      totalParticipants: profiles.length,
      totalSessions: sessions.length,
      sessionsThisWeek: sessionsByWeekMap.get(isoWeekKey(new Date())) || 0,
      avgFeaturesPerParticipant: Math.round((usageEvents.length / participantCount) * 10) / 10,
      sessionsByWeek,
      avgVisitsPerVilla,
      topFeatures,
    })
  } catch (error) {
    console.error('Admin overview failed', error)
    res.status(500).json({ message: error.message || 'Failed to load overview' })
  }
})

// Lightweight participant list for the dashboard's search box.
app.get('/api/admin/participants', async (req, res) => {
  if (!requireAdminKey(req, res)) return
  const admin = getSupabaseAdmin(res)
  if (!admin) return

  try {
    const [profiles, sessions] = await Promise.all([
      fetchAllRows(admin, 'profiles', 'id, study_id, created_at'),
      fetchAllRows(admin, 'activity_events', 'user_id, event_type, created_at').then(
        rows => rows.filter(e => e.event_type === 'session_start')
      ),
    ])

    const query = String(req.query.q || '').trim().toUpperCase()
    const lastActiveByUser = new Map()
    const sessionCountByUser = new Map()
    sessions.forEach(e => {
      sessionCountByUser.set(e.user_id, (sessionCountByUser.get(e.user_id) || 0) + 1)
      const prev = lastActiveByUser.get(e.user_id)
      if (!prev || new Date(e.created_at) > new Date(prev)) lastActiveByUser.set(e.user_id, e.created_at)
    })

    const results = profiles
      .filter(p => !query || p.study_id.toUpperCase().includes(query))
      .map(p => ({
        studyId: p.study_id,
        createdAt: p.created_at,
        totalSessions: sessionCountByUser.get(p.id) || 0,
        lastActive: lastActiveByUser.get(p.id) || null,
      }))
      .sort((a, b) => a.studyId.localeCompare(b.studyId))
      .slice(0, 50)

    res.json({ participants: results })
  } catch (error) {
    console.error('Admin participants list failed', error)
    res.status(500).json({ message: error.message || 'Failed to load participants' })
  }
})

// One participant's full usage breakdown, for the dashboard's detail view.
app.get('/api/admin/participants/:studyId', async (req, res) => {
  if (!requireAdminKey(req, res)) return
  const admin = getSupabaseAdmin(res)
  if (!admin) return

  const studyId = String(req.params.studyId || '').trim().toUpperCase()

  try {
    const profiles = await fetchAllRows(admin, 'profiles', 'id, study_id, created_at')
    const profile = profiles.find(p => p.study_id === studyId)
    if (!profile) {
      return res.status(404).json({ message: `No participant found with Study ID "${studyId}"` })
    }

    const allEvents = await fetchAllRows(admin, 'activity_events', 'id, event_type, villa, feature, created_at, user_id')
    const events = allEvents.filter(e => e.user_id === profile.id)

    const sessions = events.filter(e => e.event_type === 'session_start')
    const sessionsByWeekMap = new Map()
    sessions.forEach(e => {
      const key = isoWeekKey(e.created_at)
      sessionsByWeekMap.set(key, (sessionsByWeekMap.get(key) || 0) + 1)
    })
    // Week 1 = the week this participant's account was created, not the
    // calendar's week 1 — so the chart reads as *their* study timeline.
    const sessionsByWeek = buildWeekSeries(profile.created_at, new Date(), sessionsByWeekMap)

    const featureTotals = new Map()
    events
      .filter(e => e.event_type !== 'session_start')
      .forEach(e => {
        const key = `${e.villa || 'unknown'}|${e.feature || 'unknown'}|${e.event_type}`
        featureTotals.set(key, (featureTotals.get(key) || 0) + 1)
      })
    const featureUsage = Array.from(featureTotals.entries())
      .map(([key, total]) => {
        const [villa, feature, eventType] = key.split('|')
        return { villa, feature, eventType, total }
      })
      .sort((a, b) => b.total - a.total)

    const recentActivity = [...events]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 50)
      .map(e => ({ eventType: e.event_type, villa: e.villa, feature: e.feature, createdAt: e.created_at }))

    res.json({
      studyId: profile.study_id,
      createdAt: profile.created_at,
      totalSessions: sessions.length,
      sessionsByWeek,
      featureUsage,
      recentActivity,
    })
  } catch (error) {
    console.error('Admin participant detail failed', error)
    res.status(500).json({ message: error.message || 'Failed to load participant' })
  }
})

if (existsSync(distPath)) {
  app.use(express.static(distPath))

  app.get(/^\/(?!api\/).*/, (_, res) => {
    res.sendFile(join(distPath, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`Recovery Island server listening on http://localhost:${port}`)
})
