import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    emoji: '🔑',
    tag: 'Getting Started',
    title: 'Signing In',
    path: '/login',
    purpose: "You sign in with a Study ID and password given to you by the study team — not an email address, and there's no self-registration.",
    howTo: [
      'Enter your Study ID in the first field (it doesn\'t matter if you type it in lowercase — it\'s automatically capitalised).',
      'Enter the password you were given.',
      'Tap "Sign in". If your details aren\'t recognised, you\'ll see a message telling you so — double check with the study team if it keeps happening.',
    ],
    extra: 'Your Study ID and password can\'t be changed from inside the app — contact the study team if you need help signing in.',
  },
  {
    emoji: '🏛️',
    tag: 'Villa 1 · Start here',
    title: 'Concierge Villa',
    path: '/concierge',
    purpose: 'Your orientation hub and home base — set up your companion Maia, and get a guided checklist to the rest of the island.',
    howTo: [
      'On your very first visit, you\'ll meet Maia and can customise how she looks (hair, outfit, colours) before entering the island.',
      'The "Your island journey" card lists all six villas — tap any of them to jump straight there. Visited villas get a ✅ tick, and a progress bar tracks how many you\'ve explored.',
      'Come back any time via the "Customise Maia" button to change her look again.',
    ],
    extra: 'Recommended order: Mood Diary Centre first, then explore the rest at your own pace and come back to compare how you feel.',
  },
  {
    emoji: '📓',
    tag: 'Villa 2 · Start here',
    title: 'Mood Diary Centre',
    path: '/mood-diary',
    purpose: 'The heart of the island — log how you feel each day, journal, take assessments, and see your trends over time.',
    howTo: [
      '"How are you feeling today?" — pick one of five moods (😄 Great, 😊 Good, 😐 Okay, 😔 Low, 😢 Struggling), optionally add a note, then tap "Save Today\'s Mood". Already logged today? You\'ll see "Update entry" instead.',
      '"Mood Insights" shows your last 7 days as an emoji strip, plus your average mood and whether you\'re trending up, down, or steady.',
      '"Monthly Mood Snapshot" is a bar chart of the last 30 days, plus your current logging streak.',
      '"Guided Reflection Studio" gives you a rotating journalling prompt (tap "Try another prompt" for a different one). Write at least 10 characters and tap "Save Reflection" — a live word counter helps you see your progress.',
      '"My Emotion Assessments" lists four standardised scales — tap "Take Assessment →" to fill one in (see the Emotion Assessments section below).',
      '"Growth Milestones" gently celebrates progress — your first check-in, a 7-day streak, your first reflections, and more.',
    ],
    extra: 'This page is also where you\'ll find a link to your full "Insights Dashboard" once you have some data logged.',
  },
  {
    emoji: '🧘',
    tag: 'Villa 3',
    title: 'Mindfulness Villa',
    path: '/mindfulness',
    purpose: 'Guided breathing and meditation practices to help calm your nervous system and ground yourself in the present moment.',
    howTo: [
      '"Mindful Breathing" includes an interactive Box Breathing pacer — tap "Start" and follow the expanding/contracting circle through Inhale → Hold → Exhale → Hold (4 seconds each). Use "Pause" or "Reset" any time, and it counts completed cycles for you.',
      '"Loving Kindness Meditation" and "Body Scan Practice" are guided video meditations for self-compassion and releasing tension.',
      '"S.T.O.P Technique" is a quick tool for overwhelming moments: Stop, Take a breath, Observe, Proceed.',
      '"Let Go Meditation" is a guided video for releasing thoughts and tension.',
    ],
    extra: 'If a video won\'t play in the app, each one has a link to open it directly on YouTube instead.',
  },
  {
    emoji: '🌿',
    tag: 'Villa 4',
    title: 'Relaxation Villa',
    path: '/relaxation',
    purpose: 'Deep rest, guided visualisations, and stress-release techniques for when you need to fully let go.',
    howTo: [
      '"Abdominal Breathing and Muscle Relaxation" includes an interactive 4-7-8 Breathing pacer (Inhale 4s → Hold 7s → Exhale 8s) — a technique popularised by Dr. Andrew Weil for quick, deep relaxation. Start, pause, or reset it just like the Box Breathing pacer.',
      'Several guided visualisation videos ("Air Balloon", "A Trip to China", "A Land of Happiness", "A Land of Flowers", "A Journey to Relaxation") help you mentally step away from stress.',
      '"Sleep Preparation", "Stress Release", and "Self-Compassion" are written guides you can read at your own pace — no video needed.',
    ],
  },
  {
    emoji: '💆',
    tag: 'Villa 5',
    title: 'Wellness Villa',
    path: '/wellness',
    purpose: 'Track daily habits — movement, food, hydration, routines, and sleep — and pick up bite-sized wellness knowledge along the way.',
    howTo: [
      '"Movement" — tap a preset activity (Walk, Stretching, Yoga, Run, Swim, Dance, Strength Training, Cycling) to log it instantly, or add your own custom activity with minutes and intensity.',
      '"Nourishment" is a mood-food awareness log, not a calorie counter — pick how you\'re feeling (Anxious, Low, Fatigued, Stressed, Unfocused) to see food suggestions, then log what you actually ate and how it felt afterward.',
      '"Hydration" — tap glass icons to log cups of water toward a daily target of 8.',
      '"Routine" — check off a personalised list of morning or evening habits (e.g. a 5-minute stretch, writing 3 intentions, winding down before bed).',
      '"Sleep" — drag a slider to log hours slept and rate the quality, then save.',
      '"Wellness Knowledge Hub" below the trackers has flip-card facts ("Did You Know") and a 6-question "Quick Quiz" you can retake any time — your best score is remembered.',
      '"Your Week at a Glance" summarises everything you\'ve logged this week in one place.',
    ],
  },
  {
    emoji: '✨',
    tag: 'Villa 6',
    title: 'Inspiration Villa',
    path: '/inspiration',
    purpose: 'Affirmations, real stories, goal-setting, and gratitude journalling to help you reconnect with your own strength.',
    howTo: [
      '"Daily Affirmations" — browse a deck of affirmations by category (Morning, Self-Worth, Healing, Strength), use the arrows or "✦ Shuffle" to browse, and tap the heart to save favourites.',
      'Short video stories cover real experiences with academic stress, cultural belonging, and internship anxiety.',
      '"Goal Setting" — write and save one personal intention, then work through a 3-step accordion: Set Your Intention → Build the Habit → When You Fall Off Track, checking off action items as you go.',
      '"Gratitude Practice" — read a rotating prompt, write a reflection, and save it. Your last 5 reflections are shown below so you can look back on them.',
    ],
  },
  {
    emoji: '🌊',
    tag: 'Tools',
    title: 'Emotion Assessments',
    path: '/emotion-scales',
    purpose: 'Four standardised, validated questionnaires that screen for stress, low mood, anxiety, and resilience — with Maia offering personalised guidance based on your results.',
    howTo: [
      'Reached from the "Take Assessment" buttons in the Mood Diary Centre. Tap a scale to expand it, then tap a number for each question.',
      'The four scales are: PSS-10 (Perceived Stress), PHQ-9 (mood), GAD-7 (anxiety), and CD-RISC-10 (resilience, shown as "Resilience Scale").',
      'Once all four are fully answered, tap "View My Results & Maia\'s Advice ✨" to see your scores, severity levels, and a personalised recommendation with concrete next steps.',
      'You can retake the assessments any time with the "Retake Assessments" button — it\'s worth doing every few weeks to track change over time.',
    ],
    extra: 'If any answer suggests you may be at risk, Maia\'s advice will prioritise pointing you to Crisis Support and encourage reaching out for professional help right away.',
  },
  {
    emoji: '📊',
    tag: 'Tools',
    title: 'Insights Dashboard',
    path: '/insights',
    purpose: 'A read-only dashboard that quietly cross-references everything you\'ve already logged to surface patterns — no extra data entry required.',
    howTo: [
      '"Mood by Sleep" shows your average mood on days you slept under 6h, 6–8h, or over 8h.',
      '"Mood by Movement" compares your average mood on days you logged exercise in the Wellness Villa versus days you didn\'t.',
      '"Assessment Trend" lists your past Emotion Assessment results in order, so you can see how your scores are changing.',
    ],
    extra: 'If you haven\'t logged much yet, you\'ll see a prompt pointing you back to the Mood Diary Centre to get started.',
  },
  {
    emoji: '🆘',
    tag: 'Always available',
    title: 'Crisis Support',
    path: '/crisis-support',
    purpose: 'Immediate emergency contacts and Singapore mental health hotlines — available even if you\'re not signed in.',
    howTo: [
      'Tap the floating "🆘 Need help now?" button in the bottom-right corner from anywhere in the app, or navigate here directly.',
      'If you\'re in immediate danger, use the tap-to-call buttons for Police (999) or Ambulance/SCDF (995), or head to your nearest hospital emergency room.',
      'Below that, you\'ll find Singapore support hotlines including NUS University Counselling Services, NUS Lifeline (24-hour), NUS Student Wellness, Peer Student Supporters, CHAT, and Samaritans of Singapore (SOS) — with call, WhatsApp, email, or website links for each.',
    ],
    extra: 'This page — and the floating SOS button — are there for you at any time, on any page, whether you\'re signed in or not.',
  },
  {
    emoji: '⚙️',
    tag: 'Account',
    title: 'Settings',
    path: '/settings',
    purpose: 'Manage your profile — customise Maia, check your Study ID, and sign out.',
    howTo: [
      '"Customise Maia" — rebuild your companion\'s look any time and tap "Save Maia".',
      '"Study ID" shows which ID you\'re signed in as. It can\'t be changed here — contact the study team if you need help.',
      '"Sign out" logs you out. Don\'t worry — your data stays saved and will be there when you come back.',
    ],
    extra: 'Recovery Island doesn\'t collect your name or any other identifying details — Maia\'s appearance is the only thing you personalise.',
  },
  {
    emoji: '🌸',
    tag: 'Always there for you',
    title: 'Maia, Check-ins & Reminders',
    path: null,
    purpose: 'A few gentle helpers work quietly in the background across the whole island.',
    howTo: [
      'Maia (your companion) pops up on each villa with a short, encouraging, villa-specific message the first time you visit. Tap the × to dismiss her, or tap her avatar/name any time to bring the bubble back.',
      'If you haven\'t logged a mood entry yet today, a small banner may appear inviting you to check in — you can dismiss it for the day, or turn on browser notifications for a daily nudge.',
      'The 🆘 SOS button (see Crisis Support above) follows you on every page except the crisis page itself.',
    ],
  },
  {
    emoji: '🤖',
    tag: 'Coming soon',
    title: 'AI Companion ("Sage")',
    path: null,
    purpose: 'A conversational AI companion for emotional support, grounding techniques, and talking things through — not a replacement for therapy.',
    howTo: [
      'This feature is still being built and isn\'t available to open yet, even though you may see it mentioned elsewhere on the island (like in the Concierge Villa checklist or Emotion Assessment advice).',
      'Once it launches, you\'ll be able to chat with Sage any time, with clear signposting to Crisis Support if you ever need more than a conversation can offer.',
    ],
  },
]

export default function UserGuidePage() {
  const navigate = useNavigate()
  const [openKey, setOpenKey] = useState(null)
  const vs = { '--villa-color': '#38bdf8', '--villa-color-light': '#7dd3fc' }

  return (
    <div className="villa-page" style={vs}>
      <div className="villa-bg">
        <div className="villa-bg-orb orb1" />
        <div className="villa-bg-orb orb2" />
        <div className="villa-bg-orb orb3" />
      </div>
      <button className="back-btn" onClick={() => navigate('/')}>Back to Island</button>

      <div className="villa-hero">
        <div className="villa-emoji">📖</div>
        <div className="villa-tag">User Guide</div>
        <h1 className="villa-title">Recovery Island Guide</h1>
        <p className="villa-subtitle">
          Everything on the island, what it's for, and how to use it — come back to this page any time you need a refresher.
        </p>
      </div>

      <div className="villa-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {FEATURES.map((f) => {
          const isOpen = openKey === f.title
          return (
            <div
              key={f.title}
              className="villa-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setOpenKey(isOpen ? null : f.title)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div className="card-icon">{f.emoji}</div>
                  <div className="villa-tag" style={{ marginBottom: 8 }}>{f.tag}</div>
                  <h3 className="card-title">{f.title}</h3>
                  <p className="card-text" style={{ marginBottom: isOpen ? 20 : 0 }}>{f.purpose}</p>
                </div>
                <span style={{ fontSize: 22, color: 'var(--ri-text-warm-secondary)', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                  ⌄
                </span>
              </div>

              {isOpen && (
                <div onClick={(e) => e.stopPropagation()}>
                  <h4 style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--villa-color)', marginBottom: 10 }}>
                    How to use it
                  </h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: f.extra ? 16 : 20 }}>
                    {f.howTo.map((step, i) => (
                      <li key={i} className="card-text" style={{ margin: 0, display: 'flex', gap: 10 }}>
                        <span style={{ color: 'var(--villa-color)', flexShrink: 0 }}>•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>

                  {f.extra && (
                    <p className="card-text" style={{
                      background: 'var(--ri-card-bg)',
                      border: '1px solid var(--ri-card-border)',
                      borderRadius: 14,
                      padding: '14px 16px',
                      fontStyle: 'italic',
                      marginBottom: 20,
                    }}>
                      💡 {f.extra}
                    </p>
                  )}

                  {f.path && (
                    <button className="card-btn" onClick={() => navigate(f.path)}>
                      Go to {f.title} →
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="villa-fixed-nav" aria-label="Guide navigation">
        <button className="villa-nav-btn villa-nav-btn--primary" onClick={() => navigate('/')}>
          🏝️ Back to Recovery Island
        </button>
      </div>
    </div>
  )
}
