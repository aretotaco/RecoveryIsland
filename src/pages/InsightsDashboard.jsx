import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchEntries } from '../lib/villaSync'

const ASSESS_META = {
  pss:    { shortName: 'PSS-10',   maxScore: 40, color: '#8b5cf6', getSeverity: s => s < 14 ? 'Low' : s <= 26 ? 'Moderate' : 'High' },
  phq:    { shortName: 'PHQ-9',    maxScore: 27, color: '#6366f1', getSeverity: s => s <= 4 ? 'None' : s <= 9 ? 'Mild' : s <= 14 ? 'Moderate' : s <= 19 ? 'Mod. Severe' : 'Severe' },
  gad:    { shortName: 'GAD-7',    maxScore: 21, color: '#06b6d4', getSeverity: s => s <= 4 ? 'None-Minimal' : s <= 9 ? 'Mild' : s <= 14 ? 'Moderate' : 'Severe' },
  cdrisc: { shortName: 'CD-RISC 5', maxScore: 20, color: '#10b981', getSeverity: s => s >= 14 ? 'High' : s >= 7 ? 'Moderate' : 'Low' },
}

function dayKeyFromTs(ts) {
  return new Date(ts).toDateString()
}

function bucketSleep(hours) {
  if (hours < 6) return 'Under 6h'
  if (hours <= 8) return '6-8h'
  return 'Over 8h'
}

export default function InsightsDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [moodByDay, setMoodByDay] = useState({})
  const [sleepByDay, setSleepByDay] = useState({})
  const [movementDays, setMovementDays] = useState(new Set())
  const [assessmentHistory, setAssessmentHistory] = useState([])

  useEffect(() => {
    let active = true

    async function load() {
      const [moodRows, sleepRows, movementRows, assessmentRows] = await Promise.all([
        fetchEntries({ category: 'mood', source: 'mood-diary', limit: 60 }),
        fetchEntries({ category: 'wellness', source: 'sleep-tracker', limit: 60 }),
        fetchEntries({ category: 'wellness', source: 'movement-tracker', limit: 60 }),
        fetchEntries({ category: 'assessment', source: 'emotion-scales', limit: 12 }),
      ])

      if (!active) return

      const moodMap = {}
      moodRows.forEach(row => {
        const p = row.payload
        if (p?.ts) moodMap[dayKeyFromTs(p.ts)] = p.value
      })

      const sleepMap = {}
      sleepRows.forEach(row => {
        if (row.payload?.hours != null && row.entry_date) sleepMap[row.entry_date] = row.payload.hours
      })

      const movementSet = new Set()
      movementRows.forEach(row => {
        const p = row.payload
        const hasMovement = (p?.preset?.length > 0) || (p?.custom?.length > 0)
        if (hasMovement && row.entry_date) movementSet.add(row.entry_date)
      })

      const history = assessmentRows
        .map(row => row.payload)
        .filter(p => p?.date && p?.scores)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setMoodByDay(moodMap)
      setSleepByDay(sleepMap)
      setMovementDays(movementSet)
      setAssessmentHistory(history)
      setLoading(false)
    }

    load()
    return () => { active = false }
  }, [])

  const hasAnyData = Object.keys(moodByDay).length > 0

  const sleepBuckets = { 'Under 6h': [], '6-8h': [], 'Over 8h': [] }
  Object.entries(sleepByDay).forEach(([day, hours]) => {
    if (moodByDay[day] != null) sleepBuckets[bucketSleep(hours)].push(moodByDay[day])
  })

  const movementBuckets = { Logged: [], 'Not logged': [] }
  Object.entries(moodByDay).forEach(([day, mood]) => {
    movementBuckets[movementDays.has(day) ? 'Logged' : 'Not logged'].push(mood)
  })

  function avg(list) {
    return list.length ? (list.reduce((s, v) => s + v, 0) / list.length).toFixed(1) : null
  }

  const vs = { '--villa-color': '#6366f1', '--villa-color-light': '#a5b4fc' }

  return (
    <div className="villa-page" style={vs}>
      <div className="villa-bg">
        <div className="villa-bg-orb orb1" />
        <div className="villa-bg-orb orb2" />
        <div className="villa-bg-orb orb3" />
      </div>
      <button className="back-btn" onClick={() => navigate('/mood-diary')}>← Back to Mood Diary</button>

      <div className="villa-hero">
        <div className="villa-emoji">🔎</div>
        <div className="villa-tag">Insights Dashboard</div>
        <h1 className="villa-title">Your Patterns</h1>
        <p className="villa-subtitle">Quiet connections between how you sleep, move, and feel — built from what you've already logged.</p>
      </div>

      <div className="villa-content">
        {loading && (
          <div className="villa-card">
            <p className="card-text">Gathering your data...</p>
          </div>
        )}

        {!loading && !hasAnyData && (
          <div className="villa-card">
            <div className="card-icon">🌱</div>
            <h3 className="card-title">Not enough data yet</h3>
            <p className="card-text">Log a few days of mood check-ins in the Mood Diary Centre, and insights will start appearing here.</p>
            <button className="card-btn" onClick={() => navigate('/mood-diary')}>Go to Mood Diary Centre →</button>
          </div>
        )}

        {!loading && hasAnyData && (
          <>
            <div className="villa-card">
              <div className="card-icon">😴</div>
              <h3 className="card-title">Mood by Sleep</h3>
              <p className="card-text">Average mood (out of 5) on days grouped by how much sleep you logged the same day.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(sleepBuckets).map(([label, list]) => {
                  const a = avg(list)
                  return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 90, fontSize: '0.82rem', color: 'rgba(255,240,200,0.6)' }}>{label}</span>
                      <div style={{ flex: 1, height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: a ? `${(a / 5) * 100}%` : '0%', background: 'linear-gradient(90deg, #6366f1, #a5b4fc)', borderRadius: 999 }} />
                      </div>
                      <span style={{ width: 70, fontSize: '0.82rem', color: 'white', textAlign: 'right' }}>{a ? `${a}/5` : `${list.length ? '' : 'no data'}`}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="villa-card">
              <div className="card-icon">🏃</div>
              <h3 className="card-title">Mood by Movement</h3>
              <p className="card-text">Average mood on days you logged any movement in the Wellness Villa vs. days you didn't.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(movementBuckets).map(([label, list]) => {
                  const a = avg(list)
                  return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 90, fontSize: '0.82rem', color: 'rgba(255,240,200,0.6)' }}>{label}</span>
                      <div style={{ flex: 1, height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: a ? `${(a / 5) * 100}%` : '0%', background: 'linear-gradient(90deg, #10b981, #6ee7b7)', borderRadius: 999 }} />
                      </div>
                      <span style={{ width: 70, fontSize: '0.82rem', color: 'white', textAlign: 'right' }}>{a ? `${a}/5` : 'no data'}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="villa-card">
              <div className="card-icon">📈</div>
              <h3 className="card-title">Assessment Trend</h3>
              {assessmentHistory.length === 0 ? (
                <p className="card-text">Take the emotion assessments a couple of times over a few weeks to see your trend here.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {assessmentHistory.map(entry => (
                    <div key={entry.id} style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,240,200,0.45)', marginBottom: 8 }}>
                        {new Date(entry.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
                        {Object.entries(entry.scores || {}).map(([id, s]) => {
                          const meta = ASSESS_META[id]
                          if (!meta) return null
                          return (
                            <div key={id} style={{ fontSize: '0.78rem' }}>
                              <span style={{ color: meta.color, fontWeight: 700 }}>{meta.shortName}</span>{' '}
                              <span style={{ color: 'white' }}>{s.score}/{meta.maxScore}</span>{' '}
                              <span style={{ color: 'rgba(255,240,200,0.45)' }}>({meta.getSeverity(s.score)})</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
