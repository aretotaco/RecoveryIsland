import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MaiaGuide from '../components/MaiaGuide'
import { fetchEntries, syncEntry } from '../lib/villaSync'

const ASSESS_CARDS = [
  {
    id: 'pss',
    shortName: 'PSS-10',
    name: 'Perceived Stress Scale',
    icon: '🌊',
    color: '#8b5cf6',
    desc: 'Measures perceived stress over the past month.',
    maxScore: 40,
    getSeverity: s =>
      s < 14  ? { label: 'Low',      color: '#10b981' } :
      s <= 26 ? { label: 'Moderate', color: '#f59e0b' } :
                { label: 'High',     color: '#ef4444' },
  },
  {
    id: 'phq',
    shortName: 'PHQ-9',
    name: 'Patient Health Questionnaire',
    icon: '💭',
    color: '#6366f1',
    desc: 'Screens for depression over the past two weeks.',
    maxScore: 27,
    getSeverity: s =>
      s <= 4  ? { label: 'None',           color: '#10b981' } :
      s <= 9  ? { label: 'Mild',           color: '#84cc16' } :
      s <= 14 ? { label: 'Moderate',       color: '#f59e0b' } :
      s <= 19 ? { label: 'Mod. Severe',    color: '#f97316' } :
                { label: 'Severe',         color: '#ef4444' },
  },
  {
    id: 'gad',
    shortName: 'GAD-7',
    name: 'General Anxiety Disorder',
    icon: '🫀',
    color: '#06b6d4',
    desc: 'Screens for generalised anxiety over the past two weeks.',
    maxScore: 21,
    getSeverity: s =>
      s <= 4  ? { label: 'None-Minimal', color: '#10b981' } :
      s <= 9  ? { label: 'Mild',         color: '#84cc16' } :
      s <= 14 ? { label: 'Moderate',     color: '#f59e0b' } :
                { label: 'Severe',       color: '#ef4444' },
  },
  {
    id: 'cdrisc',
    shortName: 'CD-RISC 5',
    name: 'Resilience Scale',
    icon: '🌱',
    color: '#10b981',
    desc: 'Measures your resilience and ability to adapt to challenges.',
    maxScore: 20,
    getSeverity: s =>
      s >= 14 ? { label: 'High',     color: '#10b981' } :
      s >= 7  ? { label: 'Moderate', color: '#f59e0b' } :
                { label: 'Low',      color: '#ef4444' },
  },
]

const MOODS = [
  { value: 5, emoji: '😄', label: 'Great',      color: '#10b981' },
  { value: 4, emoji: '😊', label: 'Good',       color: '#84cc16' },
  { value: 3, emoji: '😐', label: 'Okay',       color: '#f59e0b' },
  { value: 2, emoji: '😔', label: 'Low',        color: '#f97316' },
  { value: 1, emoji: '😢', label: 'Struggling', color: '#ef4444' },
]

const JOURNAL_PROMPTS = [
  'What emotion did you feel most strongly today, and what triggered it?',
  'What helped you feel even 1% safer, calmer, or more grounded today?',
  'What is one thought you can reframe with more self-compassion right now?',
  'Where did you show resilience today, even in a small way?',
  'What boundary did you honor today, or where do you want to set one tomorrow?',
  'What did your body need today that you may have ignored?',
  'What are you grateful for in this season, even if things feel hard?',
]

function todayStr() {
  return new Date().toDateString()
}

function readLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback }
}

function dayKeyFromTs(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function getBestStreak(list) {
  const days = [...new Set(list.map(item => dayKeyFromTs(item.ts)))].sort((a, b) => a - b)
  if (!days.length) return 0

  let best = 1
  let run = 1

  for (let i = 1; i < days.length; i += 1) {
    if (days[i] - days[i - 1] === 86400000) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 1
    }
  }

  return best
}

function getCurrentStreak(list) {
  const daySet = new Set(list.map(item => dayKeyFromTs(item.ts)))
  let count = 0

  for (let i = 0; i < 365; i += 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    if (!daySet.has(d.getTime())) break
    count += 1
  }

  return count
}

function sortByNewest(items) {
  return [...items].sort((a, b) => (b.ts || 0) - (a.ts || 0))
}

function getScoreValue(value) {
  if (typeof value === 'number') return value
  if (value && typeof value.score === 'number') return value.score
  return null
}

function normalizeAssessmentPayload(payload) {
  if (!payload || typeof payload !== 'object') return null

  if (payload.scores && payload.date) {
    return payload
  }

  const hasLegacyShape = ['pss', 'phq', 'gad', 'cdrisc'].some(key => payload[key] != null)
  if (!hasLegacyShape) return null

  return {
    id: Date.now(),
    date: new Date().toISOString(),
    adviceKey: 'selfcare',
    scores: payload,
  }
}

export default function MoodDiaryCentre() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Assessment scores saved by EmotionScales page
  const [savedScores, setSavedScores] = useState(() => readLS('ri_scores', {}))
  const [scoreHistory, setScoreHistory] = useState(() => readLS('ri_score_history', []))

  // Mood entries
  const [entries, setEntries] = useState(() => readLS('ri_moods', []))
  const [journalEntries, setJournalEntries] = useState(() => readLS('ri_reflective_journal', []))
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * JOURNAL_PROMPTS.length))

  const todayEntry = entries.find(e => new Date(e.ts).toDateString() === todayStr())
  const todayJournalEntry = journalEntries.find(e => new Date(e.ts).toDateString() === todayStr())
  const [selectedMood, setSelectedMood] = useState(
    todayEntry ? MOODS.find(m => m.value === todayEntry.value) ?? null : null
  )
  const [note, setNote] = useState(todayEntry?.note ?? '')
  const [saved, setSaved] = useState(!!todayEntry)
  const [journalText, setJournalText] = useState(todayJournalEntry?.text ?? '')
  const [journalSaved, setJournalSaved] = useState(!!todayJournalEntry)

  useEffect(() => {
    if (!isAuthenticated) return undefined

    let active = true

    async function hydrateDiary() {
      const [moodRows, journalRows, assessmentRows] = await Promise.all([
        fetchEntries({ category: 'mood', source: 'mood-diary', limit: 90 }),
        fetchEntries({ category: 'journal', source: 'mood-diary', limit: 90 }),
        fetchEntries({ category: 'assessment', source: 'emotion-scales', limit: 12 }),
      ])

      if (!active) return

      const remoteMoodEntries = sortByNewest(
        moodRows.map(row => row.payload).filter(entry => entry?.ts)
      )
      const remoteJournalEntries = sortByNewest(
        journalRows.map(row => row.payload).filter(entry => entry?.ts)
      )
      const remoteScoreHistory = [...assessmentRows]
        .map(row => normalizeAssessmentPayload(row.payload))
        .filter(Boolean)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      if (remoteMoodEntries.length > 0) {
        setEntries(remoteMoodEntries)
        localStorage.setItem('ri_moods', JSON.stringify(remoteMoodEntries))

        const remoteTodayEntry = remoteMoodEntries.find(entry => new Date(entry.ts).toDateString() === todayStr())
        setSelectedMood(remoteTodayEntry ? MOODS.find(m => m.value === remoteTodayEntry.value) ?? null : null)
        setNote(remoteTodayEntry?.note ?? '')
        setSaved(Boolean(remoteTodayEntry))
      }

      if (remoteJournalEntries.length > 0) {
        setJournalEntries(remoteJournalEntries)
        localStorage.setItem('ri_reflective_journal', JSON.stringify(remoteJournalEntries))

        const remoteTodayJournal = remoteJournalEntries.find(entry => new Date(entry.ts).toDateString() === todayStr())
        setJournalText(remoteTodayJournal?.text ?? '')
        setJournalSaved(Boolean(remoteTodayJournal))
      }

      if (remoteScoreHistory.length > 0) {
        const latestScores = remoteScoreHistory[0]?.scores || {}
        setScoreHistory(remoteScoreHistory)
        setSavedScores(latestScores)
        localStorage.setItem('ri_score_history', JSON.stringify(remoteScoreHistory))
        localStorage.setItem('ri_scores', JSON.stringify(latestScores))
      }
    }

    hydrateDiary()

    return () => {
      active = false
    }
  }, [isAuthenticated])

  function saveMood() {
    if (!selectedMood) return
    const ts = Date.now()
    const entry = { ts, value: selectedMood.value, emoji: selectedMood.emoji, label: selectedMood.label, note }
    const updated = [...entries.filter(e => new Date(e.ts).toDateString() !== todayStr()), entry]
    setEntries(updated)
    localStorage.setItem('ri_moods', JSON.stringify(updated))
    setSaved(true)
    syncEntry({
      category: 'mood',
      source: 'mood-diary',
      entryKey: todayStr(),
      entryDate: todayStr(),
      payload: entry,
    })
  }

  function rotatePrompt() {
    setPromptIndex(p => (p + 1) % JOURNAL_PROMPTS.length)
  }

  function saveJournal() {
    const trimmed = journalText.trim()
    if (trimmed.length < 10) return

    const ts = Date.now()
    const entry = {
      ts,
      prompt: JOURNAL_PROMPTS[promptIndex],
      text: trimmed,
      wordCount: trimmed.split(/\s+/).filter(Boolean).length,
    }

    const updated = [...journalEntries.filter(e => new Date(e.ts).toDateString() !== todayStr()), entry]
      .sort((a, b) => b.ts - a.ts)

    setJournalEntries(updated)
    localStorage.setItem('ri_reflective_journal', JSON.stringify(updated))
    setJournalSaved(true)

    syncEntry({
      category: 'journal',
      source: 'mood-diary',
      entryKey: `journal-${todayStr()}`,
      entryDate: todayStr(),
      payload: entry,
    })
  }

  // Last 7 days for insights
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const ds = d.toDateString()
    const entry = entries.find(e => new Date(e.ts).toDateString() === ds)
    return { ds, day: d.toLocaleDateString('en', { weekday: 'short' }), entry }
  })

  const filledDays = last7.filter(d => d.entry)
  const avgMood = filledDays.length
    ? (filledDays.reduce((s, d) => s + d.entry.value, 0) / filledDays.length).toFixed(1)
    : null

  const topMood = filledDays.length
    ? MOODS.map(m => ({ ...m, count: filledDays.filter(d => d.entry.value === m.value).length }))
        .sort((a, b) => b.count - a.count)[0]
    : null

  const trend = filledDays.length >= 2
    ? filledDays[filledDays.length - 1].entry.value - filledDays[0].entry.value
    : null

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const ds = d.toDateString()
    const entry = entries.find(e => new Date(e.ts).toDateString() === ds)
    return { ds, day: d.getDate(), month: d.getMonth(), entry }
  })

  const streak = (() => {
    let count = 0
    for (let i = 0; i < 30; i += 1) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const found = entries.find(e => new Date(e.ts).toDateString() === d.toDateString())
      if (!found) break
      count += 1
    }
    return count
  })()

  const monthAverage = last30.filter(d => d.entry).length
    ? (last30.filter(d => d.entry).reduce((sum, d) => sum + d.entry.value, 0) / last30.filter(d => d.entry).length).toFixed(1)
    : null

  const journalHistory = [...journalEntries].sort((a, b) => b.ts - a.ts).slice(0, 4)
  const moodEntryDays = new Set(entries.map(e => new Date(e.ts).toDateString())).size
  const journalEntryDays = new Set(journalEntries.map(e => new Date(e.ts).toDateString())).size
  const journalWordCount = journalEntries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0)
  const bestMoodStreak = getBestStreak(entries)
  const journalStreak = getCurrentStreak(journalEntries)
  const completedAssessments = ASSESS_CARDS.filter(card => getScoreValue(savedScores[card.id]) != null).length

  const milestones = [
    {
      id: 'mood-first',
      icon: '🎯',
      title: 'First mood check-in',
      detail: 'Log your first emotion entry.',
      current: moodEntryDays,
      target: 1,
    },
    {
      id: 'mood-streak',
      icon: '🔥',
      title: '7-day mood streak',
      detail: 'Build a consistent check-in habit.',
      current: bestMoodStreak,
      target: 7,
    },
    {
      id: 'journal-start',
      icon: '✍️',
      title: '3 reflections written',
      detail: 'Write three reflective journal entries.',
      current: journalEntryDays,
      target: 3,
    },
    {
      id: 'journal-depth',
      icon: '📚',
      title: '300 reflection words',
      detail: 'Grow depth in your journalling practice.',
      current: journalWordCount,
      target: 300,
    },
    {
      id: 'assessment',
      icon: '🧭',
      title: 'Assessment explorer',
      detail: 'Complete all four emotion assessments.',
      current: completedAssessments,
      target: 4,
    },
    {
      id: 'journal-streak',
      icon: '🌱',
      title: '5-day journal streak',
      detail: 'Write reflections five days in a row.',
      current: journalStreak,
      target: 5,
    },
  ]

  const unlockedCount = milestones.filter(m => m.current >= m.target).length
  const milestoneProgress = Math.round((unlockedCount / milestones.length) * 100)

  return (
    <div className="villa-page" style={{ '--villa-color': '#8b5cf6', '--villa-color-light': '#c4b5fd' }}>
      <div className="villa-bg">
        <div className="villa-bg-orb orb1" />
        <div className="villa-bg-orb orb2" />
        <div className="villa-bg-orb orb3" />
      </div>

      <button className="back-btn" onClick={() => navigate('/')}>← Back to Island</button>

      <div className="villa-hero">
        <div className="villa-emoji">📓</div>
        <div className="villa-tag">Villa 2</div>
        <h1 className="villa-title">Mood Diary Centre</h1>
        <p className="villa-subtitle">Every emotion tells a story. Here, you write yours.</p>
      </div>

      <div className="mdc-page">

        {/* ── Assessment Cards ── */}
        <p className="mdc-label">My Emotion Assessments</p>
        <div className="mdc-assess-grid">
          {ASSESS_CARDS.map(card => {
            const s = savedScores[card.id]
            const score = getScoreValue(s)
            const sev = score != null ? card.getSeverity(score) : null
            return (
              <div key={card.id} className="mdc-assess-card" style={{ '--ac': card.color }}>
                <div className="mdc-assess-top">
                  <span className="mdc-assess-icon">{card.icon}</span>
                  <div>
                    <div className="mdc-assess-short">{card.shortName}</div>
                    <div className="mdc-assess-name">{card.name}</div>
                  </div>
                </div>
                <p className="mdc-assess-desc">{card.desc}</p>
                <div className="mdc-assess-score-row">
                  {sev ? (
                    <>
                      <span className="mdc-assess-score-val" style={{ color: card.color }}>
                        {score}<span className="mdc-assess-max">/{card.maxScore}</span>
                      </span>
                      <span className="mdc-sev-pill" style={{ background: sev.color + '22', color: sev.color }}>
                        {sev.label}
                      </span>
                    </>
                  ) : (
                    <span className="mdc-not-taken">Not taken yet</span>
                  )}
                </div>
                {s?.date && (
                  <p style={{ marginTop: 10, fontSize: '0.74rem', color: 'rgba(255,240,200,0.45)' }}>
                    Saved {new Date(s.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                <button className="mdc-assess-btn" onClick={() => navigate('/emotion-scales')}>
                  {sev ? 'Retake →' : 'Take Assessment →'}
                </button>
              </div>
            )
          })}
        </div>

        {scoreHistory.length > 0 && (
          <>
            <p className="mdc-label">Assessment History</p>
            <div className="mdc-card">
              <div className="mdc-card-header">
                <span className="mdc-card-icon">🗂️</span>
                <div>
                  <h3 className="mdc-card-title">Previous questionnaire snapshots</h3>
                  <p className="mdc-card-sub">Your latest saved assessment runs stay visible here when you come back.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {scoreHistory.slice(0, 6).map(entry => (
                  <div key={entry.id} style={{ display: 'grid', gap: 10, padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', color: 'rgba(255,240,200,0.7)', fontSize: '0.82rem' }}>
                      <span>{new Date(entry.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>{entry.adviceKey === 'emergency' ? 'High-support recommendation' : entry.adviceKey === 'professional' ? 'Professional-support recommendation' : 'Self-care recommendation'}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                      {ASSESS_CARDS.map(card => {
                        const historyScore = entry.scores?.[card.id]
                        const historySeverity = historyScore ? card.getSeverity(historyScore.score) : null
                        return (
                          <div key={card.id} style={{ padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,240,200,0.45)', marginBottom: 4 }}>{card.shortName}</div>
                            <div style={{ color: historySeverity?.color || 'white', fontWeight: 700 }}>{historyScore?.score ?? '--'} / {card.maxScore}</div>
                            {historySeverity && <div style={{ fontSize: '0.74rem', color: historySeverity.color, marginTop: 4 }}>{historySeverity.label}</div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Track Your Emotions ── */}
        <p className="mdc-label">Track Your Emotions</p>
        <div className="mdc-card">
          <div className="mdc-card-header">
            <span className="mdc-card-icon">🎭</span>
            <div>
              <h3 className="mdc-card-title">How are you feeling today?</h3>
              <p className="mdc-card-sub">
                {new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          {saved && todayEntry ? (
            <div className="mdc-saved-state">
              <span className="mdc-saved-emoji">{todayEntry.emoji}</span>
              <div>
                <p className="mdc-saved-text">
                  You logged <strong style={{ color: '#c4b5fd' }}>{todayEntry.label}</strong> today
                </p>
                {todayEntry.note && <p className="mdc-saved-note">"{todayEntry.note}"</p>}
                <button className="mdc-update-btn" onClick={() => setSaved(false)}>Update entry</button>
              </div>
            </div>
          ) : (
            <>
              <div className="mdc-mood-row">
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    className={`mdc-mood-btn ${selectedMood?.value === m.value ? 'mdc-mood-btn--on' : ''}`}
                    style={{ '--mc': m.color }}
                    onClick={() => { setSelectedMood(m); setSaved(false) }}
                  >
                    <span className="mdc-mood-emoji">{m.emoji}</span>
                    <span className="mdc-mood-label">{m.label}</span>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <>
                  <textarea
                    className="mdc-note-input"
                    placeholder="Add a note about your day (optional)…"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={2}
                  />
                  <button className="mdc-save-btn" onClick={saveMood}>
                    Save Today's Mood
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* ── Mood Insights ── */}
        <p className="mdc-label">Mood Insights</p>
        <div className="mdc-card">
          <div className="mdc-card-header">
            <span className="mdc-card-icon">📊</span>
            <div>
              <h3 className="mdc-card-title">Your Past 7 Days</h3>
              <p className="mdc-card-sub">
                {avgMood
                  ? <>Average mood: <strong style={{ color: '#c4b5fd' }}>{avgMood}/5</strong> across {filledDays.length} {filledDays.length === 1 ? 'entry' : 'entries'}</>
                  : 'Start logging daily to see your patterns here'}
              </p>
            </div>
          </div>

          <div className="mdc-week-row">
            {last7.map((day, i) => {
              const mood = day.entry ? MOODS.find(m => m.value === day.entry.value) : null
              return (
                <div key={i} className="mdc-day-col">
                  <div
                    className="mdc-day-circle"
                    style={mood
                      ? { background: mood.color + '2a', border: `2px solid ${mood.color}`, color: mood.color }
                      : {}}
                    title={mood ? `${day.day}: ${mood.label}` : day.day}
                  >
                    {mood ? mood.emoji : '·'}
                  </div>
                  <span className="mdc-day-label">{day.day}</span>
                </div>
              )
            })}
          </div>

          {filledDays.length > 0 && (
            <div className="mdc-insight-summary">
              {topMood && (
                <p className="mdc-insight-line">
                  Most common: <span style={{ color: topMood.color }}>{topMood.emoji} {topMood.label}</span>
                </p>
              )}
              {trend !== null && (
                <p className="mdc-insight-line">
                  Trend:{' '}
                  <span style={{ color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#f59e0b' }}>
                    {trend > 0 ? '↑ Improving' : trend < 0 ? '↓ Declining' : '→ Stable'}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Monthly Mood Snapshot ── */}
        <p className="mdc-label">Monthly Mood Snapshot</p>
        <div className="mdc-card">
          <div className="mdc-card-header">
            <span className="mdc-card-icon">📈</span>
            <div>
              <h3 className="mdc-card-title">Last 30 days at a glance</h3>
              <p className="mdc-card-sub">
                {monthAverage
                  ? <>Average mood: <strong style={{ color: '#c4b5fd' }}>{monthAverage}/5</strong> · {streak} day{streak === 1 ? '' : 's'} tracked in a row</>
                  : 'Use daily check-ins to build a fuller picture over time'}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 6 }}>
            {last30.map((day, i) => {
              const mood = day.entry ? MOODS.find(m => m.value === day.entry.value) : null
              const barHeight = mood ? `${20 + mood.value * 14}%` : '12%'
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }} title={mood ? `${day.entry.label} on ${day.ds}` : `No entry on ${day.ds}`}>
                  <div style={{ width: '100%', height: 86, display: 'flex', alignItems: 'end', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', padding: 6 }}>
                    <div style={{ width: '100%', height: barHeight, minHeight: 10, borderRadius: 8, background: mood ? mood.color : 'rgba(255,255,255,0.14)', opacity: mood ? 0.95 : 0.5, transition: 'height 0.2s' }} />
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,240,200,0.45)' }}>{day.day}</span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            <div style={{ flex: '1 1 180px', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '0.74rem', color: 'rgba(255,240,200,0.45)', marginBottom: 4 }}>Current streak</p>
              <p style={{ color: 'white', fontSize: '1.05rem' }}>{streak} day{streak === 1 ? '' : 's'}</p>
            </div>
            <div style={{ flex: '1 1 180px', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '0.74rem', color: 'rgba(255,240,200,0.45)', marginBottom: 4 }}>Entries logged</p>
              <p style={{ color: 'white', fontSize: '1.05rem' }}>{last30.filter(d => d.entry).length} / 30 days</p>
            </div>
            <div style={{ flex: '1 1 180px', padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '0.74rem', color: 'rgba(255,240,200,0.45)', marginBottom: 4 }}>Momentum</p>
              <p style={{ color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#f59e0b', fontSize: '1.05rem' }}>
                {trend > 0 ? 'Improving' : trend < 0 ? 'Needs support' : 'Stable'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Reflective Journalling ── */}
        <p className="mdc-label">Reflective Journalling</p>
        <div className="mdc-card">
          <div className="mdc-card-header">
            <span className="mdc-card-icon">✍️</span>
            <div>
              <h3 className="mdc-card-title">Guided Reflection Studio</h3>
              <p className="mdc-card-sub">
                {journalEntries.length
                  ? `${journalEntries.length} reflection${journalEntries.length === 1 ? '' : 's'} saved so far`
                  : 'Start your first reflection with a guided prompt'}
              </p>
            </div>
          </div>

          {journalSaved && todayJournalEntry ? (
            <div className="mdc-journal-saved">
              <p className="mdc-journal-saved-label">Today&apos;s reflection</p>
              <p className="mdc-journal-saved-prompt">Prompt: {todayJournalEntry.prompt}</p>
              <p className="mdc-journal-saved-text">{todayJournalEntry.text}</p>
              <button className="mdc-update-btn" onClick={() => setJournalSaved(false)}>Update reflection</button>
            </div>
          ) : (
            <>
              <div className="mdc-journal-prompt-shell">
                <p className="mdc-journal-prompt-label">Prompt</p>
                <p className="mdc-journal-prompt-text">{JOURNAL_PROMPTS[promptIndex]}</p>
                <button className="mdc-journal-next" onClick={rotatePrompt}>Try another prompt</button>
              </div>

              <textarea
                className="mdc-note-input mdc-journal-input"
                placeholder="Write your reflection here..."
                value={journalText}
                onChange={e => { setJournalText(e.target.value); setJournalSaved(false) }}
                rows={5}
              />
              <div className="mdc-journal-actions">
                <p className="mdc-journal-count">{journalText.trim().split(/\s+/).filter(Boolean).length} words</p>
                <button className="mdc-save-btn" onClick={saveJournal} disabled={journalText.trim().length < 10}>
                  Save Reflection
                </button>
              </div>
            </>
          )}

          {journalHistory.length > 0 && (
            <div className="mdc-journal-history">
              <p className="mdc-journal-history-label">Recent reflections</p>
              {journalHistory.map(entry => (
                <div key={entry.ts} className="mdc-journal-item">
                  <div className="mdc-journal-item-top">
                    <span>{new Date(entry.ts).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>{entry.wordCount || entry.text.trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <p className="mdc-journal-item-text">{entry.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Growth Milestones ── */}
        <p className="mdc-label">Growth Milestones</p>
        <div className="mdc-card">
          <div className="mdc-card-header">
            <span className="mdc-card-icon">🌱</span>
            <div>
              <h3 className="mdc-card-title">Progress Path</h3>
              <p className="mdc-card-sub">{unlockedCount} of {milestones.length} milestones unlocked</p>
            </div>
          </div>

          <div className="mdc-milestone-progress-shell" aria-label="Milestone progress">
            <div className="mdc-milestone-progress-bar" style={{ width: `${milestoneProgress}%` }} />
          </div>

          <div className="mdc-milestone-grid">
            {milestones.map(m => {
              const achieved = m.current >= m.target
              const progress = Math.min(100, Math.round((m.current / m.target) * 100))
              return (
                <div key={m.id} className={`mdc-milestone-card ${achieved ? 'mdc-milestone-card--done' : ''}`}>
                  <div className="mdc-milestone-title-row">
                    <span className="mdc-milestone-icon">{m.icon}</span>
                    <p className="mdc-milestone-title">{m.title}</p>
                  </div>
                  <p className="mdc-milestone-detail">{m.detail}</p>
                  <p className="mdc-milestone-meta">
                    <strong>{Math.min(m.current, m.target)}</strong> / {m.target}
                  </p>
                  <div className="mdc-milestone-track">
                    <div className="mdc-milestone-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <p className={`mdc-milestone-status ${achieved ? 'mdc-milestone-status--done' : ''}`}>
                    {achieved ? 'Unlocked' : `${progress}% complete`}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Insights ── */}
        <div className="mdc-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div className="mdc-card-header" style={{ marginBottom: 0 }}>
            <span className="mdc-card-icon">🔎</span>
            <div>
              <h3 className="mdc-card-title">See the patterns behind your data</h3>
              <p className="mdc-card-sub">Mood, sleep, movement, and assessments, connected in one view.</p>
            </div>
          </div>
          <button className="mdc-assess-btn" style={{ flexShrink: 0 }} onClick={() => navigate('/insights')}>
            View My Insights →
          </button>
        </div>

      </div>

      <MaiaGuide villaId={2} />
    </div>
  )
}
