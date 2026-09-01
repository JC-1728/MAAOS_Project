const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('maaos_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  const start = performance.now()
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    const latency = Math.round(performance.now() - start)
    window.dispatchEvent(new CustomEvent('maaos-latency', { detail: { latency } }))


    const data = await res.json().catch(() => ({}))

    if (res.status === 401 && path !== '/auth/login' && path !== '/auth/register') {
      if (localStorage.getItem('maaos_token')) {
        localStorage.removeItem('maaos_token')
        window.dispatchEvent(new CustomEvent('maaos-session-expired'))
      }
      throw new Error('Session expired')
    }

    if (!res.ok) {
      let detailMessage = 'Request failed'
      if (typeof data.detail === 'string') {
        detailMessage = data.detail
      } else if (Array.isArray(data.detail)) {
        detailMessage = data.detail.map(d => d.msg || JSON.stringify(d)).join(', ')
      } else if (data.detail) {
        detailMessage = JSON.stringify(data.detail)
      }
      throw new Error(detailMessage)
    }

    return data
  } catch (err) {
    // If it is a real network failure (e.g. offline), dispatch null latency
    window.dispatchEvent(new CustomEvent('maaos-latency', { detail: { latency: null } }))
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Failed to connect to backend server. Please verify FastAPI backend is running.')
    }
    throw err
  }
}

export function login({ identifier, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: { identifier, password }
  })
}

export function register({ name, studentId, email, password, institution }) {
  return request('/auth/register', {
    method: 'POST',
    body: {
      name,
      student_id: studentId,
      email,
      password,
      institution,
    }
  })
}

export function getProfile() {
  return request('/users/me', { method: 'GET' })
}

export function updateProfile(data) {
  return request('/users/me', {
    method: 'PATCH',
    body: data
  })
}

export function getOllamaStatus() {
  return request('/ollama/status', { method: 'GET' })
}

export function testLLMPrompt(prompt) {
  return request('/llm/prompt', {
    method: 'POST',
    body: { prompt }
  })
}
