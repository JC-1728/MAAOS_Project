import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopStrip, Footer } from '../components/SystemChrome.jsx'
import { useNotifications } from '../components/NotificationContext.jsx'
import { getProfile, updateProfile, getOllamaStatus, testLLMPrompt } from '../api/auth.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const { addToast } = useNotifications()
  
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    student_id: '',
    institution: '',
    llm_provider: 'cloud',
    academic_preferences: '',
    notification_preferences: '',
    reminder_preferences: ''
  })
  
  const [activeTab, setActiveTab] = useState('overview')
  const [logs, setLogs] = useState([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [ollamaOnline, setOllamaOnline] = useState(null)
  
  // Settings Form State
  const [nameField, setNameField] = useState('')
  const [academicPref, setAcademicPref] = useState('')
  const [notifPref, setNotifPref] = useState(true)
  
  // Prompt Tester State
  const [promptText, setPromptText] = useState('')
  const [promptResponse, setPromptResponse] = useState('')
  const [promptLoading, setPromptLoading] = useState(false)

  // Modules list from design doc
  const modules = [
    { id: 'coordinator', name: 'Coordinator Agent', status: 'ACTIVE', desc: 'Central orchestration & routing' },
    { id: 'email', name: 'Email Intelligence Agent', status: 'ACTIVE', desc: 'Gmail OAuth + LLM content extraction' },
    { id: 'ocr', name: 'OCR Agent', status: 'ACTIVE', desc: 'Document parsing & text extraction' },
    { id: 'rag', name: 'RAG Agent', status: 'ACTIVE', desc: 'Vector storage & semantic search (ChromaDB)' },
    { id: 'analytics', name: 'Analytics Agent', status: 'ACTIVE', desc: 'Weekly digest & productivity metrics' },
  ]

  // JWT Expiry & Session Expiration listener
  useEffect(() => {
    function handleSessionExpired() {
      addToast('Your session has expired. Please log in again.', 'error')
      navigate('/login')
    }
    
    window.addEventListener('maaos-session-expired', handleSessionExpired)
    return () => {
      window.removeEventListener('maaos-session-expired', handleSessionExpired)
    }
  }, [navigate, addToast])

  // Fetch profile on load
  useEffect(() => {
    const token = localStorage.getItem('maaos_token')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser({
        id: payload.sub,
        role: 'ACADEMIC_RESEARCHER',
        clearance: 'LEVEL_01_SECURE',
      })
    } catch (e) {
      setUser({
        id: 'UNKNOWN',
        role: 'ACADEMIC_RESEARCHER',
        clearance: 'LEVEL_01_SECURE',
      })
    }

    async function loadProfile() {
      try {
        const data = await getProfile()
        setProfile(data)
        setNameField(data.name || '')
        setAcademicPref(data.academic_preferences || '')
        setNotifPref(data.notification_preferences !== 'disabled')
        
        setLogs(prev => [
          `[${new Date().toISOString()}] SYSTEM.PROFILE: Loaded profile for user: ${data.name || data.email}`,
          ...prev
        ])
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoadingProfile(false)
      }
    }

    loadProfile()
    
    // Add boot logs
    setLogs(prev => [
      `[${new Date().toISOString()}] COORDINATOR: Listening for incoming academic prompts...`,
      `[${new Date().toISOString()}] SYSTEM.AUTH: Session token verified. Clearance: LEVEL_01_SECURE.`,
      `[${new Date().toISOString()}] SYSTEM.BOOT: Core initialized successfully.`,
      ...prev
    ])
  }, [navigate])

  // Poll Ollama status
  useEffect(() => {
    async function checkOllama() {
      try {
        const res = await getOllamaStatus()
        setOllamaOnline(res.status === 'ONLINE')
      } catch (err) {
        setOllamaOnline(false)
      }
    }
    checkOllama()
    const t = setInterval(checkOllama, 10000)
    return () => clearInterval(t)
  }, [])

  function handleLogout() {
    localStorage.removeItem('maaos_token')
    addToast('Logged out successfully.', 'info')
    navigate('/login')
  }

  function triggerSelfTest() {
    const newLog = `[${new Date().toISOString()}] SELF_TEST: Checking API connectivity... OK. Latency: stable.`
    setLogs(prev => [newLog, ...prev])
    addToast('Self-test completed successfully.', 'success')
  }

  // Profile / Settings updates
  async function handleSaveSettings(e) {
    e.preventDefault()
    try {
      const updated = await updateProfile({
        name: nameField,
        academic_preferences: academicPref,
        notification_preferences: notifPref ? 'enabled' : 'disabled'
      })
      setProfile(updated)
      addToast('Settings updated successfully.', 'success')
      setLogs(prev => [`[${new Date().toISOString()}] SYSTEM.SETTINGS: Updated profile settings.`, ...prev])
    } catch (err) {
      addToast(err.message || 'Failed to save settings.', 'error')
    }
  }

  // LLM Toggle
  async function handleLlmToggle(provider) {
    try {
      const updated = await updateProfile({ llm_provider: provider })
      setProfile(updated)
      addToast(`LLM router configured to ${provider.toUpperCase()}`, 'success')
      setLogs(prev => [`[${new Date().toISOString()}] ROUTER.CONFIG: Changed model routing to ${provider.toUpperCase()}`, ...prev])
      
      if (provider === 'local' && !ollamaOnline) {
        addToast('Ollama is currently offline. Requests will fallback to Cloud LLM.', 'warning')
      }
    } catch (err) {
      addToast('Failed to switch LLM provider.', 'error')
    }
  }

  // Test LLM prompt router
  async function handleTestPrompt(e) {
    e.preventDefault()
    if (!promptText.trim()) return
    setPromptLoading(true)
    setPromptResponse('')
    try {
      setLogs(prev => [`[${new Date().toISOString()}] HYBRID_ROUTER: Directing prompt to ${profile.llm_provider.toUpperCase()}`, ...prev])
      const res = await testLLMPrompt(promptText)
      setPromptResponse(res.response)
      if (res.warning) {
        addToast(res.warning, 'warning')
        setLogs(prev => [`[${new Date().toISOString()}] HYBRID_ROUTER: Warning - ${res.warning}`, ...prev])
      } else {
        addToast(`Prompt processed via ${res.provider} LLM`, 'success')
      }
      setLogs(prev => [`[${new Date().toISOString()}] HYBRID_ROUTER: Prompt processed successfully.`, ...prev])
    } catch (err) {
      addToast(err.message || 'AI request failed.', 'error')
    } finally {
      setPromptLoading(false)
    }
  }

  // Simulate other agents producing reminders
  function simulateReminderAgent() {
    const alerts = [
      { msg: 'Reminder Agent: Assignment "Lab 4 — Vector DBs" due in 24 hours!', type: 'warning' },
      { msg: 'Email Agent: Extracted exam schedule from syllabus in Prof. Jack email.', type: 'info' },
      { msg: 'Priority Agent: Academic workload status escalated to HIGH.', type: 'warning' },
      { msg: 'Analytics Agent: Weekly study digest report has been compiled.', type: 'success' }
    ]
    const chosen = alerts[Math.floor(Math.random() * alerts.length)]
    addToast(chosen.msg, chosen.type)
    setLogs(prev => [`[${new Date().toISOString()}] AGENT_ALERT: ${chosen.msg}`, ...prev])
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper bg-grid">
      <TopStrip 
        protocolLabel="SYSTEM_CLEARANCE: LEVEL_01_SECURE" 
        reqId={`SESSION_ID: 0x${user?.id ? user.id.substring(0, 6).toUpperCase() : 'UNKNOWN'}`} 
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Block */}
        <div className="corner-frame border border-ink/20 bg-paper p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-mono font-bold text-2xl tracking-tight">MAAOS KERNEL</h1>
            <p className="font-mono text-[11px] text-ink/50 mt-1">
              MULTI-AGENT ACADEMIC OPERATING SYSTEM // CORE V1.0.4
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={triggerSelfTest}
              className="bg-paper border border-ink px-4 py-2 font-mono text-xs font-semibold hover:bg-ink/5 transition-colors"
            >
              RUN SELF-TEST
            </button>
            <button
              onClick={handleLogout}
              className="bg-ink text-paper px-4 py-2 font-mono text-xs font-semibold hover:bg-ink/85 transition-colors"
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* Tab switch navigation */}
        <div className="flex border-b border-ink/10 font-mono text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2.5 border-t border-x -mb-px transition-colors ${
              activeTab === 'overview'
                ? 'border-ink/20 border-b-paper bg-paper font-bold'
                : 'border-transparent text-ink/40 hover:text-ink hover:bg-ink/[0.02]'
            }`}
          >
            [ OVERVIEW ]
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2.5 border-t border-x -mb-px transition-colors ${
              activeTab === 'settings'
                ? 'border-ink/20 border-b-paper bg-paper font-bold'
                : 'border-transparent text-ink/40 hover:text-ink hover:bg-ink/[0.02]'
            }`}
          >
            [ SYSTEM SETTINGS ]
          </button>
        </div>

        {activeTab === 'overview' ? (
          /* Dashboard overview tab */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left panel: Info & Agent Modules */}
            <div className="md:col-span-2 space-y-6">
              <div className="corner-frame border border-ink/20 bg-paper p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-ink/10 pb-2">
                  <h2 className="font-mono font-bold text-sm tracking-wider">
                    CORE SYSTEM AGENTS
                  </h2>
                  <button
                    onClick={simulateReminderAgent}
                    className="border border-ink/30 px-3 py-1 font-mono text-[10px] font-semibold hover:bg-ink/5 transition-colors"
                  >
                    TRIGGER AGENT ALERT
                  </button>
                </div>
                
                <div className="space-y-3">
                  {modules.map((m) => (
                    <div key={m.id} className="border border-ink/10 p-3 hover:bg-ink/[0.02] transition-colors flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-ink">{m.name}</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 border border-green-600 text-green-600 bg-green-50">
                            {m.status}
                          </span>
                        </div>
                        <p className="font-mono text-[10px] text-ink/60 mt-1">{m.desc}</p>
                      </div>
                      <button 
                        disabled
                        className="font-mono text-[10px] border border-ink/10 px-2.5 py-1 opacity-50 cursor-default"
                      >
                        RUNNING
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel: System Telemetry & Logs */}
            <div className="space-y-6">
              {/* Session Info */}
              <div className="corner-frame border border-ink/20 bg-paper p-6 space-y-3">
                <h2 className="font-mono font-bold text-sm border-b border-ink/10 pb-2 tracking-wider">
                  SESSION TELEMETRY
                </h2>
                <div className="font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-ink/50">OPERATOR:</span>
                    <span className="font-bold uppercase">{loadingProfile ? 'LOADING...' : profile.name || profile.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50">CLEARANCE:</span>
                    <span className="text-emerald-700 font-semibold">LEVEL_01_SECURE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50">AI ROUTER:</span>
                    <span className="font-bold text-indigo-700 uppercase">
                      {profile.llm_provider === 'local' ? 'LOCAL (OLLAMA)' : 'CLOUD (LITELLM)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink/50">OLLAMA STATUS:</span>
                    <span className={`font-semibold ${ollamaOnline ? 'text-green-700' : 'text-red-700'}`}>
                      {ollamaOnline === null ? 'TESTING...' : ollamaOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Console Logs */}
              <div className="corner-frame border border-ink/20 bg-paper p-6 space-y-3 flex flex-col h-[280px]">
                <h2 className="font-mono font-bold text-sm border-b border-ink/10 pb-2 tracking-wider">
                  SYSTEM CONSOLE
                </h2>
                <div className="flex-1 bg-ink text-paper font-mono text-[10px] p-3 overflow-y-auto space-y-1.5 rounded">
                  {logs.length === 0 && <p className="text-paper/40">No logs generated.</p>}
                  {logs.map((log, index) => (
                    <p key={index} className="leading-relaxed break-all">{log}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* System settings tab */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left panel: Profile and Settings Form */}
            <div className="md:col-span-2 space-y-6">
              <div className="corner-frame border border-ink/20 bg-paper p-6 space-y-5">
                <h2 className="font-mono font-bold text-sm border-b border-ink/10 pb-2 tracking-wider">
                  USER PROFILE & PREFERENCES
                </h2>
                
                {loadingProfile ? (
                  <p className="font-mono text-xs">Retrieving secure profile parameters...</p>
                ) : (
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block font-mono text-[10px] tracking-widest text-ink/50">EMAIL ID</label>
                      <input 
                        type="text" 
                        value={profile.email} 
                        disabled 
                        className="w-full border border-ink/15 bg-ink/[0.02] px-3 py-2 font-mono text-xs text-ink/50 cursor-not-allowed outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-mono text-[10px] tracking-widest text-ink/50">STUDENT ID</label>
                        <input 
                          type="text" 
                          value={profile.student_id || 'N/A'} 
                          disabled 
                          className="w-full border border-ink/15 bg-ink/[0.02] px-3 py-2 font-mono text-xs text-ink/50 cursor-not-allowed outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-mono text-[10px] tracking-widest text-ink/50">INSTITUTION</label>
                        <input 
                          type="text" 
                          value={profile.institution || 'N/A'} 
                          disabled 
                          className="w-full border border-ink/15 bg-ink/[0.02] px-3 py-2 font-mono text-xs text-ink/50 cursor-not-allowed outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="name-field" className="block font-mono text-[10px] tracking-widest text-ink/50">FULL OPERATOR NAME</label>
                      <input 
                        id="name-field"
                        type="text" 
                        value={nameField} 
                        onChange={(e) => setNameField(e.target.value)}
                        className="w-full border border-ink/25 bg-paper px-3 py-2 font-mono text-xs outline-none focus:border-ink"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="pref-field" className="block font-mono text-[10px] tracking-widest text-ink/50">ACADEMIC PREFERENCES / MAJOR</label>
                      <textarea 
                        id="pref-field"
                        rows="2"
                        value={academicPref} 
                        onChange={(e) => setAcademicPref(e.target.value)}
                        placeholder="e.g. Computer Science, machine learning specialization, heavy workload study style"
                        className="w-full border border-ink/25 bg-paper px-3 py-2 font-mono text-xs outline-none focus:border-ink resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input 
                        id="toast-notifications"
                        type="checkbox" 
                        checked={notifPref}
                        onChange={(e) => setNotifPref(e.target.checked)}
                        className="border border-ink/25 bg-paper accent-ink w-3.5 h-3.5"
                      />
                      <label htmlFor="toast-notifications" className="font-mono text-xs text-ink/75 select-none">
                        Enable real-time toast agent alerts
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="bg-ink text-paper px-5 py-2.5 font-mono text-xs font-semibold hover:bg-ink/85 transition-colors"
                    >
                      SAVE PROFILE SETTINGS
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right panel: LLM Routing and Prompt Tester */}
            <div className="space-y-6">
              {/* LLM Router Configuration Card */}
              <div className="corner-frame border border-ink/20 bg-paper p-6 space-y-4">
                <h2 className="font-mono font-bold text-sm border-b border-ink/10 pb-2 tracking-wider">
                  HYBRID LLM ROUTER
                </h2>
                
                <div className="space-y-3 font-mono text-xs">
                  <p className="text-ink/60 text-[11px]">
                    Select whether core agent queries are processed locally (offline-resilient) or via Cloud API.
                  </p>
                  
                  {/* Toggle buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLlmToggle('local')}
                      className={`flex-1 py-2 text-center border font-semibold text-xs tracking-wide transition-colors ${
                        profile.llm_provider === 'local'
                          ? 'border-ink bg-ink text-paper'
                          : 'border-ink/20 hover:bg-ink/5'
                      }`}
                    >
                      LOCAL (OLLAMA)
                    </button>
                    <button
                      onClick={() => handleLlmToggle('cloud')}
                      className={`flex-1 py-2 text-center border font-semibold text-xs tracking-wide transition-colors ${
                        profile.llm_provider === 'cloud'
                          ? 'border-ink bg-ink text-paper'
                          : 'border-ink/20 hover:bg-ink/5'
                      }`}
                    >
                      CLOUD (LITELLM)
                    </button>
                  </div>

                  {/* Offline Warning for Ollama */}
                  {profile.llm_provider === 'local' && ollamaOnline === false && (
                    <div className="border border-amber-600 bg-amber-50 text-amber-800 p-3 text-[10px] flex items-start gap-2">
                      <span className="font-bold mt-0.5">⚠</span>
                      <span>Ollama is currently OFFLINE. Requests will automatically fallback to Cloud.</span>
                    </div>
                  )}

                  {/* Status displays */}
                  <div className="border border-ink/10 p-3 space-y-1.5 text-[11px] bg-ink/[0.01]">
                    <div className="flex justify-between">
                      <span className="text-ink/50">ROUTING CHOICE:</span>
                      <span className="font-bold uppercase">{profile.llm_provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink/50">OLLAMA DEPLOYMENT:</span>
                      <span className={ollamaOnline ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                        {ollamaOnline ? 'ONLINE' : 'UNREACHABLE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt router tester */}
              <div className="corner-frame border border-ink/20 bg-paper p-6 space-y-4">
                <h2 className="font-mono font-bold text-sm border-b border-ink/10 pb-2 tracking-wider">
                  TEST ROUTER PROMPT
                </h2>
                
                <form onSubmit={handleTestPrompt} className="space-y-3">
                  <textarea
                    rows="3"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Enter study prompt (e.g. 'Draft email to Prof. Smith')"
                    className="w-full border border-ink/25 bg-paper p-2.5 font-mono text-xs outline-none focus:border-ink resize-none"
                    required
                  />
                  
                  <button
                    type="submit"
                    disabled={promptLoading}
                    className="w-full bg-ink text-paper py-2 font-mono text-xs font-semibold hover:bg-ink/85 disabled:opacity-50 transition-colors"
                  >
                    {promptLoading ? 'QUERYING ROUTER...' : 'EXECUTE AI PROMPT'}
                  </button>
                </form>

                {promptResponse && (
                  <div className="border border-ink/20 bg-ink text-paper p-3 font-mono text-[10px] rounded space-y-1.5">
                    <span className="block font-bold text-[9px] text-paper/50 border-b border-paper/10 pb-1">
                      ROUTER RESULT:
                    </span>
                    <p className="whitespace-pre-line leading-relaxed">{promptResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
