import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchProfile, isSupabaseConfigured, requireSupabase, upsertProfile } from '../lib/supabase'
import { saveUserProfile } from '../lib/userProfile'

const AuthContext = createContext(null)
const ACTIVE_USER_KEY = 'ri_active_user_id'

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

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function normalizeDisplayName(name) {
  return String(name || '').trim() || 'Traveller'
}

function formatAuthError(error) {
  const message = String(error?.message || '')

  if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
    return new Error('Too many signup attempts. Supabase is rate-limiting confirmation emails right now. Wait longer, or temporarily turn off email confirmation while testing.')
  }

  if (message.toLowerCase().includes('invalid') && message.toLowerCase().includes('email')) {
    return new Error('Supabase rejected the email address format. Try typing the address again manually instead of pasting it.')
  }

  return error instanceof Error ? error : new Error(message || 'Unable to continue')
}

function mapProfile(profile, authUser) {
  return {
    id: authUser.id,
    email: profile?.email || authUser.email || '',
    displayName: profile?.display_name || authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'Traveller',
    avatarConfig: profile?.avatar_config || {},
  }
}

async function ensureProfile(authUser) {
  const existing = await fetchProfile(authUser.id).catch(() => null)
  if (existing) return existing

  return upsertProfile({
    id: authUser.id,
    email: authUser.email || '',
    displayName: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'Traveller',
    avatarConfig: {},
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

    return () => listener.subscription.unsubscribe()
  }, [])

  async function login(email, password) {
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) throw new Error('Please enter a valid email address')

    const client = requireSupabase()
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })
    if (error) throw formatAuthError(error)

    const profile = await ensureProfile(data.user).catch(() => null)
    const nextUser = mapProfile(profile, data.user)
    commitUser(nextUser)
    return nextUser
  }

  async function register(email, password, displayName) {
    const normalizedEmail = normalizeEmail(email)
    const normalizedDisplayName = normalizeDisplayName(displayName)
    if (!normalizedEmail) throw new Error('Please enter a valid email address')

    const client = requireSupabase()
    const { data, error } = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { display_name: normalizedDisplayName },
      },
    })
    if (error) throw formatAuthError(error)
    if (!data.user) throw new Error('Supabase did not return a user')

    if (!data.session) {
      return {
        needsEmailConfirmation: true,
        email: normalizedEmail,
      }
    }

    const profile = await ensureProfile({
      ...data.user,
      email: data.user.email || normalizedEmail,
      user_metadata: {
        ...(data.user.user_metadata || {}),
        display_name: normalizedDisplayName,
      },
    })

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
      email: data.user.email || user?.email || '',
      displayName: payload.displayName ?? user?.displayName ?? 'Traveller',
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
    register,
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
