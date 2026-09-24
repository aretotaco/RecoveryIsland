import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchEntries, syncEntry } from '../lib/villaSync'
import { SCALES, computeScore } from '../lib/assessments'

const ANSWERS_KEY = 'ri_score_answers'
const ANSWERS_DATE_KEY = 'ri_score_answers_date'
const SCORES_KEY = 'ri_scores'
const SCORE_HISTORY_KEY = 'ri_score_history'

function readLS(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

function todayKey() {
  return new Date().toDateString()
}

// If the in-progress/completed answers were saved on a previous day, drop
// them so the form starts fresh instead of showing yesterday's (or last
// week's) results forever. This never touches SCORE_HISTORY_KEY or the
// synced Supabase history — only today's working answers.
function loadTodaysAnswers() {
  const savedDate = localStorage.getItem(ANSWERS_DATE_KEY)
  if (savedDate !== todayKey()) {
    localStorage.removeItem(ANSWERS_KEY)
    localStorage.removeItem(ANSWERS_DATE_KEY)
    return {}
  }
  return readLS(ANSWERS_KEY, {})
}

function getAdviceKey(scores, phqAnswers) {
  // Any score > 0 on PHQ-9 item 9 (suicidal ideation) is clinically significant
  if (phqAnswers[8] !== undefined && phqAnswers[8] > 0) return 'emergency'
  if (scores.phq >= 20 || scores.gad >= 15 || scores.pss >= 27) return 'emergency'
  if (scores.phq >= 10 || scores.gad >= 10 || scores.pss >= 14) return 'professional'
  return 'selfcare'
}

const ADVICE = {
  emergency: {
    emoji: '🆘',
    title: 'Seek support immediately',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    body: "Your scores suggest you may be experiencing significant distress right now. Please reach out to a mental health professional or crisis line as soon as possible. You do not have to face this alone — help is available and you deserve care right now.",
    steps: [
      'Call a mental health crisis line immediately',
      'Visit your nearest emergency department if you are in immediate danger',
      'Contact your doctor, therapist, or a trusted person today',
    ],
    actions: [
      { label: 'Crisis Support', path: '/crisis-support', color: '#ef4444' },
    ],
  },
  professional: {
    emoji: '🩺',
    title: 'Make an appointment soon',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
    body: "Your scores suggest you would benefit from professional support. Booking an appointment with a mental health professional is a brave and caring step — and you deserve to feel better.",
    steps: [
      'Book an appointment with a psychologist, counsellor, or GP',
      'Talk to someone you trust about how you have been feeling',
      'In the meantime, explore the self-care resources on this island',
    ],
    actions: [
      { label: 'Mindfulness Villa', path: '/mindfulness', color: '#10b981' },
      { label: 'Chat with Sage', path: '/ai-chatbot', color: '#6366f1' },
    ],
  },
  selfcare: {
    emoji: '🌸',
    title: 'Keep nurturing your wellbeing',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.3)',
    body: "Your scores suggest you are coping reasonably well. I encourage you to keep nurturing yourself with gentle, consistent care. These resources are always here for you whenever you need them.",
    steps: [
      'Visit the Mindfulness Villa for guided breathing and meditation practices',
      'Chat with Sage, our AI wellbeing companion, whenever you need support',
      'Come back and retake these assessments in a few weeks to track your progress',
    ],
    actions: [
      { label: 'Mindfulness Villa', path: '/mindfulness', color: '#10b981' },
      { label: 'Chat with Sage', path: '/ai-chatbot', color: '#6366f1' },
    ],
  },
}

function ScaleSection({ scale, allAnswers, onChange }) {
  const [open, setOpen] = useState(false)
  const ans = allAnswers[scale.id] || {}
  const answeredCount = scale.questions.filter((_, i) => ans[i] !== undefined).length
  const complete = answeredCount === scale.questions.length
  const score = complete ? computeScore(scale, ans) : null
  const severity = complete ? scale.getSeverity(score) : null

  return (
    <div className="es-card" style={{ '--es-c': scale.color }}>
      <button className="es-card-header" onClick={() => setOpen(v => !v)}>
        <span className="es-card-icon">{scale.icon}</span>
        <div className="es-card-meta">
          <span className="es-card-short">{scale.shortName}</span>
          <span className="es-card-name">{scale.name}</span>
        </div>
        <div className="es-card-right">
          {complete && severity ? (
            <span className="es-badge" style={{ background: severity.color + '22', color: severity.color }}>
              {score}/{scale.maxScore} · {severity.label}
            </span>
          ) : (
            <span className="es-progress-text">{answeredCount}/{scale.questions.length}</span>
          )}
          <span className="es-chevron">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="es-card-body">
          <p className="es-intro-text">{scale.intro}</p>
          <div className="es-legend">
            {scale.options.map((opt, i) => (
              <span key={i} className="es-legend-item">
                <strong>{i}</strong> = {opt}
              </span>
            ))}
          </div>

          {scale.questions.map((q, qi) => (
            <div key={qi} className={`es-question ${ans[qi] !== undefined ? 'es-question--done' : ''}`}>
              <p className="es-q-text">
                <span className="es-q-num">{qi + 1}.</span> {q}
              </p>
              <div className="es-option-row">
                {scale.options.map((_, oi) => (
                  <button
                    key={oi}
                    className={`es-opt-btn ${ans[qi] === oi ? 'es-opt-btn--selected' : ''}`}
                    onClick={() => onChange(scale.id, qi, oi)}
                  >
                    {oi}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {complete && severity && (
            <div className="es-section-score" style={{ borderColor: severity.color + '55', background: severity.color + '11' }}>
              <span style={{ color: 'var(--ri-text-secondary)', fontSize: 14 }}>Section score:</span>
              <span style={{ color: severity.color, fontWeight: 600, fontSize: 15 }}>
                {score}/{scale.maxScore}
              </span>
              <span className="es-sev-pill" style={{ background: severity.color + '22', color: severity.color }}>
                {severity.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function EmotionScales() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [answers, setAnswers] = useState(() => loadTodaysAnswers())
  const [showResults, setShowResults] = useState(() => {
    const savedAnswers = loadTodaysAnswers()
    return SCALES.every(scale => scale.questions.every((_, index) => savedAnswers[scale.id]?.[index] !== undefined))
  })

  useEffect(() => {
    if (!isAuthenticated) return undefined

    let active = true

    async function hydrateAssessments() {
      const assessmentRows = await fetchEntries({ category: 'assessment', source: 'emotion-scales', limit: 12 })
      if (!active || assessmentRows.length === 0) return

      const remoteHistory = assessmentRows
        .map(row => row.payload)
        .filter(entry => entry?.date && entry?.scores)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      if (remoteHistory.length === 0) return

      localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(remoteHistory))
      localStorage.setItem(SCORES_KEY, JSON.stringify(remoteHistory[0].scores || {}))
    }

    hydrateAssessments()

    return () => {
      active = false
    }
  }, [isAuthenticated])

  function handleAnswer(scaleId, qi, val) {
    setAnswers(prev => {
      const next = {
        ...prev,
        [scaleId]: { ...(prev[scaleId] || {}), [qi]: val },
      }

      localStorage.setItem(ANSWERS_KEY, JSON.stringify(next))
      localStorage.setItem(ANSWERS_DATE_KEY, todayKey())
      return next
    })
    setShowResults(false)
  }

  const allComplete = SCALES.every(s => {
    const ans = answers[s.id] || {}
    return s.questions.every((_, i) => ans[i] !== undefined)
  })

  const scores = allComplete ? {
    pss:    computeScore(SCALES[0], answers.pss    || {}),
    phq:    computeScore(SCALES[1], answers.phq    || {}),
    gad:    computeScore(SCALES[2], answers.gad    || {}),
    cdrisc: computeScore(SCALES[3], answers.cdrisc || {}),
  } : null

  const adviceKey = scores ? getAdviceKey(scores, answers.phq || {}) : null
  const advice    = adviceKey ? ADVICE[adviceKey] : null

  return (
    <div className="villa-page" style={{ '--villa-color': '#8b5cf6', '--villa-color-light': '#c4b5fd' }}>
      <div className="villa-bg">
        <div className="villa-bg-orb orb1" />
        <div className="villa-bg-orb orb2" />
        <div className="villa-bg-orb orb3" />
      </div>

      <button className="back-btn" onClick={() => navigate('/mood-diary')}>
        ← Back to Mood Diary
      </button>

      <div className="villa-hero">
        <div className="villa-emoji">📋</div>
        <div className="villa-tag">Emotion Scales</div>
        <h1 className="villa-title">My Emotion Scores</h1>
        <p className="villa-subtitle">
          Complete four standardised assessments to understand your emotional wellbeing.
          Maia will offer personalised guidance based on your results.
        </p>
      </div>

      <div className="es-container">
        {SCALES.map(scale => (
          <ScaleSection
            key={scale.id}
            scale={scale}
            allAnswers={answers}
            onChange={handleAnswer}
          />
        ))}

        {allComplete && !showResults && (
          <button className="es-results-btn" onClick={() => {
            // Persist each scale's score so MoodDiaryCentre can display them
            const toSave = {}
            const savedAt = new Date().toISOString()
            SCALES.forEach(s => {
              toSave[s.id] = { score: computeScore(s, answers[s.id] || {}), date: savedAt }
            })
            const historyEntry = {
              id: Date.now(),
              date: savedAt,
              adviceKey,
              scores: toSave,
            }
            const history = [historyEntry, ...readLS(SCORE_HISTORY_KEY, [])].slice(0, 12)

            localStorage.setItem(SCORES_KEY, JSON.stringify(toSave))
            localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(history))
            syncEntry({
              category: 'assessment',
              source: 'emotion-scales',
              entryKey: historyEntry.date,
              payload: historyEntry,
            })
            setShowResults(true)
          }}>
            View My Results &amp; Maia's Advice ✨
          </button>
        )}

        {showResults && scores && advice && (
          <div className="es-results">
            <h2 className="es-results-title">Your Results</h2>

            <div className="es-scores-grid">
              {SCALES.map(scale => {
                const s   = scores[scale.id]
                const sev = scale.getSeverity(s)
                return (
                  <div key={scale.id} className="es-score-card" style={{ borderColor: sev.color + '44' }}>
                    <span className="es-score-icon">{scale.icon}</span>
                    <span className="es-score-shortname">{scale.shortName}</span>
                    <span className="es-score-value" style={{ color: sev.color }}>
                      {s}
                      <span className="es-score-max">/{scale.maxScore}</span>
                    </span>
                    <span className="es-score-label" style={{ background: sev.color + '22', color: sev.color }}>
                      {sev.label}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="es-advice-panel" style={{ background: advice.bg, borderColor: advice.border }}>
              <div className="es-advice-header">
                <span className="es-advice-emoji">{advice.emoji}</span>
                <div>
                  <p className="es-advice-from">Maia says</p>
                  <h3 className="es-advice-title" style={{ color: advice.color }}>{advice.title}</h3>
                </div>
              </div>
              <p className="es-advice-body">{advice.body}</p>
              <ul className="es-advice-steps">
                {advice.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ul>
              {advice.actions.length > 0 && (
                <div className="es-advice-actions">
                  {advice.actions.map(a => (
                    <button
                      key={a.path}
                      className="es-action-btn"
                      style={{ background: a.color }}
                      onClick={() => navigate(a.path)}
                    >
                      {a.label} →
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="es-retake-btn" onClick={() => {
              setAnswers({})
              setShowResults(false)
              localStorage.removeItem(ANSWERS_KEY)
              localStorage.removeItem(ANSWERS_DATE_KEY)
            }}>
              Retake Assessments
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
