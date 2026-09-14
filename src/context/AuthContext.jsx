import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchProfile, isSupabaseConfigured, requireSupabase, upsertProfile } from '../lib/supabase'
import { saveUserProfile } from '../lib/userProfile'
import { flushPendingSync } from '../lib/villaSync'

const AuthContext = createContext(null)
const ACTIVE_USER_KEY = 'ri_active_user_id'

// Participants sign in with a Study ID + password, never an email address.
// Internally we map the Study ID to a synthetic address on a domain that
// receives no mail, so Supabase Auth (which is email/password based) can be
// reused without ever collecting or displaying a real email.
const STUDY_ID_DOMAIN = 'participants.recoveryisland.local'

function clearRecoveryIslandLocalState() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('ri_') || key.startsWith('ri-')) {
        localStorage.removeItem(key)
      }
    })
  } catch {}
}

function normalizeStudyId(studyId) {
  return String(studyId || '').trim().toUpperCase()
}

function studyIdToEmail(studyId) {
  const slug = normalizeStudyId(studyId).toLowerCase().replace(/[^a-z0-9._-]/g, '')
  if (!slug) return ''
  return `${slug}@${STUDY_ID_DOMAIN}`
}

function studyIdFromAuthUser(authUser) {
  if (authUser?.user_metadata?.study_id) return authUser.user_metadata.study_id
  return String(authUser?.email || '').split('@')[0].toUpperCase()
}

function formatAuthError(error) {
  const message = String(error?.message || '')

  if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
    return new Error('Too many attempts. Please wait a while before trying again.')
  }

  if (message.toLowerCase().includes('invalid login credentials')) {
    return new Error('That Study ID or password is not recognised.')
  }

  if (message.toLowerCase().includes('already registered') || message.toLowerCase().includes('already exists')) {
    return new Error('That Study ID is already registered. Try signing in instead.')
  }

  return error instanceof Error ? error : new Error(message || 'Unable to continue')
}

// Display name is never collected from participants — it stays a fixed
// placeholder so the app never stores a real name or other identifier
// alongside their Study ID. Personalisation is limited to the Maia avatar.
const FIXED_DISPLAY_NAME = 'Traveller'

function mapProfile(profile, authUser) {
  return {
    id: authUser.id,
    studyId: profile?.study_id || studyIdFromAuthUser(authUser),
    displayName: FIXED_DISPLAY_NAME,
    avatarConfig: profile?.avatar_config || {},
  }
}

async function ensureProfile(authUser, studyId) {
  const existing = await fetchProfile(authUser.id).catch(() => null)
  if (existing) return existing

  const resolvedStudyId = normalizeStudyId(studyId || studyIdFromAuthUser(authUser))

  return upsertProfile({
    id: authUser.id,
    email: authUser.email || '',
    displayName: FIXED_DISPLAY_NAME,
    avatarConfig: {},
    studyId: resolvedStudyId,
  })
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  function commitUser(nextUser) {
    const nextUserId = nextUser?.id || ''
    const previousUserId = (() => {
      try {
        return localStorage.getItem(ACTIVE_USER_KEY) || ''
      } catch {
        return ''
      }
    })()

    if (nextUserId && previousUserId !== nextUserId) {
      clearRecoveryIslandLocalState()
    }

    if (!nextUserId && previousUserId) {
      clearRecoveryIslandLocalState()
    }

    try {
      if (nextUserId) {
        localStorage.setItem(ACTIVE_USER_KEY, nextUserId)
      } else {
        localStorage.removeItem(ACTIVE_USER_KEY)
      }
    } catch {}

    setUser(nextUser)

    if (nextUser) {
      saveUserProfile({
        name: nextUser.displayName,
        avatar: nextUser.avatarConfig,
      })
      flushPendingSync()
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const client = requireSupabase()

    client.auth.getSession().then(async ({ data, error }) => {
      if (error || !data.session?.user) {
        commitUser(null)
        setLoading(false)
        return
      }

      const profile = await ensureProfile(data.session.user).catch(() => null)
      commitUser(mapProfile(profile, data.session.user))
      setLoading(false)
    })

    const { data: listener } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        commitUser(null)
        return
      }

      const profile = await ensureProfile(session.user).catch(() => null)
      commitUser(mapProfile(profile, session.user))
    })

    function onFocus() {
      if (document.visibilityState === 'visible') flushPendingSync()
    }
    document.addEventListener('visibilitychange', onFocus)
    window.addEventListener('online', onFocus)

    return () => {
      listener.subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('online', onFocus)
    }
  }, [])

  async function login(studyId, password) {
    const normalizedStudyId = normalizeStudyId(studyId)
    const email = studyIdToEmail(normalizedStudyId)
    if (!email) throw new Error('Please enter your Study ID')

    const client = requireSupabase()
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw formatAuthError(error)

    const profile = await ensureProfile(data.user, normalizedStudyId).catch(() => null)
    const nextUser = mapProfile(profile, data.user)
    commitUser(nextUser)
    return nextUser
  }

  async function logout() {
    const client = requireSupabase()
    await client.auth.signOut()
    commitUser(null)
  }

  async function refresh() {
    const client = requireSupabase()
    const { data, error } = await client.auth.getUser()
    if (error || !data.user) return null
    const profile = await ensureProfile(data.user).catch(() => null)
    const nextUser = mapProfile(profile, data.user)
    commitUser(nextUser)
    return nextUser
  }

  async function updateProfile(payload) {
    const client = requireSupabase()
    const { data, error } = await client.auth.getUser()
    if (error || !data.user) throw new Error('You need to sign in first')

    const profile = await upsertProfile({
      id: data.user.id,
      email: data.user.email || '',
      displayName: FIXED_DISPLAY_NAME,
      avatarConfig: payload.avatarConfig ?? user?.avatarConfig ?? {},
    })

    const nextUser = mapProfile(profile, data.user)
    commitUser(nextUser)
    return nextUser
  }

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    refresh,
    updateProfile,
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
