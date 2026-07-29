import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TopStrip, Footer } from '../components/SystemChrome.jsx'
import { register } from '../api/auth.js'

const initialForm = {
  name: '',
  studentId: '',
  email: '',
  institution: '',
  password: '',
  confirmPassword: '',
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password) {
      setError('NAME, EMAIL and SECURITY KEY are required.')
      return
    }
    if (form.password.length < 8) {
      setError('SECURITY KEY must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('SECURITY KEY and CONFIRM KEY do not match.')
      return
    }

    setLoading(true)
    try {
      await register({
        name: form.name,
        studentId: form.studentId,
        email: form.email,
        password: form.password,
        institution: form.institution,
      })
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper bg-grid">
      <TopStrip protocolLabel="" reqId="" />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="corner-frame w-full max-w-md">
          <div className="border border-ink/20 bg-paper">
            <div className="flex items-center justify-between px-6 pt-6">
              <div>
                <h1 className="font-mono font-bold text-lg tracking-tight">REQUEST SYSTEM ACCESS</h1>
                <p className="font-mono text-[11px] text-ink/50 mt-0.5">🔒 AUTH_PROTOCOL: 0x8F9B2A</p>
              </div>
              <span className="font-mono text-[10px] border border-ink/20 px-2 py-0.5 text-ink/60">
                STABLE_V1.04
              </span>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-6 space-y-4">
              <Field label="FULL NAME" placeholder="e.g. A. MENON" value={form.name} onChange={update('name')} autoComplete="name" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="STUDENT ID" placeholder="STU-2024-XXXX" value={form.studentId} onChange={update('studentId')} />
                <Field label="INSTITUTION" placeholder="COLLEGE / UNIV." value={form.institution} onChange={update('institution')} />
              </div>
              <Field label="EMAIL" type="email" placeholder="you@university.edu" value={form.email} onChange={update('email')} autoComplete="email" />

              <div className="grid grid-cols-2 gap-3">
                <Field label="SECURITY KEY" type="password" placeholder="PASSWORD" value={form.password} onChange={update('password')} autoComplete="new-password" />
                <Field label="CONFIRM KEY" type="password" placeholder="RE-ENTER" value={form.confirmPassword} onChange={update('confirmPassword')} autoComplete="new-password" />
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
                {loading ? 'PROVISIONING…' : 'CREATE ACCOUNT'}
              </button>

              <p className="text-center font-mono text-[11px] text-ink/60">
                Already provisioned?{' '}
                <Link to="/login" className="text-ink underline underline-offset-2">Sign in</Link>
              </p>

              <div className="flex items-center gap-2 border border-ink/15 bg-ink/[0.03] px-3 py-2.5">
                <span aria-hidden className="text-red-600 text-xs">⚠</span>
                <span className="font-mono text-[10px] tracking-wide text-ink/60">
                  RESTRICTED ACCESS: AUTHORIZED ACADEMIC PERSONNEL ONLY
                </span>
              </div>
            </form>

            <div className="flex items-center justify-between px-6 py-3 border-t border-ink/10 font-mono text-[10px] text-ink/40">
              <span>LATENCY &nbsp;14ms &nbsp;&nbsp;ENCRYPTION &nbsp;AES-256</span>
              <span className="text-right">SYSTEM.AUTH.REGISTER //<br/>BUILD.STABLE.V1.0.4</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Field({ label, type = 'text', placeholder, value, onChange, autoComplete }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] tracking-widest text-ink/50">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="w-full border border-ink/25 bg-paper px-3 py-2.5 font-mono text-sm placeholder:text-ink/30 outline-none focus:border-ink transition-colors"
      />
    </div>
  )
}
