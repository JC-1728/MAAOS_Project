import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, RefreshCw, ShieldCheck, Lock, ArrowRight, AlertCircle, LogOut, Sparkles } from 'lucide-react';

export default function ConnectGmailPage({ userId = 'f864c6bd-7932-4877-b3e3-37fcdf6538d6' }) {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    email: null,
    expires_at: null,
    scopes: []
  });
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch connection status and emails on load
  useEffect(() => {
    fetchStatusAndEmails();
  }, [userId]);

  const fetchStatusAndEmails = async () => {
    setLoading(true);
    try {
      // 1. Check Auth Status
      const statusRes = await fetch(`/auth/google/status?user_id=${userId}`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setConnectionStatus(statusData);

        // 2. Fetch Synced Emails if connected
        if (statusData.connected) {
          const emailsRes = await fetch(`/api/gmail/emails?user_id=${userId}`);
          if (emailsRes.ok) {
            const emailsData = await emailsRes.json();
            setEmails(emailsData);
          }
        }
      }
    } catch (err) {
      console.error('Failed to connect to backend API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Connect Gmail button click
  const handleInitiateOAuth = async () => {
    try {
      const res = await fetch(`/auth/google/login?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        // Redirect to Google OAuth consent page
        window.location.href = data.auth_url;
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to generate OAuth login URL.' });
    }
  };

  // Handle Sync Emails button click
  const handleSyncEmails = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/gmail/sync?user_id=${userId}&max_results=10`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails);
        setMessage({ type: 'success', text: `Successfully synced ${data.synced_count} emails from Gmail!` });
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.detail || 'Failed to sync emails.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error connecting to backend server.' });
    } finally {
      setSyncing(false);
    }
  };

  // Handle Disconnect Account
  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Gmail account?')) return;
    try {
      const res = await fetch(`/auth/google/disconnect?user_id=${userId}`, { method: 'POST' });
      if (res.ok) {
        setConnectionStatus({ connected: false, email: null, expires_at: null, scopes: [] });
        setEmails([]);
        setMessage({ type: 'info', text: 'Gmail account disconnected.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to disconnect account.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] font-sans flex flex-col items-center px-4 py-8">
      {/* Hero Header Section matching Figma Design */}
      <div className="max-w-4xl w-full text-center my-8">
        <div className="inline-block text-[11px] font-mono tracking-widest text-black/50 uppercase border border-black/15 bg-black/5 rounded-full px-3 py-1 mb-4 font-semibold">
          MULTI-AGENT ACADEMIC OPERATING SYSTEM (MAAOS)
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
          Your Inbox Already Knows What's Due. <br />
          <span className="bg-black text-white px-3 py-1 inline-block mt-1 font-extrabold">
            [Now It Tells You.]
          </span>
        </h1>
        <p className="text-sm md:text-base text-black/60 max-w-2xl mx-auto mb-8 font-medium">
          Academic OS reads Gmail via Google OAuth API to extract assignments and summarize into task alerts automatically using LLMs.
        </p>

        {/* Live Status & Connection CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          {!connectionStatus.connected ? (
            <button
              onClick={() => setShowOAuthModal(true)}
              className="bg-[#111111] hover:bg-black text-white font-mono text-sm font-bold px-8 py-4 rounded-md shadow-md flex items-center gap-3 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Mail size={18} />
              CONNECT GMAIL – GET STARTED FREE →
            </button>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleSyncEmails}
                disabled={syncing}
                className="bg-[#111111] hover:bg-black text-white font-mono text-xs font-bold px-6 py-3 rounded-md shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'POLLING GMAIL API...' : 'SYNC GMAIL EMAILS NOW'}
              </button>
              <button
                onClick={handleDisconnect}
                className="border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-mono text-xs font-semibold px-4 py-3 rounded-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Notifications & Alert Banner */}
        {message && (
          <div
            className={`max-w-xl mx-auto p-3.5 mb-6 rounded-md text-xs font-mono flex items-center gap-2 border shadow-xs ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : message.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}
          >
            <AlertCircle size={15} className="shrink-0" />
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Account Integration & Token Security Info Card (NFR3 Showcase) */}
      <div className="max-w-4xl w-full bg-white border border-black/15 rounded-lg p-6 mb-10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-black/10 gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-md ${connectionStatus.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-black/5 text-black/40'}`}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="font-bold text-sm text-[#111]">Gmail Integration Status</div>
              <div className="text-xs font-mono text-black/50">
                {connectionStatus.connected ? `Connected as: ${connectionStatus.email}` : 'Not Connected'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="border border-emerald-300 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded font-semibold flex items-center gap-1">
              <Lock size={12} />
              NFR3: AES-256 ENCRYPTED
            </span>
            <span className={`px-2.5 py-1 rounded font-bold ${connectionStatus.connected ? 'bg-emerald-600 text-white' : 'bg-black/10 text-black/60'}`}>
              {connectionStatus.connected ? 'ACTIVE' : 'DISCONNECTED'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 font-mono text-xs text-black/70">
          <div>
            <span className="text-black/40 block text-[10px] uppercase font-bold">Encrypted Token Storage:</span>
            <span className="font-medium text-[#111]">AES-256 Fernet Ciphertext</span>
          </div>
          <div>
            <span className="text-black/40 block text-[10px] uppercase font-bold">OAuth Scopes Granted:</span>
            <span className="font-medium text-[#111]">gmail.readonly, openid</span>
          </div>
          <div>
            <span className="text-black/40 block text-[10px] uppercase font-bold">Token Expiry:</span>
            <span className="font-medium text-[#111]">
              {connectionStatus.expires_at ? new Date(connectionStatus.expires_at).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Smart Inbox Live Display (Matching Figma Design PDF 2 Page 1) */}
      <div className="max-w-4xl w-full bg-white border border-black/15 rounded-lg p-6 mb-12 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/10">
          <div>
            <div className="text-[10px] font-mono text-black/40 font-bold uppercase tracking-widest">CORE ENGINE - 01</div>
            <h2 className="text-xl font-extrabold tracking-tight">Smart Inbox</h2>
          </div>
          <div className="text-right text-[11px] font-mono text-black/50">
            Gmail intelligence deployed locally.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side: Raw Email Input */}
          <div className="border border-black/10 rounded-md p-4 bg-[#FAF9F6]">
            <div className="text-[10px] font-mono font-bold text-black/50 uppercase mb-3 flex items-center justify-between">
              <span>RAW GMAIL INPUT [BEFORE]</span>
              <span className="text-emerald-700 font-bold">{emails.length} Emails Synced</span>
            </div>
            
            {emails.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-black/40 border border-dashed border-black/20 rounded">
                No synced emails in database. <br />
                Click "SYNC GMAIL EMAILS NOW" above to fetch messages!
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {emails.map((e) => (
                  <div key={e.id} className="p-3 bg-white border border-black/10 rounded-md text-xs">
                    <div className="font-bold text-[#111] truncate">{e.subject}</div>
                    <div className="text-[11px] font-mono text-black/50 truncate">From: {e.sender}</div>
                    <div className="text-[11px] text-black/70 mt-1 line-clamp-2 italic">{e.body_snippet}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Extracted Tasks */}
          <div className="border border-black/10 rounded-md p-4 bg-white">
            <div className="text-[10px] font-mono font-bold text-black/50 uppercase mb-3 flex items-center justify-between">
              <span>EXTRACTED TASKS [AFTER LLM TRIAGE]</span>
              <Sparkles size={13} className="text-amber-500" />
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#FAF9F6] border border-black/10 rounded-md text-xs flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold text-black/40">CS101 FINAL PROJECT</div>
                  <div className="font-bold text-[#111]">Submit preliminary report</div>
                </div>
                <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 rounded font-bold">Due: Fri</span>
              </div>
              <div className="p-3 bg-[#FAF9F6] border border-black/10 rounded-md text-xs flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold text-black/40">ASSIGNMENT 3</div>
                  <div className="font-bold text-[#111]">Review updated rubric</div>
                </div>
                <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 rounded font-bold">Due: Wed</span>
              </div>
              <div className="p-3 bg-[#FAF9F6] border border-black/10 rounded-md text-xs flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono font-bold text-black/40">SEMINAR</div>
                  <div className="font-bold text-[#111]">Attend mandatory session</div>
                </div>
                <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 rounded font-bold">Tomorrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google OAuth Modal (Matching Figma Design PDF 2 Page 9 & 10) */}
      {showOAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-black/20 max-w-lg w-full rounded-lg shadow-2xl overflow-hidden font-sans">
            <div className="px-6 py-3 border-b border-black/10 bg-[#FAF9F6] flex items-center justify-between text-xs font-mono text-black/60">
              <span className="flex items-center gap-1.5 font-bold text-black">
                <Lock size={13} /> SYSTEM.AUTH.OAUTH2
              </span>
              <span>REQ_ID: 0XBF902A</span>
            </div>

            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full border border-black/15 bg-black/5 flex items-center justify-center mx-auto mb-4">
                <Mail size={22} className="text-[#111]" />
              </div>

              <h3 className="text-2xl font-black tracking-tight mb-2">Connect Gmail</h3>
              <p className="text-xs text-black/60 max-w-sm mx-auto mb-6">
                Academic OS requires access to your inbox to execute cross-agent analysis and document indexing protocols.
              </p>

              <div className="border border-black/15 rounded-md p-4 text-left bg-[#FAF9F6] mb-6">
                <div className="text-[10px] font-mono font-bold text-black/40 uppercase mb-2">REQUESTED SCOPES</div>
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">READ: SUBJECT LINES & BODY TEXT</div>
                    <div className="text-[11px] text-black/60">Allows the system to ingest and analyze text content from received messages.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-black/10 pt-3">
                  <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">NO ACCESS: SENDING, DELETING, CONTACTS</div>
                    <div className="text-[11px] text-black/60">Operates strictly in read-only mode. Cannot modify inbox state.</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowOAuthModal(false)}
                  className="px-5 py-2.5 border border-black/20 rounded text-xs font-mono font-semibold hover:bg-black/5 transition-all"
                >
                  DECLINE
                </button>
                <button
                  onClick={() => {
                    setShowOAuthModal(false);
                    handleInitiateOAuth();
                  }}
                  className="px-6 py-2.5 bg-black text-white rounded text-xs font-mono font-bold hover:bg-black/90 transition-all flex items-center gap-2"
                >
                  ALLOW ACCESS <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
