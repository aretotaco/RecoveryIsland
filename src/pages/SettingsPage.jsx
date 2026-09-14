import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MaiaAvatarBuilder, MaiaAvatarSvg, saveMaiaAvatar } from '../components/MaiaAvatar'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuth()

  const [avatarCfg, setAvatarCfg] = useState(user?.avatarConfig || {})
  const [profileStatus, setProfileStatus] = useState('')

  async function saveProfile() {
    setProfileStatus('Saving...')
    try {
      saveMaiaAvatar(avatarCfg)
      await updateProfile({ avatarConfig: avatarCfg })
      setProfileStatus('Saved.')
    } catch (err) {
      setProfileStatus(err.message || 'Could not save profile')
    }
  }

  const vs = { '--villa-color': '#94a3b8', '--villa-color-light': '#cbd5e1' }

  return (
    <div className="villa-page" style={vs}>
      <div className="villa-bg">
        <div className="villa-bg-orb orb1" />
        <div className="villa-bg-orb orb2" />
        <div className="villa-bg-orb orb3" />
      </div>
      <button className="back-btn" onClick={() => navigate('/')}>Back to Island</button>

      <div className="villa-hero">
        <div className="villa-emoji">⚙️</div>
        <div className="villa-tag">Settings</div>
        <h1 className="villa-title">Your Account</h1>
        <p className="villa-subtitle">Manage your profile, login details, and data.</p>
      </div>

      <div className="villa-content">
        <div className="villa-card" style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <div className="card-icon">🌸</div>
          <h3 className="card-title">Customise Maia</h3>
          <p className="card-text">Personalise your companion's look. Recovery Island doesn't collect your name or any other identifier — Maia is the only thing you can customise here.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
              <MaiaAvatarSvg config={avatarCfg} width={100} height={125} animated={false} />
            </div>
            <div style={{ flex: '1 1 260px', minWidth: 240 }}>
              <MaiaAvatarBuilder config={avatarCfg} onChange={setAvatarCfg} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
            <button className="card-btn" onClick={saveProfile}>Save Maia</button>
            {profileStatus && <span style={{ color: 'rgba(255,240,200,0.6)', fontSize: '0.85rem' }}>{profileStatus}</span>}
          </div>
        </div>

        <div className="villa-card">
          <div className="card-icon">🪪</div>
          <h3 className="card-title">Study ID</h3>
          <p className="card-text">You're signed in as <strong style={{ color: 'white' }}>{user?.studyId}</strong>. Your Study ID and password are set by the study team and can't be changed here — contact them if you need help signing in.</p>
        </div>

        <div className="villa-card">
          <div className="card-icon">🔒</div>
          <h3 className="card-title">Your data</h3>
          <p className="card-text">Recovery Island keeps your mood, wellness, and assessment logs so it can show you your own summaries and insights over time. Data export and deletion are managed by the study team, not from this page.</p>
        </div>

        <div className="villa-card">
          <div className="card-icon">👋</div>
          <h3 className="card-title">Sign out</h3>
          <p className="card-text">You can always come back — your data stays saved.</p>
          <button className="card-btn" style={{ background: 'rgba(255,255,255,0.12)' }} onClick={() => { logout(); navigate('/login') }}>
            Log out
          </button>
        </div>
      </div>
    </div>
  )
}
