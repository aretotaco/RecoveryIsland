import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { requireSupabase } from '../lib/supabase'
import { deleteAccountPermanently, eraseUserData, exportUserData } from '../lib/accountData'
import { MaiaAvatarBuilder, MaiaAvatarSvg, saveMaiaAvatar } from '../components/MaiaAvatar'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuth()

  const [avatarCfg, setAvatarCfg] = useState(user?.avatarConfig || {})
  const [profileStatus, setProfileStatus] = useState('')

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordStatus, setPasswordStatus] = useState('')

  const [exportStatus, setExportStatus] = useState('')
  const [dangerStatus, setDangerStatus] = useState('')
  const [busy, setBusy] = useState(false)

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

  async function updatePassword() {
    if (password.length < 6) {
      setPasswordStatus('Password must be at least 6 characters.')
      return
    }
    if (password !== passwordConfirm) {
      setPasswordStatus('Passwords do not match.')
      return
    }
    setPasswordStatus('Updating...')
    try {
      const client = requireSupabase()
      const { error } = await client.auth.updateUser({ password })
      if (error) throw error
      setPassword('')
      setPasswordConfirm('')
      setPasswordStatus('Password updated.')
    } catch (err) {
      setPasswordStatus(err.message || 'Could not update password')
    }
  }

  async function handleExport() {
    setExportStatus('Preparing your download...')
    try {
      await exportUserData()
      setExportStatus('Downloaded.')
    } catch (err) {
      setExportStatus(err.message || 'Could not export data')
    }
  }

  async function handleErase() {
    if (!window.confirm('This deletes every mood entry, journal reflection, assessment, and wellness log you have saved, and resets your profile. Your login stays active. This cannot be undone. Continue?')) return
    setBusy(true)
    setDangerStatus('Erasing your data...')
    try {
      await eraseUserData()
      setDangerStatus('Your data has been erased.')
      setAvatarCfg({})
    } catch (err) {
      setDangerStatus(err.message || 'Could not erase data')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('This permanently deletes your Recovery Island account and everything in it. There is no undo. Continue?')) return
    setBusy(true)
    setDangerStatus('Deleting your account...')
    try {
      await deleteAccountPermanently()
      navigate('/login')
    } catch (err) {
      setDangerStatus(err.message || 'Could not delete your account')
      setBusy(false)
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
          <p className="card-text">You're signed in as <strong style={{ color: 'white' }}>{user?.studyId}</strong>. Your Study ID is your fixed login identity and can't be changed here — contact the study administrator if it needs to be corrected.</p>
        </div>

        <div className="villa-card">
          <div className="card-icon">🔒</div>
          <h3 className="card-title">Password</h3>
          <p className="card-text">Choose a new password for your account.</p>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="New password"
            style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', marginBottom: 10 }}
          />
          <input
            value={passwordConfirm}
            onChange={e => setPasswordConfirm(e.target.value)}
            type="password"
            placeholder="Confirm new password"
            style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', marginBottom: 12 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="card-btn" onClick={updatePassword}>Update password</button>
            {passwordStatus && <span style={{ color: 'rgba(255,240,200,0.6)', fontSize: '0.82rem' }}>{passwordStatus}</span>}
          </div>
        </div>

        <div className="villa-card">
          <div className="card-icon">📦</div>
          <h3 className="card-title">Export your data</h3>
          <p className="card-text">Download everything you've logged — moods, journal entries, assessments, and wellness logs — as a JSON file.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="card-btn" onClick={handleExport}>Export my data</button>
            {exportStatus && <span style={{ color: 'rgba(255,240,200,0.6)', fontSize: '0.82rem' }}>{exportStatus}</span>}
          </div>
        </div>

        <div className="villa-card" style={{ gridColumn: 'span 2', borderColor: 'rgba(239,68,68,0.3)' }}>
          <div className="card-icon">⚠️</div>
          <h3 className="card-title" style={{ color: '#fca5a5' }}>Danger zone</h3>
          <p className="card-text">These actions cannot be undone.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button
              disabled={busy}
              onClick={handleErase}
              style={{ padding: '10px 20px', borderRadius: 999, border: '1px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', cursor: busy ? 'default' : 'pointer' }}
            >
              Erase all my data
            </button>
            <button
              disabled={busy}
              onClick={handleDeleteAccount}
              style={{ padding: '10px 20px', borderRadius: 999, border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: busy ? 'default' : 'pointer' }}
            >
              Delete my account permanently
            </button>
          </div>
          {dangerStatus && <p style={{ color: 'rgba(255,240,200,0.6)', fontSize: '0.82rem', marginTop: 10 }}>{dangerStatus}</p>}
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
