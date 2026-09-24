import { useState } from 'react'

// ─── Customisation options ────────────────────────────────────────────────────

export const SKIN_TONES = [
  { id: 'porcelain', name: 'Porcelain', base: '#fef0e4', shadow: '#f0c898', highlight: '#fffaf5' },
  { id: 'fair',      name: 'Fair',      base: '#f5d5b0', shadow: '#e0a870', highlight: '#fde8d0' },
  { id: 'medium',    name: 'Medium',    base: '#c4845a', shadow: '#9a6040', highlight: '#d89870' },
  { id: 'tan',       name: 'Tan',       base: '#9a6040', shadow: '#744428', highlight: '#b07050' },
  { id: 'deep',      name: 'Deep',      base: '#5c2e18', shadow: '#3c1e0c', highlight: '#703824' },
]

export const HAIR_STYLES = [
  { id: 'short',  name: 'Short'  },
  { id: 'medium', name: 'Medium' },
  { id: 'long',   name: 'Long'   },
  { id: 'curly',  name: 'Curly'  },
  { id: 'bun',    name: 'Bun'    },
]

export const HAIR_COLORS = [
  { id: 'black',  name: 'Black',  color: '#1a0800' },
  { id: 'brown',  name: 'Brown',  color: '#5c2c10' },
  { id: 'auburn', name: 'Auburn', color: '#8c3020' },
  { id: 'blonde', name: 'Blonde', color: '#c8a030' },
  { id: 'silver', name: 'Silver', color: '#9898a8' },
  { id: 'purple', name: 'Purple', color: '#6b21a8' },
]

export const EYE_SHAPES = [
  { id: 'round',  name: 'Round'  },
  { id: 'almond', name: 'Almond' },
  { id: 'bright', name: 'Bright' },
]

export const EYE_COLORS = [
  { id: 'brown', name: 'Brown', color: '#78350f' },
  { id: 'blue',  name: 'Blue',  color: '#1e40af' },
  { id: 'green', name: 'Green', color: '#15803d' },
  { id: 'gray',  name: 'Gray',  color: '#4b5563' },
  { id: 'amber', name: 'Amber', color: '#d97706' },
]

export const OUTFITS = [
  { id: 'casual',   name: 'Casual',   desc: 'Relaxed everyday look' },
  { id: 'elegant',  name: 'Elegant',  desc: 'Flowy dress' },
  { id: 'sporty',   name: 'Sporty',   desc: 'Active wear' },
  { id: 'cosy',     name: 'Cosy',     desc: 'Warm sweater' },
]

export const OUTFIT_COLORS = [
  { id: 'indigo',  color: '#4f46e5' },
  { id: 'rose',    color: '#e11d48' },
  { id: 'emerald', color: '#059669' },
  { id: 'amber',   color: '#d97706' },
  { id: 'sky',     color: '#0284c7' },
  { id: 'violet',  color: '#7c3aed' },
  { id: 'teal',    color: '#0d9488' },
  { id: 'coral',   color: '#ea580c' },
]

export const ACCESSORIES = [
  { id: 'none',     name: 'None',        emoji: '—' },
  { id: 'crown',    name: 'Flower Crown',emoji: '🌸' },
  { id: 'glasses',  name: 'Glasses',     emoji: '👓' },
  { id: 'headband', name: 'Headband',    emoji: '🎀' },
  { id: 'stars',    name: 'Star Clips',  emoji: '⭐' },
]

export const DEFAULT_MAIA = {
  skin:        'fair',
  hairStyle:   'medium',
  hairColor:   'brown',
  eyeShape:    'almond',
  eyeColor:    'brown',
  outfit:      'elegant',
  outfitColor: 'indigo',
  accessory:   'crown',
}

const MAIA_STORAGE_KEY = 'ri_maia_avatar'

export function loadMaiaAvatar() {
  try {
    const raw = localStorage.getItem(MAIA_STORAGE_KEY)
    return raw ? { ...DEFAULT_MAIA, ...JSON.parse(raw) } : { ...DEFAULT_MAIA }
  } catch { return { ...DEFAULT_MAIA } }
}

export function saveMaiaAvatar(config) {
  try { localStorage.setItem(MAIA_STORAGE_KEY, JSON.stringify(config)) } catch {}
}

// ─── SVG rendering helpers ───────────────────────────────────────────────────

function getSkin(id) { return SKIN_TONES.find(s => s.id === id) || SKIN_TONES[1] }
function getHairColor(id) { return (HAIR_COLORS.find(h => h.id === id) || HAIR_COLORS[1]).color }
function getEyeColor(id) { return (EYE_COLORS.find(e => e.id === id) || EYE_COLORS[0]).color }
function getOutfitColor(id) { return (OUTFIT_COLORS.find(o => o.id === id) || OUTFIT_COLORS[0]).color }

function HairBack({ style, hc }) {
  if (style === 'short') return (
    <g>
      <ellipse cx="40" cy="27" rx="18" ry="11" fill={hc} />
    </g>
  )
  if (style === 'medium') return (
    <g>
      <ellipse cx="40" cy="27" rx="20" ry="13" fill={hc} />
      <path d="M21,30 Q13,47 16,60" stroke={hc} strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M59,30 Q67,47 64,60" stroke={hc} strokeWidth="10" fill="none" strokeLinecap="round" />
    </g>
  )
  if (style === 'long') return (
    <g>
      <ellipse cx="40" cy="27" rx="20" ry="13" fill={hc} />
      <path d="M21,30 Q11,55 14,80" stroke={hc} strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M59,30 Q69,55 66,80" stroke={hc} strokeWidth="11" fill="none" strokeLinecap="round" />
    </g>
  )
  if (style === 'curly') return (
    <g>
      <ellipse cx="40" cy="24" rx="24" ry="18" fill={hc} />
      <circle cx="17" cy="30" r="9" fill={hc} />
      <circle cx="63" cy="30" r="9" fill={hc} />
      <circle cx="40" cy="9"  r="9" fill={hc} />
      <circle cx="22" cy="17" r="7" fill={hc} />
      <circle cx="58" cy="17" r="7" fill={hc} />
    </g>
  )
  if (style === 'bun') return (
    <g>
      <ellipse cx="40" cy="28" rx="18" ry="12" fill={hc} />
      <circle cx="40" cy="13" r="10" fill={hc} />
    </g>
  )
  return null
}

function HairFront({ style, hc }) {
  if (style === 'short') return (
    <g>
      <ellipse cx="40" cy="18" rx="18" ry="8" fill={hc} />
      <path d="M22,20 Q22,28 24,32" stroke={hc} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M58,20 Q58,28 56,32" stroke={hc} strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  )
  if (style === 'medium') return (
    <g>
      <ellipse cx="40" cy="18" rx="20" ry="8" fill={hc} />
      <path d="M20,20 Q20,28 22,34" stroke={hc} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M60,20 Q60,28 58,34" stroke={hc} strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  )
  if (style === 'long') return (
    <g>
      <ellipse cx="40" cy="18" rx="20" ry="8" fill={hc} />
      <path d="M20,20 Q20,28 22,36" stroke={hc} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M60,20 Q60,28 58,36" stroke={hc} strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  )
  if (style === 'curly') return (
    <g>
      <ellipse cx="40" cy="16" rx="22" ry="9" fill={hc} />
    </g>
  )
  if (style === 'bun') return (
    <g>
      <ellipse cx="40" cy="19" rx="18" ry="8" fill={hc} />
      <path d="M22,21 Q22,28 24,32" stroke={hc} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M58,21 Q58,28 56,32" stroke={hc} strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* bun */}
      <circle cx="40" cy="12" r="9" fill={hc} />
      <circle cx="40" cy="10" r="5" fill={hc} opacity="0.7" />
    </g>
  )
  return null
}

function Eyes({ shape, ec }) {
  if (shape === 'round') return (
    <g>
      <ellipse cx="31" cy="34" rx="5.5" ry="6.5" fill="white" opacity="0.95" />
      <ellipse cx="49" cy="34" rx="5.5" ry="6.5" fill="white" opacity="0.95" />
      <ellipse cx="31.5" cy="35" rx="3.5" ry="4.5" fill={ec} />
      <ellipse cx="49.5" cy="35" rx="3.5" ry="4.5" fill={ec} />
      <circle cx="33" cy="33" r="1.5" fill="white" />
      <circle cx="51" cy="33" r="1.5" fill="white" />
      <path d="M26,28 Q28,25 32,28" stroke="#2d1b00" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M44,28 Q46,25 50,28" stroke="#2d1b00" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </g>
  )
  if (shape === 'almond') return (
    <g>
      <ellipse cx="31" cy="34" rx="5" ry="5.5" fill="white" opacity="0.95" />
      <ellipse cx="49" cy="34" rx="5" ry="5.5" fill="white" opacity="0.95" />
      <ellipse cx="31.5" cy="35" rx="3.2" ry="3.8" fill={ec} />
      <ellipse cx="49.5" cy="35" rx="3.2" ry="3.8" fill={ec} />
      <circle cx="33" cy="34" r="1.4" fill="white" />
      <circle cx="51" cy="34" r="1.4" fill="white" />
      <path d="M26,29 Q28,26 31,29" stroke="#2d1b00" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M44,29 Q46,26 49,29" stroke="#2d1b00" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </g>
  )
  if (shape === 'bright') return (
    <g>
      <ellipse cx="31" cy="34" rx="6" ry="6" fill="white" opacity="0.95" />
      <ellipse cx="49" cy="34" rx="6" ry="6" fill="white" opacity="0.95" />
      <ellipse cx="31.5" cy="34.5" rx="4" ry="4" fill={ec} />
      <ellipse cx="49.5" cy="34.5" rx="4" ry="4" fill={ec} />
      <circle cx="33.5" cy="32.5" r="1.8" fill="white" />
      <circle cx="51.5" cy="32.5" r="1.8" fill="white" />
      <circle cx="30" cy="36" r="0.8" fill="white" opacity="0.6" />
      <circle cx="48" cy="36" r="0.8" fill="white" opacity="0.6" />
      <path d="M25,28 Q28,25 32,27" stroke="#2d1b00" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M43,27 Q46,25 51,28" stroke="#2d1b00" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </g>
  )
  return null
}

function Outfit({ style, oc }) {
  const dark = oc + 'cc'
  if (style === 'casual') return (
    <g>
      <ellipse cx="40" cy="80" rx="22" ry="20" fill={oc} />
      <path d="M18,80 Q30,72 40,72 Q50,72 62,80 Q52,96 40,98 Q28,96 18,80Z" fill={dark} opacity="0.3" />
      {/* collar */}
      <path d="M34,58 Q40,62 46,58" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
    </g>
  )
  if (style === 'elegant') return (
    <g>
      <ellipse cx="40" cy="80" rx="24" ry="22" fill={oc} />
      <path d="M16,82 Q40,72 64,82 Q56,100 40,103 Q24,100 16,82Z" fill={dark} opacity="0.25" />
      {/* V neck */}
      <path d="M35,58 L40,66 L45,58" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* waist detail */}
      <ellipse cx="40" cy="75" rx="13" ry="2" fill="white" opacity="0.15" />
    </g>
  )
  if (style === 'sporty') return (
    <g>
      <ellipse cx="40" cy="80" rx="21" ry="20" fill={oc} />
      <path d="M18,80 Q40,71 62,80 Q53,95 40,97 Q27,95 18,80Z" fill={dark} opacity="0.3" />
      {/* stripe */}
      <path d="M26,68 Q30,80 28,92" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
      <path d="M54,68 Q50,80 52,92" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
      {/* collar */}
      <ellipse cx="40" cy="60" rx="6" ry="3" fill={oc} />
    </g>
  )
  if (style === 'cosy') return (
    <g>
      <ellipse cx="40" cy="80" rx="25" ry="21" fill={oc} />
      <path d="M15,82 Q40,72 65,82 Q56,100 40,102 Q24,100 15,82Z" fill={dark} opacity="0.2" />
      {/* ribbing lines */}
      {[68,72,76,80,84,88].map((y,i) => (
        <line key={i} x1="22" y1={y} x2="58" y2={y} stroke="white" strokeWidth="0.7" opacity="0.15" />
      ))}
      {/* turtle neck */}
      <rect x="33" y="54" width="14" height="8" rx="3" fill={oc} />
    </g>
  )
  return null
}

function Accessory({ type, hc }) {
  if (type === 'none') return null
  if (type === 'crown') return (
    <g>
      <circle cx="31" cy="15" r="3.5" fill="#fb923c" opacity="0.95" />
      <circle cx="40" cy="11" r="4.2" fill="#f9a8d4" opacity="0.95" />
      <circle cx="49" cy="15" r="3.5" fill="#fb923c" opacity="0.95" />
      <circle cx="31" cy="15" r="1.8" fill="white" opacity="0.8" />
      <circle cx="40" cy="11" r="2.2" fill="white" opacity="0.8" />
      <circle cx="49" cy="15" r="1.8" fill="white" opacity="0.8" />
      <circle cx="24" cy="19" r="2.5" fill="#fbbf24" opacity="0.8" />
      <circle cx="56" cy="19" r="2.5" fill="#fbbf24" opacity="0.8" />
    </g>
  )
  if (type === 'glasses') return (
    <g>
      <circle cx="31" cy="35" r="7" fill="none" stroke="#2d2d2d" strokeWidth="1.5" opacity="0.85" />
      <circle cx="49" cy="35" r="7" fill="none" stroke="#2d2d2d" strokeWidth="1.5" opacity="0.85" />
      <line x1="38" y1="35" x2="42" y2="35" stroke="#2d2d2d" strokeWidth="1.5" opacity="0.85" />
      <line x1="24" y1="35" x2="21" y2="34" stroke="#2d2d2d" strokeWidth="1.5" opacity="0.7" />
      <line x1="56" y1="35" x2="59" y2="34" stroke="#2d2d2d" strokeWidth="1.5" opacity="0.7" />
      {/* tinted lens */}
      <circle cx="31" cy="35" r="6.5" fill="#a8d8ff" opacity="0.12" />
      <circle cx="49" cy="35" r="6.5" fill="#a8d8ff" opacity="0.12" />
    </g>
  )
  if (type === 'headband') return (
    <g>
      <path d="M21,22 Q40,14 59,22" stroke="#e11d48" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M21,22 Q40,14 59,22" stroke="#fda4af" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* bow */}
      <ellipse cx="40" cy="15" rx="5" ry="3" fill="#e11d48" transform="rotate(-15,40,15)" />
      <ellipse cx="40" cy="15" rx="5" ry="3" fill="#e11d48" transform="rotate(15,40,15)" />
      <circle cx="40" cy="15" r="2.5" fill="#fda4af" />
    </g>
  )
  if (type === 'stars') return (
    <g>
      {/* star clip left */}
      <text x="22" y="24" fontSize="8" textAnchor="middle" fill="#fbbf24">★</text>
      {/* star clip right */}
      <text x="58" y="24" fontSize="8" textAnchor="middle" fill="#fbbf24">★</text>
      <text x="40" y="14" fontSize="6" textAnchor="middle" fill="#fbbf24">✦</text>
    </g>
  )
  return null
}

// ─── Main avatar SVG renderer ────────────────────────────────────────────────

export function MaiaAvatarSvg({ config = DEFAULT_MAIA, width = 100, height = 125, animated = true }) {
  const skin = getSkin(config.skin)
  const hc   = getHairColor(config.hairColor)
  const ec   = getEyeColor(config.eyeColor)
  const oc   = getOutfitColor(config.outfitColor)

  return (
    <svg viewBox="0 0 80 105" width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`maia-glow-${width}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={oc} stopOpacity="0.4" />
          <stop offset="100%" stopColor={oc} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      {animated && (
        <circle cx="40" cy="60" r="38" fill={`url(#maia-glow-${width})`}>
          <animate attributeName="r" values="35;42;35" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Shadow */}
      <ellipse cx="40" cy="103" rx="18" ry="3" fill="rgba(0,0,0,0.12)" />

      {/* Hair back layer */}
      <HairBack style={config.hairStyle} hc={hc} />

      {/* Outfit / body */}
      <Outfit style={config.outfit} oc={oc} />

      {/* Neck */}
      <rect x="35" y="52" width="10" height="8" rx="3" fill={skin.base} />

      {/* Head */}
      <circle cx="40" cy="35" r="19" fill={skin.highlight} />
      <circle cx="40" cy="36" r="19" fill={skin.base} />

      {/* Hair front layer */}
      <HairFront style={config.hairStyle} hc={hc} />

      {/* Cheeks */}
      <ellipse cx="22" cy="40" rx="5" ry="3.5" fill="#fda4af" opacity="0.35" />
      <ellipse cx="58" cy="40" rx="5" ry="3.5" fill="#fda4af" opacity="0.35" />

      {/* Eyes */}
      <Eyes shape={config.eyeShape} ec={ec} />

      {/* Nose */}
      <circle cx="40" cy="42" r="1.2" fill={skin.shadow} opacity="0.5" />

      {/* Smile */}
      <path d="M30,46 Q40,55 50,46" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />

      {/* Accessory layer */}
      <Accessory type={config.accessory} hc={hc} />

      {/* Waving arm */}
      <g className={animated ? 'guide-wave-arm' : ''} style={{ transformOrigin: '19px 62px' }}>
        <path d="M19,62 Q9,52 7,39" stroke={skin.base} strokeWidth="9" fill="none" strokeLinecap="round" />
        <circle cx="7" cy="38" r="6" fill={skin.highlight} opacity="0.9" />
      </g>

      {/* Right arm */}
      <path d="M61,62 Q71,56 73,64" stroke={skin.base} strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="73.5" cy="65" r="5.5" fill={skin.highlight} opacity="0.85" />
    </svg>
  )
}

// ─── Avatar Builder UI ───────────────────────────────────────────────────────

const BUILDER_STEPS = [
  { id: 'skin',       title: 'Skin Tone',   subtitle: 'Choose your skin tone' },
  { id: 'hair',       title: 'Hair',        subtitle: 'Style and colour' },
  { id: 'eyes',       title: 'Eyes',        subtitle: 'Shape and colour' },
  { id: 'outfit',     title: 'Outfit',      subtitle: 'Style and colour' },
  { id: 'accessory',  title: 'Accessory',   subtitle: 'Final touch' },
]

function SwatchBtn({ selected, onClick, children, size = 40 }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size,
        border: selected ? '2.5px solid #f59e0b' : '2px solid var(--ri-input-border)',
        borderRadius: 10,
        background: selected ? 'rgba(245,158,11,0.2)' : 'var(--ri-input-bg)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s',
        padding: 0,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </button>
  )
}

export function MaiaAvatarBuilder({ config, onChange }) {
  const [step, setStep] = useState(0)
  const current = BUILDER_STEPS[step]

  function set(key, val) { onChange({ ...config, [key]: val }) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Live preview */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
        <MaiaAvatarSvg config={config} width={120} height={150} animated={false} />
      </div>

      {/* Step tabs */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        {BUILDER_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: step === i ? '1.5px solid #f59e0b' : '1.5px solid var(--ri-input-border)',
              background: step === i ? 'rgba(245,158,11,0.2)' : 'var(--ri-card-bg)',
              color: step === i ? '#fbbf24' : 'var(--ri-text-secondary)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: step === i ? 600 : 400,
              transition: 'all 0.18s',
            }}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Step panel */}
      <div style={{ background: 'var(--ri-card-bg)', borderRadius: 16, padding: '16px 18px', border: '1px solid var(--ri-card-border)' }}>
        <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.8rem', marginBottom: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{current.subtitle}</p>

        {/* SKIN */}
        {step === 0 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {SKIN_TONES.map(s => (
              <SwatchBtn key={s.id} selected={config.skin === s.id} onClick={() => set('skin', s.id)} size={46}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.base, border: '1.5px solid rgba(0,0,0,0.1)' }} title={s.name} />
              </SwatchBtn>
            ))}
          </div>
        )}

        {/* HAIR */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>STYLE</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {HAIR_STYLES.map(h => (
                  <button key={h.id} onClick={() => set('hairStyle', h.id)} style={{
                    padding: '7px 14px', borderRadius: 999,
                    border: config.hairStyle === h.id ? '1.5px solid #f59e0b' : '1.5px solid var(--ri-input-border)',
                    background: config.hairStyle === h.id ? 'rgba(245,158,11,0.2)' : 'var(--ri-card-bg)',
                    color: config.hairStyle === h.id ? '#fbbf24' : 'var(--ri-text-secondary)',
                    fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.18s',
                  }}>{h.name}</button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>COLOUR</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {HAIR_COLORS.map(h => (
                  <SwatchBtn key={h.id} selected={config.hairColor === h.id} onClick={() => set('hairColor', h.id)} size={40}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: h.color, border: '1.5px solid var(--ri-input-border)' }} title={h.name} />
                  </SwatchBtn>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EYES */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>SHAPE</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {EYE_SHAPES.map(e => (
                  <button key={e.id} onClick={() => set('eyeShape', e.id)} style={{
                    padding: '7px 16px', borderRadius: 999,
                    border: config.eyeShape === e.id ? '1.5px solid #f59e0b' : '1.5px solid var(--ri-input-border)',
                    background: config.eyeShape === e.id ? 'rgba(245,158,11,0.2)' : 'var(--ri-card-bg)',
                    color: config.eyeShape === e.id ? '#fbbf24' : 'var(--ri-text-secondary)',
                    fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.18s',
                  }}>{e.name}</button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>COLOUR</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EYE_COLORS.map(e => (
                  <SwatchBtn key={e.id} selected={config.eyeColor === e.id} onClick={() => set('eyeColor', e.id)} size={40}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: e.color, border: '1.5px solid var(--ri-input-border)' }} title={e.name} />
                  </SwatchBtn>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OUTFIT */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>STYLE</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {OUTFITS.map(o => (
                  <button key={o.id} onClick={() => set('outfit', o.id)} style={{
                    padding: '7px 14px', borderRadius: 999,
                    border: config.outfit === o.id ? '1.5px solid #f59e0b' : '1.5px solid var(--ri-input-border)',
                    background: config.outfit === o.id ? 'rgba(245,158,11,0.2)' : 'var(--ri-card-bg)',
                    color: config.outfit === o.id ? '#fbbf24' : 'var(--ri-text-secondary)',
                    fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.18s',
                  }}>{o.name}</button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ color: 'var(--ri-text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>COLOUR</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {OUTFIT_COLORS.map(o => (
                  <SwatchBtn key={o.id} selected={config.outfitColor === o.id} onClick={() => set('outfitColor', o.id)} size={40}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: o.color }} title={o.id} />
                  </SwatchBtn>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACCESSORY */}
        {step === 4 && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {ACCESSORIES.map(a => (
              <button key={a.id} onClick={() => set('accessory', a.id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 14px', borderRadius: 12,
                border: config.accessory === a.id ? '1.5px solid #f59e0b' : '1.5px solid var(--ri-input-border)',
                background: config.accessory === a.id ? 'rgba(245,158,11,0.2)' : 'var(--ri-card-bg)',
                color: config.accessory === a.id ? '#fbbf24' : 'var(--ri-text-secondary)',
                fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.18s',
                minWidth: 70,
              }}>
                <span style={{ fontSize: 20 }}>{a.emoji}</span>
                {a.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          style={{
            padding: '8px 18px', borderRadius: 999,
            border: '1.5px solid var(--ri-input-border)',
            background: 'var(--ri-card-bg)',
            color: step === 0 ? 'var(--ri-text-muted)' : 'var(--ri-text-secondary)',
            fontSize: '0.85rem', cursor: step === 0 ? 'default' : 'pointer',
          }}
        >← Back</button>
        <span style={{ fontSize: '0.75rem', color: 'var(--ri-text-muted)' }}>{step + 1} / {BUILDER_STEPS.length}</span>
        <button
          onClick={() => setStep(s => Math.min(BUILDER_STEPS.length - 1, s + 1))}
          disabled={step === BUILDER_STEPS.length - 1}
          style={{
            padding: '8px 18px', borderRadius: 999,
            border: '1.5px solid var(--ri-input-border)',
            background: step === BUILDER_STEPS.length - 1 ? 'var(--ri-card-bg)' : 'rgba(245,158,11,0.2)',
            color: step === BUILDER_STEPS.length - 1 ? 'var(--ri-text-muted)' : '#fbbf24',
            fontSize: '0.85rem', cursor: step === BUILDER_STEPS.length - 1 ? 'default' : 'pointer',
          }}
        >Next →</button>
      </div>
    </div>
  )
}
