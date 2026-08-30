import { fetchEntries } from './villaSync'

const MOOD_QUALITY = { 5: 'Great', 4: 'Good', 3: 'Okay', 2: 'Low', 1: 'Struggling' }

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
}

const SEVERITY_LABEL = {
  emergency: 'in significant distress (high-support recommendation)',
  professional: 'likely to benefit from professional support',
  selfcare: 'coping reasonably well (self-care tier)',
}

export async function buildSageContext() {
  const [moodRows, journalRows, assessmentRows, sleepRows] = await Promise.all([
    fetchEntries({ category: 'mood', source: 'mood-diary', limit: 7 }),
    fetchEntries({ category: 'journal', source: 'mood-diary', limit: 3 }),
    fetchEntries({ category: 'assessment', source: 'emotion-scales', limit: 1 }),
    fetchEntries({ category: 'wellness', source: 'sleep-tracker', limit: 3 }),
  ])

  const moods = moodRows
    .map(r => r.payload)
    .filter(e => e?.ts)
    .sort((a, b) => b.ts - a.ts)

  const journal = journalRows
    .map(r => r.payload)
    .filter(e => e?.ts)
    .sort((a, b) => b.ts - a.ts)[0]

  const assessment = assessmentRows
    .map(r => r.payload)
    .find(e => e?.scores && e?.adviceKey)

  const sleep = sleepRows
    .map(r => r.payload)
    .filter(e => e?.hours != null)

  const isCrisisTier = assessment?.adviceKey === 'emergency'

  if (moods.length === 0 && !journal && !assessment && sleep.length === 0) {
    return { contextText: '', isCrisisTier: false }
  }

  const lines = []

  if (moods.length > 0) {
    const recent = moods.slice(0, 7).map(m => `${fmtDate(m.ts)}: ${MOOD_QUALITY[m.value] || m.label}${m.note ? ` ("${m.note}")` : ''}`)
    const avg = (moods.reduce((s, m) => s + m.value, 0) / moods.length).toFixed(1)
    lines.push(`Recent mood check-ins (newest first): ${recent.join('; ')}. Average recently: ${avg}/5.`)
  }

  if (journal) {
    const snippet = journal.text.length > 240 ? `${journal.text.slice(0, 240)}...` : journal.text
    lines.push(`Most recent journal reflection (${fmtDate(journal.ts)}), prompt "${journal.prompt}": "${snippet}"`)
  }

  if (assessment) {
    const scoreBits = Object.entries(assessment.scores || {})
      .map(([id, s]) => `${id.toUpperCase()} ${s.score}`)
      .join(', ')
    lines.push(`Latest emotion assessment (${new Date(assessment.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}): ${scoreBits}. Overall this places them as ${SEVERITY_LABEL[assessment.adviceKey] || 'unclear'}.`)
  }

  if (sleep.length > 0) {
    const latest = sleep[0]
    lines.push(`Last logged sleep: ${latest.hours}h, quality rated ${latest.quality === 3 ? 'great' : latest.quality === 2 ? 'okay' : 'poor'}.`)
  }

  const contextText = `Private context about this user, for your reference only. Weave it in naturally and gently if relevant — never recite it back as a list or report, and never assume it's the whole picture of how they feel right now:\n${lines.join('\n')}`

  return { contextText, isCrisisTier }
}
