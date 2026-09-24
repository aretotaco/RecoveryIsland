import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const HOTLINES = [
  {
    name: 'NUS University Counselling Services (UCS)',
    detail: 'Free and confidential counselling for NUS students experiencing personal, emotional, academic, or mental health concerns.',
    tel: '65162376',
    telLabel: '6516 2376',
    email: 'UCS@nus.edu.sg',
  },
  {
    name: 'NUS Lifeline (24-Hour Psychological Support)',
    detail: '24-hour support for students experiencing emotional distress, psychological crises, or urgent mental health concerns.',
    tel: '65167777',
    telLabel: '6516 7777',
  },
  {
    name: 'NUS Student Wellness',
    detail: 'Wellbeing support, wellness consultations, peer support programmes, and information on available resources for students.',
    email: 'studentwellness@nus.edu.sg',
  },
  {
    name: 'Peer Student Supporters (PSS)',
    detail: 'Trained student volunteers who provide peer support and can help connect students with appropriate resources and services.',
    website: 'https://osa.nus.edu.sg/wellness/wellness-initiatives/peer-student-supporters/',
    websiteLabel: 'Visit website',
  },
  {
    name: 'Community Health Assessment Team (CHAT)',
    detail: 'Free mental health assessments, mental health information, and support for young people and young adults.',
    tel: '64936500',
    telLabel: '6493 6500',
    website: 'https://www.chat.mentalhealth.sg',
    websiteLabel: 'chat.mentalhealth.sg',
  },
  {
    name: 'Samaritans of Singapore (SOS)',
    detail: '24-hour confidential emotional support for individuals experiencing emotional distress, crisis situations, or suicidal thoughts.',
    tel: '1767',
    telLabel: '1767',
    whatsapp: '6591511767',
    whatsappLabel: 'CareText: 9151 1767',
    website: 'https://www.sos.org.sg',
    websiteLabel: 'sos.org.sg',
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
                <span style={{ fontSize: '0.72rem', color: 'var(--ri-text-secondary)' }}>{e.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="villa-card" style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <div className="card-icon">📞</div>
          <h3 className="card-title">Singapore support hotlines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {HOTLINES.map(l => (
              <div key={l.name} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'var(--ri-card-bg)', border: '1px solid var(--ri-card-border)' }}>
                <div>
                  <p style={{ color: 'var(--ri-text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>{l.name}</p>
                  <p style={{ color: 'var(--ri-text-warm-muted)', fontSize: '0.78rem', marginTop: 2 }}>{l.detail}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  {l.tel && (
                    <a href={`tel:${l.tel}`} style={{ padding: '8px 14px', borderRadius: 999, background: '#ef4444', color: 'white', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                      Call {l.telLabel}
                    </a>
                  )}
                  {l.whatsapp && (
                    <a href={`https://wa.me/${l.whatsapp}`} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid #ef4444', color: '#fca5a5', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                      WhatsApp
                    </a>
                  )}
                  {l.email && (
                    <a href={`mailto:${l.email}`} style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid #ef4444', color: '#fca5a5', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                      Email
                    </a>
                  )}
                  {l.website && (
                    <a href={l.website} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', borderRadius: 999, border: '1px solid #ef4444', color: '#fca5a5', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                      {l.websiteLabel || 'Website'}
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

        <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--ri-text-warm-muted)', fontSize: '0.75rem', padding: '0 16px' }}>
          These numbers were accurate at the time this page was built. If a line isn't reachable, IMH's Emergency Room (24 hours) is always an option.
        </p>
      </div>
    </div>
  )
}
