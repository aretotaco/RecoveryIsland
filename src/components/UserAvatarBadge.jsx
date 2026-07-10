import { useAuth } from '../context/AuthContext'

export default function UserAvatarBadge() {
  const { user } = useAuth()
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 0 4px rgba(52,211,153,0.12)' }} />
      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>{user?.displayName || 'Traveller'}</span>
    </div>
  )
}
