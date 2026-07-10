import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { MaiaAvatarSvg } from './MaiaAvatar'
import { loadUserProfile } from '../lib/userProfile'

const villas = [
  {
    id: 1,
    name: 'Concierge Villa',
    path: '/concierge',
    x: 68,
    y: 72,
    emoji: '🏛️',
    color: '#f59e0b',
    description: 'Your journey begins here',
    labelSide: 'right'
  },
  {
    id: 2,
    name: 'Mood Diary Centre',
    path: '/mood-diary',
    x: 32,
    y: 72,
    emoji: '📓',
    color: '#8b5cf6',
    description: 'Track your emotional journey',
    labelSide: 'left'
  },
  {
    id: 3,
    name: 'Mindfulness Villa',
    path: '/mindfulness',
    x: 18,
    y: 55,
    emoji: '🧘',
    color: '#10b981',
    description: 'Find your inner peace',
    labelSide: 'left'
  },
  {
    id: 4,
    name: 'Relaxation Villa',
    path: '/relaxation',
    x: 72,
    y: 55,
    emoji: '🌿',
    color: '#06b6d4',
    description: 'Unwind and restore',
    labelSide: 'right'
  },
  {
    id: 5,
    name: 'Wellness Villa',
    path: '/wellness',
    x: 78,
    y: 38,
    emoji: '💆',
    color: '#f43f5e',
    description: 'Nurture your whole self',
    labelSide: 'right'
  },
  {
    id: 6,
    name: 'Inspiration Villa',
    path: '/inspiration',
    x: 22,
    y: 38,
    emoji: '✨',
    color: '#f97316',
    description: 'Ignite your inner spark',
    labelSide: 'left'
  },
  {
    id: 7,
    name: 'AI Companion',
    path: '/ai-chatbot',
    x: 50,
    y: 18,
    emoji: '🤖',
    color: '#6366f1',
    description: 'Your wellness companion',
    labelSide: 'below'
  },
]

function VillaBuilding({ x, y, color, isHovered }) {
  const s = isHovered ? 1.1 : 1
  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} style={{ transition: 'all 0.25s ease' }}>
      <ellipse cx="0" cy="5.5" rx="6.5" ry="1.5" fill="rgba(0,0,0,0.2)" />
      <rect x="-5" y="-3.5" width="10" height="8" rx="0.5" fill="#f5f0e8" />
      <rect x="3.5" y="-3.5" width="1.5" height="8" fill="rgba(0,0,0,0.07)" />
      <rect x="-6" y="-5" width="12" height="1.8" rx="0.3" fill={color} opacity="0.9" />
      <polygon points="-6.5,-5 0,-10.5 0,-5" fill={color} opacity="0.95" />
      <polygon points="6.5,-5 0,-10.5 0,-5" fill={color} opacity="0.75" />
      <line x1="0" y1="-10.5" x2="0" y2="-5" stroke="rgba(0,0,0,0.12)" strokeWidth="0.25" />
      <line x1="-3" y1="-5" x2="-1.5" y2="-7.5" stroke="rgba(0,0,0,0.08)" strokeWidth="0.25" />
      <line x1="-5.5" y1="-5" x2="-3" y2="-9" stroke="rgba(0,0,0,0.08)" strokeWidth="0.25" />
      <line x1="3" y1="-5" x2="1.5" y2="-7.5" stroke="rgba(0,0,0,0.08)" strokeWidth="0.25" />
      <line x1="5.5" y1="-5" x2="3" y2="-9" stroke="rgba(0,0,0,0.08)" strokeWidth="0.25" />
      <rect x="2.5" y="-10" width="1.8" height="3" rx="0.3" fill="#c8a070" />
      <rect x="2.2" y="-10.4" width="2.4" height="0.7" rx="0.2" fill="#b8906a" />
      <circle cx="3.4" cy="-11" r="0.5" fill="rgba(255,255,255,0.35)" />
      <circle cx="3.7" cy="-12" r="0.4" fill="rgba(255,255,255,0.25)" />
      <circle cx="3.3" cy="-13" r="0.3" fill="rgba(255,255,255,0.15)" />
      <rect x="-4" y="-2.5" width="2.5" height="2.2" rx="0.3" fill="#a8d8ea" opacity="0.9" />
      <line x1="-2.75" y1="-2.5" x2="-2.75" y2="-0.3" stroke="rgba(255,255,255,0.5)" strokeWidth="0.25" />
      <rect x="-3.9" y="-2.4" width="0.8" height="0.5" rx="0.1" fill="rgba(255,255,255,0.7)" />
      <rect x="1.5" y="-2.5" width="2.5" height="2.2" rx="0.3" fill="#a8d8ea" opacity="0.9" />
      <line x1="2.75" y1="-2.5" x2="2.75" y2="-0.3" stroke="rgba(255,255,255,0.5)" strokeWidth="0.25" />
      <rect x="1.6" y="-2.4" width="0.8" height="0.5" rx="0.1" fill="rgba(255,255,255,0.7)" />
      <rect x="-1.2" y="0.5" width="2.4" height="4" rx="0.3" fill="#7a5c3a" />
      <rect x="-1" y="0.7" width="0.8" height="1.4" rx="0.15" fill="rgba(255,255,255,0.1)" />
      <rect x="0.2" y="0.7" width="0.8" height="1.4" rx="0.15" fill="rgba(255,255,255,0.1)" />
      <rect x="-1" y="2.3" width="0.8" height="1.2" rx="0.15" fill="rgba(255,255,255,0.1)" />
      <rect x="0.2" y="2.3" width="0.8" height="1.2" rx="0.15" fill="rgba(255,255,255,0.1)" />
      <circle cx="0.9" cy="2.2" r="0.25" fill="#d4a843" />
      <rect x="-1.8" y="4.2" width="3.6" height="0.7" rx="0.15" fill="#ddd5c0" />
      <rect x="-1.4" y="4.9" width="2.8" height="0.6" rx="0.15" fill="#ccc4ae" />
      <circle cx="-3" cy="3.5" r="1.2" fill="#3a8c55" opacity="0.9" />
      <circle cx="-2.3" cy="2.8" r="0.8" fill="#4ea86a" opacity="0.8" />
      <circle cx="3" cy="3.5" r="1.2" fill="#3a8c55" opacity="0.9" />
      <circle cx="2.3" cy="2.8" r="0.8" fill="#4ea86a" opacity="0.8" />
      {isHovered && (
        <circle cx="0" cy="-2" r="10" fill="none" stroke={color} strokeWidth="0.5" opacity="0.35" />
      )}
    </g>
  )
}

function VillaLabel({ villa, isHovered }) {
  const pillW = 28
  const pillH = 5
  const gap = 3
  let rx, ry
  if (villa.labelSide === 'right') {
    rx = villa.x + 6 + gap
    ry = villa.y - pillH / 2
  } else if (villa.labelSide === 'left') {
    rx = villa.x - 6 - gap - pillW
    ry = villa.y - pillH / 2
  } else {
    rx = villa.x - pillW / 2
    ry = villa.y + 8
  }
  return (
    <g>
      <rect x={rx} y={ry} width={pillW} height={pillH} rx="2.5"
        fill={isHovered ? villa.color : 'rgba(0,0,0,0.55)'}
        style={{ transition: 'all 0.25s ease' }} />
      <text x={rx + pillW / 2} y={ry + 3.6} textAnchor="middle"
        fontSize="2.4" fontWeight="600" fill="white"
        fontFamily="Jost, sans-serif" letterSpacing="0.1"
        style={{ pointerEvents: 'none', userSelect: 'none' }}>
        {villa.name}
      </text>
    </g>
  )
}

function PalmTree({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <path d="M0,0 Q0.8,-3 0.3,-7 Q-0.3,-11 0,-14" stroke="#8B6914" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M0,-14 Q-6,-16 -9,-13" stroke="#2d6a4f" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M0,-14 Q-5,-18 -3,-22" stroke="#2d6a4f" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M0,-14 Q0,-19 3,-22" stroke="#3a7a5f" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M0,-14 Q5,-18 8,-15" stroke="#3a7a5f" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M0,-14 Q6,-16 8,-12" stroke="#2d6a4f" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <ellipse cx="-7" cy="-14.5" rx="2.5" ry="0.8" fill="#40916c" opacity="0.9" transform="rotate(-20,-7,-14.5)" />
      <ellipse cx="-2" cy="-20" rx="2.2" ry="0.7" fill="#52b788" opacity="0.85" transform="rotate(-75,-2,-20)" />
      <ellipse cx="2.5" cy="-20.5" rx="2.2" ry="0.7" fill="#40916c" opacity="0.85" transform="rotate(75,2.5,-20.5)" />
      <ellipse cx="7" cy="-14.5" rx="2.5" ry="0.8" fill="#52b788" opacity="0.9" transform="rotate(20,7,-14.5)" />
      <ellipse cx="7" cy="-12" rx="2" ry="0.7" fill="#40916c" opacity="0.8" transform="rotate(15,7,-12)" />
      <circle cx="-0.5" cy="-14.5" r="0.8" fill="#8B6914" opacity="0.8" />
      <circle cx="0.8" cy="-15" r="0.7" fill="#7a5c14" opacity="0.8" />
    </g>
  )
}

function Flower({ x, y, color = '#ff6b9d', scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <circle cx="0" cy="-1" r="0.8" fill={color} opacity="0.9" />
      <circle cx="1" cy="0" r="0.8" fill={color} opacity="0.9" />
      <circle cx="0" cy="1" r="0.8" fill={color} opacity="0.9" />
      <circle cx="-1" cy="0" r="0.8" fill={color} opacity="0.9" />
      <circle cx="0" cy="0" r="0.6" fill="#ffe066" />
      <rect x="-0.2" y="1" width="0.4" height="2" fill="#3a8c55" />
    </g>
  )
}

function Rocks({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="2.5" ry="1.5" fill="#9e9e8a" />
      <ellipse cx="2" cy="0.5" rx="1.8" ry="1.2" fill="#b5b5a0" />
      <ellipse cx="-1.5" cy="0.8" rx="1.5" ry="1" fill="#8a8a78" />
      <ellipse cx="0" cy="-0.3" rx="1.5" ry="0.6" fill="#c8c8b0" opacity="0.6" />
    </g>
  )
}

function LilyPad({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="2.5" ry="1.8" fill="#2d8c4e" opacity="0.85" />
      <line x1="0" y1="0" x2="0" y2="-1.8" stroke="#1a6b35" strokeWidth="0.3" opacity="0.6" />
      <line x1="0" y1="0" x2="2" y2="-0.8" stroke="#1a6b35" strokeWidth="0.3" opacity="0.6" />
      <line x1="0" y1="0" x2="-2" y2="-0.8" stroke="#1a6b35" strokeWidth="0.3" opacity="0.6" />
      <path d="M0,0 L0.8,-1.8 L-0.8,-1.8 Z" fill="#0077b6" opacity="0.3" />
      <circle cx="0.5" cy="-0.8" r="0.5" fill="#ff9ecd" opacity="0.9" />
      <circle cx="0.5" cy="-0.8" r="0.25" fill="#ffe066" />
    </g>
  )
}

function Sparkle({ x, y, delay = 0 }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="0.4" fill="white" opacity="0.6">
        <animate attributeName="opacity" values="0;0.8;0" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
        <animate attributeName="r" values="0.2;0.5;0.2" dur="3s" begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
    </g>
  )
}

function Bird({ x, y, delay = 0, pathD, duration = 20 }) {
  return (
    <g>
      <path d="M0,0 Q1.5,-1 3,0" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4">
        <animateMotion
          dur={`${duration}s`}
          begin={`${delay}s`}
          repeatCount="indefinite"
          path={pathD || `M${x},${y} Q${x + 20},${y - 10} ${x + 40},${y - 5} Q${x + 60},${y - 15} ${x + 100},${y - 8}`}
        />
      </path>
    </g>
  )
}

const JOURNEY = [
  {
    key: 'welcome',
    title: '🌿 Welcome to Recovery Island',
    body: "I'm Maia, your wellness guide. This island is your personal sanctuary — a calming, judgement-free space designed to support your mental health journey, entirely at your own pace.",
    features: [
      { emoji: '🏛️', label: 'Concierge Villa', desc: 'Your personal welcome & orientation hub' },
      { emoji: '📓', label: 'Mood Diary Centre', desc: 'Track & understand your emotions' },
      { emoji: '🧘', label: 'Mindfulness Villa', desc: 'Breathing & meditation practices' },
      { emoji: '🌿', label: 'Relaxation Villa', desc: 'Deep rest & stress relief' },
      { emoji: '💆', label: 'Wellness Villa', desc: 'Whole-person health habits' },
      { emoji: '✨', label: 'Inspiration Villa', desc: 'Affirmations & gratitude' },
      { emoji: '🤖', label: 'AI Companion', desc: 'Compassionate support, always here' },
    ],
    cta: 'Begin My Journey',
    navigateTo: null,
    next: 'concierge',
  },
  {
    key: 'concierge',
    title: '🏛️ First Stop: Concierge Villa',
    body: "The Concierge Villa is your personal welcome centre. Here you'll receive a warm orientation to the island, set your wellness intentions, and get the guidance you need. Think of it as gently checking in to your very own retreat — no rush, no pressure.",
    cta: 'Visit Concierge Villa →',
    navigateTo: '/concierge',
    next: 'mood-diary',
  },
  {
    key: 'mood-diary',
    title: '📓 Next: Mood Diary Centre',
    body: "You did wonderfully. Next is the Mood Diary Centre — one of the most powerful tools in recovery. Recording how you feel each day builds self-awareness and helps you begin to understand your emotional patterns. Even one sentence counts.",
    cta: 'Visit Mood Diary Centre →',
    navigateTo: '/mood-diary',
    next: 'mindfulness',
  },
  {
    key: 'mindfulness',
    title: '🧘 Next: Mindfulness Villa',
    body: "You're doing beautifully. The Mindfulness Villa is a peaceful space for guided breathing, loving-kindness meditation, body scan practices, and the S.T.O.P technique. Even 5 minutes here can gently shift how you feel. Your mind deserves this care.",
    cta: 'Visit Mindfulness Villa →',
    navigateTo: '/mindfulness',
    next: 'relaxation',
  },
  {
    key: 'relaxation',
    title: '🌿 Next: Relaxation Villa',
    body: "You're making such wonderful progress. The Relaxation Villa is your sanctuary for deep rest — guided relaxation rituals, sleep preparation, stress release, and self-compassion practices. Allow yourself to fully let go here. You've earned it.",
    cta: 'Visit Relaxation Villa →',
    navigateTo: '/relaxation',
    next: 'wellness',
  },
  {
    key: 'wellness',
    title: '💆 Next: Wellness Villa',
    body: "The Wellness Villa takes a whole-person approach — exploring how gentle movement, nourishment, and daily habits shape your mental health. Small, sustainable steps here can lead to remarkable shifts in how you think and feel. Be kind to yourself throughout.",
    cta: 'Visit Wellness Villa →',
    navigateTo: '/wellness',
    next: 'inspiration',
  },
  {
    key: 'inspiration',
    title: '✨ Next: Inspiration Villa',
    body: "Almost there. The Inspiration Villa is where you reconnect with your inner strength — daily affirmations, stories of hope, goal-setting tools, and gratitude practices. This space gently reminds you of how capable and worthy you truly are.",
    cta: 'Visit Inspiration Villa →',
    navigateTo: '/inspiration',
    next: 'ai-companion',
  },
  {
    key: 'ai-companion',
    title: '🤖 Finally: Your AI Companion',
    body: "You've visited every villa — that took real courage, and I'm truly proud of you. Your AI Companion, Sage, is always here to listen, support, and talk things through. No judgement, no pressure — just compassionate conversation whenever you need it.",
    cta: 'Meet Sage →',
    navigateTo: '/ai-chatbot',
    next: 'complete',
  },
  {
    key: 'complete',
    title: '🌟 You\'ve Explored the Whole Island',
    body: "Every villa is always open to you — come back to any space whenever you need support. Remember: healing isn't linear, and every small step you take matters deeply. I'm here whenever you need me. You are never alone on this island. 💚",
    cta: 'Explore Freely',
    navigateTo: null,
    next: 'complete',
  },
]

function WelcomeAvatar({ onNavigate, profile }) {
  const displayName = profile?.name || 'Traveller'
  const avatarCfg = profile?.avatar
  const [stepKey, setStepKey] = useState(
    () => localStorage.getItem('ri-journey') || 'welcome'
  )
  const [bubbleOpen, setBubbleOpen] = useState(true)

  const step = JOURNEY.find(s => s.key === stepKey) || JOURNEY[0]
  const stepIndex = JOURNEY.findIndex(s => s.key === stepKey)

  const handleCta = () => {
    const nextKey = step.next
    if (step.navigateTo) {
      localStorage.setItem('ri-journey', nextKey)
      setStepKey(nextKey)
      onNavigate(step.navigateTo)
    } else if (nextKey !== stepKey) {
      localStorage.setItem('ri-journey', nextKey)
      setStepKey(nextKey)
    } else {
      setBubbleOpen(false)
    }
  }

  const handleReset = () => {
    localStorage.setItem('ri-journey', 'welcome')
    setStepKey('welcome')
    setBubbleOpen(true)
  }

  const isWelcome = stepKey === 'welcome'
  const isComplete = stepKey === 'complete'
  const totalVillaSteps = JOURNEY.length - 2 // exclude welcome + complete

  return (
    <div className="welcome-avatar-wrapper">
      {bubbleOpen && (
        <div className={`welcome-bubble${isWelcome ? ' welcome-bubble--wide' : ''}`}>
          <div className="bubble-header">
            <span className="bubble-guide-name">{displayName}</span>
            <button className="welcome-bubble-close" onClick={() => setBubbleOpen(false)}>×</button>
          </div>

          <p className="bubble-step-title">{step.title}</p>
          <p className="welcome-bubble-text">{step.body}</p>

          {step.features && (
            <ul className="bubble-features">
              {step.features.map((f, i) => (
                <li key={i} className="bubble-feature-item">
                  <span className="feat-emoji">{f.emoji}</span>
                  <span>
                    <strong className="feat-label">{f.label}</strong>
                    <span className="feat-desc"> — {f.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {!isWelcome && !isComplete && (
            <div className="bubble-progress">
              {Array.from({ length: totalVillaSteps }).map((_, i) => (
                <span
                  key={i}
                  className={`progress-dot${i < stepIndex ? ' progress-dot--done' : i === stepIndex - 1 ? ' progress-dot--active' : ''}`}
                />
              ))}
            </div>
          )}

          <button className="welcome-bubble-cta" onClick={handleCta}>
            {step.cta}
          </button>

          {!isWelcome && (
            <button className="bubble-restart" onClick={handleReset}>
              ↩ Restart tour
            </button>
          )}
        </div>
      )}

      <div className="welcome-avatar-figure" onClick={() => setBubbleOpen(v => !v)} title="Click to chat with Maia">
        <MaiaAvatarSvg config={avatarCfg} width={120} height={150} animated={true} />
      </div>

      {!bubbleOpen && (
        <div className="maia-name-tag" onClick={() => setBubbleOpen(true)}>{displayName} 🌸</div>
      )}
    </div>
  )
}

export default function IslandMap() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)
  const profile = loadUserProfile()

  return (
    <div className="island-wrapper">

      <div className="ocean">
        <div className="wave wave1" />
        <div className="wave wave2" />
        <div className="wave wave3" />
        <div className="foam foam1" />
        <div className="foam foam2" />
        <div className="foam foam3" />
      </div>

      <div className="island-title">
        <h1>Recovery Island</h1>
        <p>Welcome back, {profile.name}</p>
        <p>Choose your wellness destination</p>
      </div>

      <div className="island-container">
        <svg viewBox="0 0 100 100" className="island-svg" xmlns="http://www.w3.org/2000/svg">

          <defs>
            <radialGradient id="islandGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#6ab87a" />
              <stop offset="60%" stopColor="#5a9e6f" />
              <stop offset="100%" stopColor="#3d7a50" />
            </radialGradient>
            <radialGradient id="beachGrad" cx="50%" cy="60%" r="55%">
              <stop offset="0%" stopColor="#d4b483" />
              <stop offset="100%" stopColor="#c09860" />
            </radialGradient>
            <filter id="softShadow">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" />
            </filter>
            <radialGradient id="waterShimmer" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <filter id="waveGlow">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Water shimmer patches ── */}
          <ellipse cx="15" cy="30" rx="8" ry="4" fill="url(#waterShimmer)" opacity="0.6">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="85" cy="25" rx="6" ry="3" fill="url(#waterShimmer)" opacity="0.5">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="5s" begin="1s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="10" cy="70" rx="7" ry="3" fill="url(#waterShimmer)" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="6s" begin="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="88" cy="72" rx="8" ry="3.5" fill="url(#waterShimmer)" opacity="0.5">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4.5s" begin="0.5s" repeatCount="indefinite" />
          </ellipse>

          {/* ── Water sparkles ── */}
          <Sparkle x={8}  y={20} delay={0}   />
          <Sparkle x={92} y={18} delay={1.2} />
          <Sparkle x={5}  y={55} delay={0.7} />
          <Sparkle x={95} y={60} delay={2}   />
          <Sparkle x={20} y={88} delay={1.5} />
          <Sparkle x={80} y={90} delay={0.3} />
          <Sparkle x={50} y={95} delay={2.5} />
          <Sparkle x={12} y={40} delay={3}   />
          <Sparkle x={88} y={42} delay={1.8} />

          {/* ── Birds – expanded flock ── */}
          {/* Left to right */}
          <Bird delay={0}  duration={22} pathD="M0,8  Q25,-2  50,5  Q75,-5  105,3"  />
          <Bird delay={3}  duration={25} pathD="M0,11 Q20,3   45,8  Q70,0   105,6"  />
          <Bird delay={8}  duration={20} pathD="M0,15 Q30,5   55,12 Q80,2   105,10" />
          <Bird delay={13} duration={28} pathD="M0,6  Q22,-4  48,2  Q74,-8  105,0"  />
          <Bird delay={6}  duration={24} pathD="M0,20 Q28,10  52,17 Q76,7   105,14" />
          <Bird delay={18} duration={21} pathD="M0,13 Q25,4   50,10 Q78,-2  105,7"  />
          {/* Right to left */}
          <Bird delay={2}  duration={26} pathD="M105,9  Q80,0  55,6  Q30,-4  -5,2"  />
          <Bird delay={10} duration={23} pathD="M105,14 Q78,5  53,11 Q28,1   -5,7"  />
          <Bird delay={16} duration={30} pathD="M105,18 Q82,8  57,15 Q32,5   -5,11" />
          <Bird delay={5}  duration={27} pathD="M105,7  Q83,-3 58,4  Q33,-6  -5,1"  />
          {/* Extra birds – varied altitudes & timings */}
          <Bird delay={1}  duration={18} pathD="M0,25  Q25,15  50,22  Q75,12  105,18" />
          <Bird delay={7}  duration={23} pathD="M0,32  Q22,22  47,29  Q72,19  105,25" />
          <Bird delay={12} duration={16} pathD="M105,28 Q85,18  60,25  Q35,15  -5,21" />
          <Bird delay={4}  duration={19} pathD="M0,3   Q30,-5  55,1   Q80,-8  105,-4"  />
          <Bird delay={9}  duration={24} pathD="M105,30 Q80,20  55,27  Q30,17  -5,23" />
          <Bird delay={20} duration={22} pathD="M0,16  Q28,7   52,14  Q78,4   105,10"  />
          <Bird delay={11} duration={26} pathD="M0,22  Q25,13  50,20  Q76,10  105,16"  />
          <Bird delay={17} duration={20} pathD="M105,5  Q82,-4  57,3   Q32,-6  -5,0"   />

          {/* ── Ocean wave arcs ── */}
          {/* Left zone */}
          <path d="M2,35 Q8,32 15,35" stroke="rgba(255,255,255,0.28)" strokeWidth="0.55" fill="none">
            <animate attributeName="opacity" values="0.15;0.5;0.15" dur="4.5s" repeatCount="indefinite" />
          </path>
          <path d="M2,42 Q10,39 18,42" stroke="rgba(255,255,255,0.22)" strokeWidth="0.45" fill="none">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="5.5s" begin="1s" repeatCount="indefinite" />
          </path>
          <path d="M4,50 Q12,47 20,50" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="5s" begin="2s" repeatCount="indefinite" />
          </path>
          <path d="M3,60 Q11,57 19,60" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.38;0.1" dur="6s" begin="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M5,70 Q13,67 21,70" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.35;0.1" dur="7s" begin="3s" repeatCount="indefinite" />
          </path>
          <path d="M6,80 Q14,77 22,80" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="5.5s" begin="1.5s" repeatCount="indefinite" />
          </path>

          {/* Right zone */}
          <path d="M80,33 Q87,30 95,33" stroke="rgba(255,255,255,0.28)" strokeWidth="0.55" fill="none">
            <animate attributeName="opacity" values="0.15;0.5;0.15" dur="5s" begin="0.8s" repeatCount="indefinite" />
          </path>
          <path d="M79,41 Q87,38 96,41" stroke="rgba(255,255,255,0.22)" strokeWidth="0.45" fill="none">
            <animate attributeName="opacity" values="0.1;0.42;0.1" dur="4.8s" begin="2.2s" repeatCount="indefinite" />
          </path>
          <path d="M80,50 Q88,47 96,50" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none">
            <animate attributeName="opacity" values="0.2;0.48;0.2" dur="6s" begin="1s" repeatCount="indefinite" />
          </path>
          <path d="M81,60 Q88,57 95,60" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.38;0.1" dur="5.5s" begin="3.5s" repeatCount="indefinite" />
          </path>
          <path d="M80,70 Q88,67 96,70" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.35;0.1" dur="7s" begin="0.3s" repeatCount="indefinite" />
          </path>
          <path d="M79,80 Q87,77 95,80" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="6s" begin="2s" repeatCount="indefinite" />
          </path>

          {/* Top zone */}
          <path d="M20,10 Q30,7 40,10" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.35;0.1" dur="6s" begin="1s" repeatCount="indefinite" />
          </path>
          <path d="M55,8 Q65,5 75,8" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.32;0.1" dur="7s" begin="3s" repeatCount="indefinite" />
          </path>
          <path d="M30,5 Q40,2 50,5" stroke="rgba(255,255,255,0.18)" strokeWidth="0.35" fill="none">
            <animate attributeName="opacity" values="0.1;0.28;0.1" dur="8s" begin="2s" repeatCount="indefinite" />
          </path>

          {/* Bottom zone */}
          <path d="M22,87 Q32,84 42,87" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.35;0.1" dur="6s" begin="2s" repeatCount="indefinite" />
          </path>
          <path d="M58,88 Q67,85 76,88" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="5s" begin="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M35,92 Q44,89 53,92" stroke="rgba(255,255,255,0.16)" strokeWidth="0.35" fill="none">
            <animate attributeName="opacity" values="0.1;0.28;0.1" dur="7s" begin="1.5s" repeatCount="indefinite" />
          </path>

          {/* Extra top-zone waves */}
          <path d="M10,14 Q20,11 30,14" stroke="rgba(255,255,255,0.18)" strokeWidth="0.38" fill="none">
            <animate attributeName="opacity" values="0.1;0.32;0.1" dur="6.5s" begin="0.4s" repeatCount="indefinite" />
          </path>
          <path d="M62,12 Q72,9 82,12" stroke="rgba(255,255,255,0.18)" strokeWidth="0.38" fill="none">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="7.5s" begin="2.5s" repeatCount="indefinite" />
          </path>
          {/* Extra left-zone waves */}
          <path d="M1,27 Q7,24 13,27" stroke="rgba(255,255,255,0.22)" strokeWidth="0.45" fill="none">
            <animate attributeName="opacity" values="0.1;0.42;0.1" dur="4s" begin="1.6s" repeatCount="indefinite" />
          </path>
          <path d="M2,75 Q9,72 16,75" stroke="rgba(255,255,255,0.18)" strokeWidth="0.38" fill="none">
            <animate attributeName="opacity" values="0.1;0.32;0.1" dur="5.5s" begin="2.8s" repeatCount="indefinite" />
          </path>
          {/* Extra right-zone waves */}
          <path d="M86,27 Q92,24 98,27" stroke="rgba(255,255,255,0.22)" strokeWidth="0.45" fill="none">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4.2s" begin="0.9s" repeatCount="indefinite" />
          </path>
          <path d="M84,75 Q90,72 97,75" stroke="rgba(255,255,255,0.18)" strokeWidth="0.38" fill="none">
            <animate attributeName="opacity" values="0.1;0.32;0.1" dur="6s" begin="3.2s" repeatCount="indefinite" />
          </path>
          {/* Near-shore inner arcs – hug the island edge */}
          <path d="M16,55 Q20,52 24,55" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none">
            <animate attributeName="opacity" values="0.15;0.5;0.15" dur="3.5s" begin="0.7s" repeatCount="indefinite" />
          </path>
          <path d="M17,63 Q21,60 25,63" stroke="rgba(255,255,255,0.25)" strokeWidth="0.45" fill="none">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4.5s" begin="1.8s" repeatCount="indefinite" />
          </path>
          <path d="M75,53 Q79,50 83,53" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none">
            <animate attributeName="opacity" values="0.15;0.5;0.15" dur="4s" begin="0.3s" repeatCount="indefinite" />
          </path>
          <path d="M74,62 Q78,59 82,62" stroke="rgba(255,255,255,0.25)" strokeWidth="0.45" fill="none">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="5s" begin="2.5s" repeatCount="indefinite" />
          </path>
          <path d="M37,84 Q45,81 53,84" stroke="rgba(255,255,255,0.25)" strokeWidth="0.45" fill="none">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4.5s" begin="1.2s" repeatCount="indefinite" />
          </path>

          {/* ── Foam/wake lines on water ── */}
          <path d="M5,45 Q12,43 18,46" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="5s" repeatCount="indefinite" />
          </path>
          <path d="M82,40 Q88,38 94,41" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none">
            <animate attributeName="opacity" values="0.15;0.4;0.15" dur="6s" begin="1s" repeatCount="indefinite" />
          </path>
          <path d="M10,78 Q18,76 24,79" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.35;0.1" dur="7s" begin="2s" repeatCount="indefinite" />
          </path>
          <path d="M76,82 Q83,80 90,83" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" fill="none">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="5.5s" begin="0.5s" repeatCount="indefinite" />
          </path>

          {/* ── Lily pads in water near shore ── */}
          <LilyPad x={13} y={67} scale={0.8} />
          <LilyPad x={10} y={63} scale={0.6} />
          <LilyPad x={87} y={65} scale={0.8} />
          <LilyPad x={90} y={61} scale={0.55} />
          <LilyPad x={50} y={92} scale={0.7} />

          {/* ── Island shadow ── */}
          <ellipse cx="50" cy="94" rx="40" ry="4" fill="rgba(0,0,0,0.18)" />

          {/* ── Island shapes ── */}
          <path
            d="M50,29 C58,27 67,28 74,32 C82,36 87,42 88,50 C89,57 86,64 81,69 C76,74 68,78 60,80 C55,81 52,84 50,86 C48,84 45,81 40,80 C32,78 24,74 19,69 C14,64 11,57 12,50 C13,42 18,36 26,32 C33,28 42,27 50,29 Z"
            fill="#3d6b48"
            filter="url(#softShadow)"
          />
          <path
            d="M50,31 C57,29 66,30 73,34 C80,38 85,44 86,51 C87,58 84,65 79,70 C74,75 66,79 58,81 C55,82 52,85 50,87 C48,85 45,82 42,81 C34,79 26,75 21,70 C16,65 13,58 14,51 C15,44 20,38 27,34 C34,30 43,29 50,31 Z"
            fill="url(#beachGrad)"
          />
          <path
            d="M50,34 C56,32 64,33 70,37 C77,41 81,47 81,54 C81,61 77,67 71,72 C66,76 58,79 50,80 C42,79 34,76 29,72 C23,67 19,61 19,54 C19,47 23,41 30,37 C36,33 44,32 50,34 Z"
            fill="url(#islandGrad)"
          />

          {/* Terrain bumps */}
          <ellipse cx="36" cy="52" rx="9" ry="6" fill="#5aaa6f" opacity="0.5" />
          <ellipse cx="64" cy="50" rx="8" ry="5.5" fill="#5aaa6f" opacity="0.5" />
          <ellipse cx="50" cy="43" rx="10" ry="6" fill="#62b278" opacity="0.4" />
          <ellipse cx="30" cy="63" rx="6" ry="4" fill="#4a9060" opacity="0.45" />
          <ellipse cx="70" cy="64" rx="6" ry="4" fill="#4a9060" opacity="0.45" />
          <ellipse cx="50" cy="68" rx="8" ry="4.5" fill="#52976a" opacity="0.4" />

          {/* ── Sandy paths ── */}
          <path d="M50,85 Q50,70 50,55 Q50,40 50,25" stroke="#d4b483" strokeWidth="1.4"
            strokeDasharray="2,1.2" fill="none" opacity="0.65" />
          <path d="M21,54 Q35,52 50,53 Q65,52 79,54" stroke="#d4b483" strokeWidth="1.1"
            strokeDasharray="2,1.2" fill="none" opacity="0.55" />
          <path d="M26,38 Q38,36 50,37 Q62,36 74,38" stroke="#d4b483" strokeWidth="1"
            strokeDasharray="2,1.2" fill="none" opacity="0.5" />

          {/* ── Bridge ── */}
          <rect x="47" y="84" width="6" height="5" rx="0.5" fill="#9B7A2A" />
          <rect x="46.2" y="84" width="7.6" height="1" rx="0.4" fill="#c8a43a" />
          <rect x="46.2" y="86" width="7.6" height="0.5" fill="#7a5c14" />
          <rect x="46.2" y="87.5" width="7.6" height="0.5" fill="#7a5c14" />
          <line x1="46.2" y1="84" x2="46.2" y2="89" stroke="#6b4f0e" strokeWidth="0.5" />
          <line x1="53.8" y1="84" x2="53.8" y2="89" stroke="#6b4f0e" strokeWidth="0.5" />

          {/* ── Rocks ── */}
          <Rocks x={24} y={58} scale={0.5} />
          <Rocks x={76} y={57} scale={0.5} />
          <Rocks x={44} y={76} scale={0.45} />
          <Rocks x={57} y={75} scale={0.4} />
          <Rocks x={35} y={38} scale={0.4} />
          <Rocks x={65} y={37} scale={0.4} />

          {/* ── Flowers ── */}
          <Flower x={28} y={68} color="#ff6b9d" scale={0.7} />
          <Flower x={33} y={65} color="#ff9ecd" scale={0.6} />
          <Flower x={72} y={67} color="#ffb347" scale={0.7} />
          <Flower x={67} y={64} color="#ff6b9d" scale={0.55} />
          <Flower x={40} y={74} color="#c084fc" scale={0.65} />
          <Flower x={60} y={73} color="#fb923c" scale={0.65} />
          <Flower x={46} y={40} color="#34d399" scale={0.6} />
          <Flower x={54} y={39} color="#60a5fa" scale={0.6} />
          <Flower x={25} y={45} color="#f472b6" scale={0.55} />
          <Flower x={75} y={44} color="#a78bfa" scale={0.55} />
          <Flower x={38} y={55} color="#fbbf24" scale={0.5} />
          <Flower x={62} y={54} color="#ff6b9d" scale={0.5} />

          {/* ── Palm trees ── */}
          <PalmTree x={24} y={71} scale={0.55} />
          <PalmTree x={76} y={70} scale={0.55} />
          <PalmTree x={32} y={47} scale={0.5}  />
          <PalmTree x={68} y={45} scale={0.5}  />
          <PalmTree x={43} y={32} scale={0.48} />
          <PalmTree x={58} y={30} scale={0.48} />
          <PalmTree x={50} y={27} scale={0.45} />

          {/* ── Villas ── */}
          {villas.map((villa) => {
            const isHovered = hovered === villa.id
            return (
              <g
                key={villa.id}
                onClick={() => navigate(villa.path)}
                onMouseEnter={() => setHovered(villa.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                <VillaBuilding x={villa.x} y={villa.y} color={villa.color} isHovered={isHovered} />
                <VillaLabel villa={villa} isHovered={isHovered} />
              </g>
            )
          })}

        </svg>
      </div>

      {/* Hover tooltip */}
      {hovered && (() => {
        const villa = villas.find(v => v.id === hovered)
        return (
          <div className="villa-tooltip">
            <div className="tooltip-emoji">{villa.emoji}</div>
            <div className="tooltip-name">{villa.name}</div>
            <div className="tooltip-desc">{villa.description}</div>
            <div className="tooltip-cta">Click to enter →</div>
          </div>
        )
      })()}

      <WelcomeAvatar onNavigate={navigate} profile={profile} />
    </div>
  )
}