import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TopStrip, Footer } from '../components/SystemChrome.jsx'
import { login } from '../api/auth.js'

export default function Login() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!identifier || !password) {
      setError('IDENTIFICATION and SECURITY KEY are both required.')
      return
    }
    setLoading(true)
    try {
      const data = await login({ identifier, password })
      localStorage.setItem('maaos_token', data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper bg-grid">
      <TopStrip protocolLabel="" reqId="" />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="corner-frame w-full max-w-md">
          <div className="border border-ink/20 bg-paper">
            {/* header bar */}
            <div className="flex items-center justify-between px-6 pt-6">
              <div>
                <h1 className="font-mono font-bold text-lg tracking-tight">SYSTEM ACCESS</h1>
                <p className="font-mono text-[11px] text-ink/50 mt-0.5">🔒 AUTH_PROTOCOL: 0x8F9B2A</p>
              </div>
              <span className="font-mono text-[10px] border border-ink/20 px-2 py-0.5 text-ink/60">
                STABLE_V1.04
              </span>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-6 space-y-5">
              <button
                type="button"
                className="w-full bg-ink text-paper font-mono text-sm font-semibold tracking-wide py-3 flex items-center justify-center gap-2 hover:bg-ink/85 transition-colors"
              >
                <span aria-hidden>🏛</span> Continue with University SSO
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-ink/15" />
                <span className="font-mono text-[10px] text-ink/40 tracking-widest">OR</span>
                <div className="h-px flex-1 bg-ink/15" />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="identifier" className="block font-mono text-[10px] tracking-widest text-ink/50">
                  IDENTIFICATION
                </label>
                <input
                  id="identifier"
                  type="text"
                  placeholder="STUDENT_ID / EMAIL"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full border border-ink/25 bg-paper px-3 py-2.5 font-mono text-sm placeholder:text-ink/30 outline-none focus:border-ink transition-colors"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block font-mono text-[10px] tracking-widest text-ink/50">
                  SECURITY KEY
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-ink/25 bg-paper px-3 py-2.5 font-mono text-sm placeholder:text-ink/30 outline-none focus:border-ink transition-colors"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="font-mono text-[11px] text-red-700 border border-red-300 bg-red-50 px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ink text-paper font-mono text-sm font-semibold tracking-wide py-3 hover:bg-ink/85 transition-colors disabled:opacity-50"
              >
                {loading ? 'AUTHENTICATING…' : 'SIGN IN'}
              </button>

              <div className="flex items-center justify-between font-mono text-[11px] text-ink/60">
                <a href="#" className="hover:text-ink transition-colors">Forgot Credentials?</a>
                <Link to="/register" className="hover:text-ink transition-colors">Request System Access</Link>
              </div>

              <div className="flex items-center gap-2 border border-ink/15 bg-ink/[0.03] px-3 py-2.5">
                <span aria-hidden className="text-red-600 text-xs">⚠</span>
                <span className="font-mono text-[10px] tracking-wide text-ink/60">
                  RESTRICTED ACCESS: AUTHORIZED ACADEMIC PERSONNEL ONLY
                </span>
              </div>
            </form>

            <div className="flex items-center justify-between px-6 py-3 border-t border-ink/10 font-mono text-[10px] text-ink/40">
              <span>LATENCY &nbsp;14ms &nbsp;&nbsp;ENCRYPTION &nbsp;AES-256</span>
              <span className="text-right">SYSTEM.AUTH.LOGIN //<br/>BUILD.STABLE.V1.0.4</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
