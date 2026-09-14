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

app.delete('/api/account', async (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Missing auth token' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ message: 'Account deletion is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY to your server .env file.' })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)

  const { data: userData, error: userError } = await admin.auth.getUser(token)
  if (userError || !userData?.user) {
    return res.status(401).json({ message: 'Invalid or expired session' })
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userData.user.id)
  if (deleteError) {
    return res.status(500).json({ message: deleteError.message || 'Unable to delete account' })
  }

  return res.status(200).json({ ok: true })
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

// Admin-only export: pulls every participant's data into one Excel workbook
// for the research team. Never exposes the internal user id or synthetic
// login email — only the Study ID.
app.get('/api/admin/export-excel', async (req, res) => {
  const adminKey = process.env.ADMIN_EXPORT_KEY
  if (!adminKey) {
    return res.status(500).json({ message: 'Admin export is not configured yet. Add ADMIN_EXPORT_KEY to your server .env file.' })
  }

  const providedKey = req.headers['x-admin-key'] || req.query.key
  if (providedKey !== adminKey) {
    return res.status(401).json({ message: 'Invalid admin key' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ message: 'Add SUPABASE_SERVICE_ROLE_KEY to your server .env file.' })
  }

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey)

    const [profiles, entries] = await Promise.all([
      fetchAllRows(admin, 'profiles', 'id, study_id, display_name, created_at, updated_at'),
      fetchAllRows(admin, 'villa_entries', 'id, user_id, category, source, entry_date, entry_key, payload, updated_at'),
    ])

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

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="recovery-island-export-${new Date().toISOString().slice(0, 10)}.xlsx"`)
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error('Admin export failed', error)
    res.status(500).json({ message: error.message || 'Export failed' })
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
