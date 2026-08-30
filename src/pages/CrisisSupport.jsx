import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const HOTLINES = [
  {
    name: 'Samaritans of Singapore (SOS)',
    detail: '24 hours, every day',
    tel: '1767',
    telLabel: '1-767',
    whatsapp: '6591511767',
    whatsappLabel: 'CareText: 9151 1767',
  },
  {
    name: 'National Care Hotline',
    detail: 'Daily, for anyone needing emotional support',
    tel: '18002026868',
    telLabel: '1800-202-6868',
  },
  {
    name: 'IMH Mental Health Helpline',
    detail: 'Institute of Mental Health, 24 hours',
    tel: '63892222',
    telLabel: '6389-2222',
  },
  {
    name: 'Singapore Association for Mental Health (SAMH)',
    detail: 'Weekdays, for mental health and family support',
    tel: '18002837019',
    telLabel: '1800-283-7019',
  },
]

export default function CrisisSupport() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const vs = { '--villa-color': '#ef4444', '--villa-color-light': '#fca5a5' }

  return (
    <div className="villa-page" style={vs}>
      <div className="villa-bg">
        <div className="villa-bg-orb orb1" />
        <div className="villa-bg-orb orb2" />
        <div className="villa-bg-orb orb3" />
      </div>
      <button className="back-btn" onClick={() => navigate(isAuthenticated ? '/' : '/login')}>
        {isAuthenticated ? 'Back to Island' : 'Back'}
      </button>

      <div className="villa-hero">
        <div className="villa-emoji">🆘</div>
        <div className="villa-tag">Crisis Support · Singapore</div>
        <h1 className="villa-title">You deserve support right now</h1>
        <p className="villa-subtitle">
          Whatever brought you here, reaching out is a strong and capable thing to do. Help is available in Singapore, and you do not have to carry this alone.
        </p>
      </div>

      <div className="villa-content">
        <div className="villa-card" style={{ borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.06)' }}>
          <div className="card-icon">🚨</div>
          <h3 className="card-title">If you are in immediate danger</h3>
          <p className="card-text">
            Please call for emergency help right away, or go to your nearest hospital's emergency department (e.g. IMH's 24-hour Emergency Room).
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { label: 'Police', num: '999' },
              { label: 'Ambulance (SCDF)', num: '995' },
            ].map(e => (
              <a
                key={e.label}
                href={`tel:${e.num}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 18px', borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: 'white', textDecoration: 'none' }}
              >
                <strong style={{ fontSize: '1.1rem' }}>{e.num}</strong>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{e.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="villa-card" style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <div className="card-icon">📞</div>
          <h3 className="card-title">Singapore support hotlines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {HOTLINES.map(l => (
              <div key={l.name} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div>
                  <p style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>{l.name}</p>
                  <p style={{ color: 'rgba(255,240,200,0.5)', fontSize: '0.78rem', marginTop: 2 }}>{l.detail}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  <a href={`tel:${l.tel}`} style={{ padding: '8px 14px', borderRadius: 999, background: '#ef4444', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                    Call {l.telLabel}
                  </a>
                  {l.whatsapp && (
                    <a href={`https://wa.me/${l.whatsapp}`} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid #ef4444', color: '#fca5a5', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="villa-card">
          <div className="card-icon">🌿</div>
          <h3 className="card-title">Not in crisis, but need support?</h3>
          <p className="card-text">
            The rest of Recovery Island is still here for you — gentle grounding tools, a companion to talk to, and space to reflect at your own pace.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="card-btn" onClick={() => navigate('/mindfulness')}>Mindfulness Villa</button>
            <button className="card-btn" style={{ background: '#6366f1' }} onClick={() => navigate('/ai-chatbot')}>Talk to Sage</button>
          </div>
        </div>

        <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255,240,200,0.35)', fontSize: '0.75rem', padding: '0 16px' }}>
          These numbers were accurate at the time this page was built. If a line isn't reachable, IMH's Emergency Room (24 hours) is always an option.
        </p>
      </div>
    </div>
  )
}
