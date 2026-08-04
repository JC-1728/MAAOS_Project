import React, { useState } from 'react';
import ConnectGmailPage from './ConnectGmailPage';
import WeeklyDigestPage from './WeeklyDigestPage';
import PricingPage from './PricingPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('connect'); // 'connect' | 'digest' | 'pricing'
  const [userId, setUserId] = useState('f864c6bd-7932-4877-b3e3-37fcdf6538d6');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      {/* Top Navigation Header matching Figma Aesthetic */}
      <header className="sticky top-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-black/10 px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <span className="font-extrabold tracking-tight text-base text-[#111111]">MAAOS</span>
          <span className="text-[10px] font-mono text-black/50 border border-black/15 bg-black/5 rounded px-2 py-0.5 font-medium">
            v1.0.4-stable
          </span>
        </div>

        {/* View Switcher Navigation Tabs */}
        <nav className="flex items-center bg-black/5 p-1 rounded-lg border border-black/10">
          <button
            onClick={() => setActiveTab('connect')}
            className={`px-4 py-1.5 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'connect'
                ? 'bg-black text-white shadow-xs'
                : 'text-black/60 hover:text-black hover:bg-black/5'
            }`}
          >
            Connect Gmail & Smart Inbox (Ann Maria)
          </button>
          <button
            onClick={() => setActiveTab('digest')}
            className={`px-4 py-1.5 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'digest'
                ? 'bg-black text-white shadow-xs'
                : 'text-black/60 hover:text-black hover:bg-black/5'
            }`}
          >
            Weekly Digest
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-1.5 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-black text-white shadow-xs'
                : 'text-black/60 hover:text-black hover:bg-black/5'
            }`}
          >
            Pricing & Security
          </button>
        </nav>

        {/* User profile identifier control */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-black/40 hidden sm:inline">Active User ID:</span>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="text-xs font-mono bg-white border border-black/15 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-black w-40"
            title="User ID for API requests"
          />
        </div>
      </header>

      {/* Main Display Container */}
      <div className="flex-1">
        {activeTab === 'connect' && <ConnectGmailPage userId={userId} />}
        {activeTab === 'digest' && <WeeklyDigestPage userId={userId} />}
        {activeTab === 'pricing' && <PricingPage />}
      </div>
    </div>
  );
}
