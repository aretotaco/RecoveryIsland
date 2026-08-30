import { deleteAllVillaEntries, fetchProfile, fetchVillaEntries, requireSupabase, upsertProfile } from './supabase'

function clearLocalRecoveryIslandState() {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('ri_') || key.startsWith('ri-')) {
        localStorage.removeItem(key)
      }
    })
  } catch {}
}

export async function exportUserData() {
  const client = requireSupabase()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('You need to sign in first')

  const [profile, entries] = await Promise.all([
    fetchProfile(data.user.id).catch(() => null),
    fetchVillaEntries({ userId: data.user.id, limit: 1000 }),
  ])

  const payload = {
    exportedAt: new Date().toISOString(),
    account: { id: data.user.id, email: data.user.email },
    profile,
    entries,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `recovery-island-data-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function eraseUserData() {
  const client = requireSupabase()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('You need to sign in first')

  await deleteAllVillaEntries(data.user.id)
  await upsertProfile({
    id: data.user.id,
    email: data.user.email || '',
    displayName: 'Traveller',
    avatarConfig: {},
  })

  clearLocalRecoveryIslandState()
}

export async function deleteAccountPermanently() {
  const client = requireSupabase()
  const { data, error } = await client.auth.getSession()
  if (error || !data.session) throw new Error('You need to sign in first')

  const response = await fetch('/api/account', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${data.session.access_token}` },
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.message || 'Unable to delete your account right now')
  }

  clearLocalRecoveryIslandState()
  await client.auth.signOut()
}
