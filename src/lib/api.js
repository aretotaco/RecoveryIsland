const TOKEN_KEY = 'ri_auth_token'

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {}
}

export function clearAuthToken() {
  setAuthToken(null)
}

async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || data.reply || 'Request failed')
    error.status = response.status
    error.body = data
    throw error
  }
  return data
}

export function apiFetch(path, options = {}) {
  const token = Object.prototype.hasOwnProperty.call(options, 'token') ? options.token : getAuthToken()
  return request(path, { ...options, token })
}

export async function safeApiFetch(path, options = {}) {
  try {
    return await apiFetch(path, options)
  } catch {
    return null
  }
}
