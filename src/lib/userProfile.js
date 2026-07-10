import { DEFAULT_MAIA, loadMaiaAvatar } from '../components/MaiaAvatar'

const CONCIERGE_KEY = 'ri_concierge_v2'
const USER_PROFILE_KEY = 'ri_user_profile'

function readJSON(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

function normalizeName(name) {
  return String(name || '').trim() || 'Traveller'
}

function normalizeAvatar(avatar) {
  return { ...DEFAULT_MAIA, ...(avatar || {}) }
}

export function saveUserProfile(profile = {}) {
  const current = readJSON(USER_PROFILE_KEY, {}) || {}
  const avatar = normalizeAvatar(profile.avatar ?? current.avatar ?? loadMaiaAvatar())

  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify({
      name: normalizeName(profile.name || current.name),
      avatar,
    }))
  } catch {}
}

export function loadUserProfile() {
  const concierge = readJSON(CONCIERGE_KEY, {}) || {}
  const shared = readJSON(USER_PROFILE_KEY, {}) || {}
  const name = normalizeName(concierge.name || shared.name)
  const avatar = normalizeAvatar(concierge.avatarConfig || shared.avatar || loadMaiaAvatar())

  return {
    name,
    avatar,
  }
}
