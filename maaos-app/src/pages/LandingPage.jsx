import React, { useState } from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const [emailConnected, setEmailConnected] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-bold text-2xl">
            MAAOS <span className="text-xs bg-black text-white px-2 py-1 ml-2">v1.0</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#systems" className="text-sm font-medium underline">SYSTEMS</a>
            <a href="#docs" className="text-sm font-medium">DOCUMENTATION</a>
            <a href="#agents" className="text-sm font-medium">AGENTS</a>
            <a href="#registry" className="text-sm font-medium">REGISTRY</a>
            <button className="border border-gray-400 px-4 py-2 text-sm font-medium hover:bg-gray-50">
              GET STARTED
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-600 font-mono mb-4">MULTI-AGENT ACADEMIC OPERATING SYSTEM</p>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Your Inbox Already Knows What is Due.
            <br />
            <span className="border-b-4 border-black pb-2">[Now It Tells You.]</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl">
            Academic OS reads Gmail to extract assignments and summarizes into task alerts. Stop hunting for deadlines and start executing.
          </p>
          
          <button
            onClick={() => setEmailConnected(true)}
            className="bg-black text-white px-8 py-3 font-bold text-sm hover:bg-gray-900 flex items-center gap-2 mb-16"
          >
            CONNECT GMAIL - GET STARTED FREE <ChevronRight size={16} />
          </button>

          {/* Stats Row */}
          <div className="grid grid-cols-7 gap-4 text-xs font-mono text-gray-600 border-y border-gray-300 py-6 mb-16">
            <div>
              <div className="text-gray-400">EMAILS SCANNED TODAY</div>
              <div className="text-xl font-bold text-black">34</div>
            </div>
            <div>
              <div className="text-gray-400">TAGS EXTRACTED</div>
              <div className="text-xl font-bold text-black">07</div>
            </div>
            <div>
              <div className="text-gray-400">SUMMARY ENGINE</div>
              <div className="text-xl font-bold text-black">ACTIVE</div>
            </div>
            <div>
              <div className="text-gray-400">DATA POLICY</div>
              <div className="text-xl font-bold text-black">LOCAL</div>
            </div>
            <div className="col-span-3">
              <div className="text-gray-400">LOCAL-FIRST</div>
              <div className="text-lg font-bold text-black">IndexedDB + Service Worker</div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Inbox Section */}
      <section className="px-8 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-8">
            {/* Email List */}
            <div>
              <p className="text-xs font-mono text-gray-500 mb-4">RAW INPUT [ENTRIES]</p>
              <div className="border border-gray-300 rounded p-6 space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">From: Prof. Smith | Re: CS101 Final Project details...</p>
                </div>
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">From: TA Johnson | Grading rubric updated for assignment 4...</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">From: Dept Chair | Reminder: mandatory seminar tomorrow...</p>
                </div>
              </div>
            </div>

            {/* Extracted Tasks */}
            <div>
              <p className="text-xs font-mono text-gray-500 mb-4">EXTRACTED TASKS [ACTIVE]</p>
              <div className="border border-gray-300 rounded p-6 space-y-4">
                <div className="pb-4 border-b border-gray-200">
                  <p className="font-bold text-sm">CS01 FINAL PROJECT</p>
                  <p className="text-xs text-gray-600">Submit preliminary report</p>
                  <p className="text-xs font-mono text-gray-500 mt-1">Due: Fri</p>
                </div>
                <div className="pb-4 border-b border-gray-200">
                  <p className="font-bold text-sm">ASSIGNMENT 4</p>
                  <p className="text-xs text-gray-600">Review updated rubric</p>
                  <p className="text-xs font-mono text-gray-500 mt-1">Due: Wed</p>
                </div>
                <div>
                  <p className="font-bold text-sm">SEMINAR</p>
                  <p className="text-xs text-gray-600">Attend mandatory session</p>
                  <p className="text-xs font-mono text-gray-500 mt-1">Tomorrow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 mt-6 max-w-2xl">
            Gmail intelligence deployed locally. We extract actionable tasks from unstructured syllabus emails.
          </p>
        </div>
      </section>

      {/* Supporting Agents Grid */}
      <section className="px-8 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-mono text-gray-500 mb-8">SUPPORTING AGENTS</p>
          <div className="grid grid-cols-2 gap-8">
            {/* Agent 1: Burnout Protection */}
            <div className="border border-gray-300 rounded p-8 bg-white hover:shadow-md transition">
              <div className="text-3xl mb-4">Shield</div>
              <h3 className="font-bold text-lg mb-2">Burnout Protection</h3>
              <p className="text-sm text-gray-600">Load balancing across cognitive tasks.</p>
              <p className="text-xs font-mono text-gray-400 mt-4">[AI]</p>
            </div>

            {/* Agent 2: Adaptive Planner */}
            <div className="border border-gray-300 rounded p-8 bg-white hover:shadow-md transition">
              <div className="text-3xl mb-4">Calendar</div>
              <h3 className="font-bold text-lg mb-2">Adaptive Planner</h3>
              <p className="text-sm text-gray-600">Dynamic rescheduling based on pace.</p>
              <p className="text-xs font-mono text-gray-400 mt-4">[AI]</p>
            </div>

            {/* Agent 3: Smart Search */}
            <div className="border border-gray-300 rounded p-8 bg-white hover:shadow-md transition">
              <div className="text-3xl mb-4">Search</div>
              <h3 className="font-bold text-lg mb-2">Smart Search</h3>
              <p className="text-sm text-gray-600">Vectorized search across all documents.</p>
              <p className="text-xs font-mono text-gray-400 mt-4">[RL]</p>
            </div>

            {/* Agent 4: Offline Resilience */}
            <div className="border border-gray-300 rounded p-8 bg-white hover:shadow-md transition">
              <div className="text-3xl mb-4">Wifi</div>
              <h3 className="font-bold text-lg mb-2">Offline Resilience</h3>
              <p className="text-sm text-gray-600">Local LLM fallback for uninterrupted flow.</p>
              <p className="text-xs font-mono text-gray-400 mt-4">[RL]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-8 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-12">It is already saving inboxes.</h2>
          <div className="space-y-6">
            {[
              {
                quote: "Caught an assignment I would have missed completely - it was buried under 40 other unread emails.",
                author: 'S. Reina, M.Tech CSE',
                metric: '14.3 HRS CSE'
              },
              {
                quote: "I dropped opening Gmail every hour just to check. Academic OS tells me what matters once a day.",
                author: 'S. Thomal, RIA',
                metric: '1200+ per month'
              },
              {
                quote: "Placement drive registration closed in 48 hours and I only knew because of the alert.",
                author: 'P. Krishnan, RIA',
                metric: '2 OFFERS, RIA'
              }
            ].map((testimonial, i) => (
              <div key={i} className="border-b border-gray-200 pb-6 grid grid-cols-3 gap-8">
                <div className="col-span-2">
                  <p className="text-sm font-mono text-gray-700 mb-2">{testimonial.quote}</p>
                  <p className="text-xs text-gray-500">- {testimonial.author}</p>
                </div>
                <div className="text-right text-xs font-bold text-gray-600">
                  {testimonial.metric}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-8 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Free while you are a student. Always.</h2>
          <p className="text-sm text-gray-600 mb-12">
            Academic OS is built for students first - the core single-user plan. Upgrade only if you want more integrations.
          </p>
          <div className="grid grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="border border-gray-300 rounded p-8">
              <div className="text-3xl font-bold mb-2">Free</div>
              <p className="text-sm text-gray-600 mb-6">Forever</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Gmail scanning and summarization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Task extraction and ranking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Adaptive daily planner
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Offline-mode local sync
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Up to 5 GB max storage
                </li>
              </ul>
              <button className="w-full mt-8 border border-black px-4 py-3 font-bold text-sm hover:bg-black hover:text-white transition">
                GET STARTED FREE
              </button>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-black rounded p-8 relative">
              <div className="absolute -top-3 right-4 bg-black text-white px-3 py-1 text-xs font-bold">
                RECOMMENDED
              </div>
              <div className="text-3xl font-bold mb-2">Pro</div>
              <p className="text-sm text-gray-600 mb-6">Monthly</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Everything in free plan
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Unlimited storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Multi-device sync support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Multi-inbox support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} /> Expanded analytics report
                </li>
              </ul>
              <button className="w-full mt-8 bg-black text-white px-4 py-3 font-bold text-sm hover:bg-gray-900 transition">
                UPGRADE TO PRO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-8 py-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-12">Before you connect your inbox.</h2>
          <div className="space-y-6">
            {[
              { q: 'Can Academic OS read my private emails?', a: 'No. We scan only academic forwarding labels you select. This uses on-device hashing.' },
              { q: 'Is this directly my university system?', a: 'No. We integrate Gmail every hour to check. Academic OS tells you what matters once a day.' },
              { q: 'What happens if a deadline expires?', a: 'Placement drive registration closed in 48 hours and we only knew because of the alert.' },
              { q: 'Does it work with Outlook or Canvas?', a: 'Canvas integration is on the roadmap. Outlook support is community-led via GitHub discussions.' }
            ].map((faq, i) => (
              <div key={i} className="border-b border-gray-200 pb-6">
                <p className="font-bold text-sm mb-2">{faq.q}</p>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-8 py-8 text-xs text-gray-600">
        <div className="max-w-6xl mx-auto flex justify-between">
          <div>© 2024 ACADEMIC OS KERNEL</div>
          <div className="flex gap-6">
            <a href="#license" className="hover:underline">License</a>
            <a href="#specs" className="hover:underline">Technical Specs</a>
            <a href="#privacy" className="hover:underline">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}