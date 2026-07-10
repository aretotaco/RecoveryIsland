import { useState } from 'react'

const AFFIRMATIONS = [
  { category: 'Morning', text: 'Today is a new beginning. I welcome it with an open heart.' },
  { category: 'Morning', text: 'I give myself permission to move slowly and still move forward.' },
  { category: 'Morning', text: 'I do not need to have it all figured out to take one small step today.' },
  { category: 'Morning', text: 'I choose to be present in this moment, just as it is.' },
  { category: 'Self-Worth', text: 'I am worthy of love — not because of what I achieve, but because I exist.' },
  { category: 'Self-Worth', text: 'I am enough, exactly as I am right now.' },
  { category: 'Self-Worth', text: 'My worth is not determined by my productivity or my struggles.' },
  { category: 'Self-Worth', text: 'I deserve the same compassion I would give a friend.' },
  { category: 'Healing', text: 'Healing is not linear, and neither am I. That is okay.' },
  { category: 'Healing', text: 'I honour the progress I cannot yet see.' },
  { category: 'Healing', text: 'I am allowed to take up space in my own life.' },
  { category: 'Healing', text: 'I release the pressure to be fully healed right now.' },
  { category: 'Strength', text: 'I have survived every difficult day before this one.' },
  { category: 'Strength', text: 'I carry more resilience than I give myself credit for.' },
  { category: 'Strength', text: 'This feeling is temporary. I am not.' },
  { category: 'Strength', text: 'I am becoming someone I am proud of — one day at a time.' },
]

const GOAL_PHASES = [
  {
    number: '01',
    heading: 'Set Your Intention',
    items: [
      'Choose one goal at a time — not five. One focused step beats scattered effort.',
      'Make it specific: "Go for a 10-minute walk on Tuesday" beats "exercise more".',
      'Ask yourself: is this goal from fear, or from hope? Aim for hope.',
      'Write it down. Naming your intention out loud makes it real.',
    ]
  },
  {
    number: '02',
    heading: 'Build the Habit',
    items: [
      'Pair your goal with something you already do — stack new habits onto existing ones.',
      'Start smaller than feels necessary. Tiny and consistent outlasts big and irregular.',
      "Track progress lightly — celebrate streaks, but don't let missing one end everything.",
      'Tell one person you trust. Accountability is a gift, not a burden.',
    ]
  },
  {
    number: '03',
    heading: 'When You Fall Off Track',
    items: [
      'Missing a day is normal. Missing a week is normal. What matters is coming back.',
      'Ask: what made this hard? Change the plan, not your opinion of yourself.',
      '"If I miss a day, then I will restart the next morning — without guilt."',
      'Progress is rarely a straight line. Trust the direction, not the pace.',
    ]
  }
]

const GRATITUDE_PROMPTS = [
  'Name three things that brought you even a moment of peace today.',
  'Who is someone — past or present — who believed in you? What would you want to say to them?',
  'What is one thing your body did today that you can appreciate, however small?',
  'What is a challenge you\'ve faced that has quietly shaped who you are?',
  'What simple pleasure did you experience today — a taste, a sound, a texture, a colour?',
  'What is one thing about yourself you are grateful for, right now in this moment?',
  'Notice something beautiful in your environment right now. Sit with it for 30 seconds.',
]

export function AffirmationDeck() {
  const [index, setIndex] = useState(0)
  const current = AFFIRMATIONS[index]

  const prev = () => setIndex(i => (i - 1 + AFFIRMATIONS.length) % AFFIRMATIONS.length)
  const next = () => setIndex(i => (i + 1) % AFFIRMATIONS.length)
  const shuffle = () => {
    let n
    do { n = Math.floor(Math.random() * AFFIRMATIONS.length) } while (n === index)
    setIndex(n)
  }

  return (
    <div className="affirmation-deck">
      <span className="affirmation-category">{current.category}</span>
      <p className="affirmation-text" key={index}>"{current.text}"</p>
      <div className="affirmation-nav">
        <button className="affirmation-arrow" onClick={prev} aria-label="Previous">←</button>
        <button className="affirmation-shuffle" onClick={shuffle}>✦ Shuffle</button>
        <button className="affirmation-arrow" onClick={next} aria-label="Next">→</button>
      </div>
      <p className="affirmation-count">{index + 1} / {AFFIRMATIONS.length}</p>
    </div>
  )
}

export function GoalStepper() {
  const [open, setOpen] = useState(0)

  return (
    <div className="goal-stepper">
      {GOAL_PHASES.map((phase, i) => (
        <div key={i} className={`goal-phase ${open === i ? 'goal-phase--open' : ''}`}>
          <button className="goal-phase-header" onClick={() => setOpen(open === i ? -1 : i)}>
            <span className="goal-phase-number">{phase.number}</span>
            <span className="goal-phase-title">{phase.heading}</span>
            <span className="goal-phase-chevron">{open === i ? '▲' : '▼'}</span>
          </button>
          {open === i && (
            <ul className="goal-phase-items">
              {phase.items.map((item, ii) => <li key={ii}>{item}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

const STORIES = [
  {
    name: 'Aisha, 19',
    tag: 'First-Year Anxiety',
    color: '#8b5cf6',
    quote: 'I spent my first semester pretending I was fine. The day I walked into the counselling centre and said "I need help" was the hardest and best thing I ever did.',
    story: "Aisha arrived on campus excited, then quickly felt overwhelmed by lectures, deadlines, and trying to make friends at the same time. She started skipping meals and sleeping badly, telling herself it was just an adjustment period. It wasn't. After finally reaching out to student support, she got a diagnosis of generalised anxiety and a plan that actually fit university life. She now uses a study group, calendar reminders, and regular check-ins to stay grounded.",
  },
  {
    name: 'Daniel, 21',
    tag: 'Academic Burnout',
    color: '#6366f1',
    quote: "I didn't recognise burnout in myself — I just thought I was failing at being a student. Someone else saw it before I did.",
    story: "Daniel pushed hard through midterms, societies, and a part-time job, then hit a wall he could not power through. He stopped enjoying anything, kept rereading the same page, and felt guilty every time he rested. A tutor noticed he seemed flat and suggested he speak to the campus wellbeing team. That conversation helped him reset his workload, protect his sleep, and stop treating exhaustion like a personality flaw.",
  },
  {
    name: 'Priya, 20',
    tag: 'Homesickness',
    color: '#f59e0b',
    quote: "I thought homesickness meant I was not independent enough. It turned out I just needed time and support.",
    story: "Priya loved the idea of university until the reality of living far from home hit during her first term. She felt guilty calling her family, avoided common spaces, and kept comparing herself to people who seemed to settle in instantly. A residence advisor encouraged her to join a small study circle and visit the international student office. With routine, connection, and a few familiar rituals from home, the constant ache eased.",
  },
  {
    name: 'Marcus, 22',
    tag: 'Exam Pressure',
    color: '#10b981',
    quote: "I thought everyone else was coping better than me. Once I talked about it, I realised half the class felt the same.",
    story: "Marcus hit panic mode every exam season and turned into someone he barely recognised — checking notes nonstop, sleeping badly, and constantly assuming he had forgotten everything. A classmate suggested they revise together in short blocks instead of all night. That small change, plus a conversation with a lecturer about extensions, made the pressure feel survivable. He still gets nervous, but he no longer tries to do it alone.",
  },
  {
    name: 'Selin, 23',
    tag: 'Postgrad Overwhelm',
    color: '#ec4899',
    quote: "Everyone expected me to have it together because I was older. I still needed help figuring out how to cope.",
    story: "Selin returned to university for postgraduate study while balancing work, commuting, and a dissertation that felt endless. She looked fine on the outside but was constantly depleted and increasingly detached from her course. A supervisor encouraged her to break the project into smaller weekly goals and use the university's wellbeing service. She learned that needing support did not make her less capable; it made the work sustainable.",
  },
]

export function StoriesOfHope() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {STORIES.map((s, i) => {
        const open = expanded === i
        return (
          <div key={i} style={{
            border: `1px solid ${open ? s.color + '60' : 'rgba(255,215,150,0.12)'}`,
            background: open ? `${s.color}10` : 'rgba(255,245,220,0.04)',
            borderRadius: 14, overflow: 'hidden', transition: 'all 0.25s',
          }}>
            <button onClick={() => setExpanded(open ? null : i)} style={{
              width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'white',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${s.color}30`, border: `2px solid ${s.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {s.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'rgba(255,240,200,0.9)' }}>{s.name}</span>
                  <span style={{ fontSize: '0.7rem', background: `${s.color}25`, color: s.color, borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>{s.tag}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,240,200,0.55)', fontStyle: 'italic', lineHeight: 1.5 }}>"{s.quote}"</p>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,240,200,0.3)', flexShrink: 0, marginTop: 2 }}>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <div style={{ padding: '0 16px 16px 68px', fontSize: '0.85rem', color: 'rgba(255,240,200,0.7)', lineHeight: 1.8 }}>
                {s.story}
              </div>
            )}
          </div>
        )
      })}
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,240,200,0.3)', textAlign: 'center', marginTop: 4 }}>
        Stories are fictional composites created to represent common lived experiences.
      </p>
    </div>
  )
}

export function GratitudePromptPicker() {
  const [index, setIndex] = useState(0)
  const next = () => setIndex(i => (i + 1) % GRATITUDE_PROMPTS.length)

  return (
    <div className="gratitude-prompt">
      <p className="gratitude-label">Today's Prompt</p>
      <p className="gratitude-text" key={index}>{GRATITUDE_PROMPTS[index]}</p>
      <div className="gratitude-footer">
        <span className="gratitude-count">{index + 1} of {GRATITUDE_PROMPTS.length}</span>
        <button className="gratitude-next" onClick={next}>Next Prompt →</button>
      </div>
    </div>
  )
}
