import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * PricingPage — Ann Maria's assigned screen (2 of 2)
 * Matches the "Free while you're a student. Always." mockup:
 * two-card pricing table (₹0 / ₹99) plus an accordion FAQ list.
 */

const freeFeatures = [
  "Gmail inbox scanning & summarization",
  "Task extraction & ranking",
  "Adaptive daily planner",
  "Offline-first local mode",
  "Up to 2 GB note storage",
];

const proFeatures = [
  "Everything in Free, plus:",
  "Unlimited note storage",
  "Priority cloud inference (faster summaries)",
  "Multi-inbox support (2+ Gmail accounts)",
  "Exportable weekly analytics report",
];

const faqs = [
  {
    q: "How is my data kept private?",
    a: "Your emails never leave your local device unless you explicitly opt in to cloud features. The core extraction engine runs locally in your browser using compiled WebAssembly models.",
  },
  {
    q: "Can I disconnect Gmail later?",
    a: "Yes. Revoking access from your Google account settings immediately stops all future scanning. Previously extracted tasks stay in your local storage.",
  },
  {
    q: "Does it work offline?",
    a: "The Free and Pro tiers both include an offline-first local mode that falls back to an on-device model when there's no connection.",
  },
  {
    q: "Is my data used for training?",
    a: "No. Academic OS never uses your inbox content or notes to train any model, on the Free or Pro tier.",
  },
  {
    q: "Can this help with career/placement info?",
    a: "Yes, the Smart Search agent indexes career center and placement emails alongside your coursework so you can search across both.",
  },
];

function FaqRow({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-black/10 py-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-sm font-medium">{item.q}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={"transition-transform duration-200 " + (isOpen ? "rotate-180" : "")}
        />
      </button>
      {isOpen && (
        <p className="text-[13px] text-black/55 mt-3 leading-relaxed max-w-2xl">
          {item.a}
        </p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] font-sans">
      <header className="flex items-center justify-between px-10 py-5 border-b border-black/10">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight text-sm">MAAOS</span>
          <span className="text-[10px] font-mono text-black/50 border border-black/15 rounded px-1.5 py-0.5">
            v1.0.4-stable
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-[11px] font-mono uppercase tracking-wide text-black/50">
          <span className="text-black border-b border-black pb-1">Systems</span>
          <span>Documentation</span>
          <span>Agents</span>
          <span>Registry</span>
        </nav>
        <button className="text-xs font-mono border border-black/15 rounded px-3 py-1.5 hover:bg-black/5 transition-colors">
          Get Started
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-10 py-16">
        {/* Pricing */}
        <section className="mb-20">
          <p className="text-center text-[10px] font-mono uppercase tracking-widest text-black/40 mb-2">
            Pricing
          </p>
          <h1 className="text-center text-3xl font-bold tracking-tight mb-2">
            Free while you're a student. Always.
          </h1>
          <p className="text-center text-sm text-black/50 max-w-md mx-auto mb-10">
            Academic OS is built for students first — the core engine stays free.
            Upgrade only if you want more horsepower.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Free tier */}
            <div className="border border-black/10 rounded-md p-6 bg-white">
              <p className="text-[10px] font-mono uppercase tracking-wide text-black/40 mb-4">
                Student
              </p>
              <div className="text-4xl font-bold mb-1">
                ₹0 <span className="text-sm font-medium text-black/40">/ forever</span>
              </div>
              <ul className="space-y-2.5 my-6">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]">
                    <Check size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full border border-black/20 rounded-md py-2.5 text-sm font-medium hover:bg-black/5 transition-colors">
                Get Started Free
              </button>
            </div>

            {/* Pro tier */}
            <div className="border border-black rounded-md p-6 bg-[#111111] text-white relative">
              <span className="absolute -top-3 right-6 bg-white text-black text-[10px] font-mono uppercase tracking-wide px-2 py-1 rounded">
                Recommended
              </span>
              <p className="text-[10px] font-mono uppercase tracking-wide text-white/40 mb-4">
                Student Pro
              </p>
              <div className="text-4xl font-bold mb-1">
                ₹99 <span className="text-sm font-medium text-white/40">/ month</span>
              </div>
              <ul className="space-y-2.5 my-6">
                {proFeatures.map((f, i) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]">
                    {i === 0 ? (
                      <span className="font-semibold">{f}</span>
                    ) : (
                      <>
                        <Check size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <button className="w-full bg-white text-black rounded-md py-2.5 text-sm font-semibold hover:bg-white/90 transition-colors">
                Upgrade to Pro
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] font-mono text-black/40 mt-4">
            No credit card required for Free tier. Cancel Pro anytime.
          </p>
        </section>

        {/* FAQ */}
        <section>
          <p className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-2">FAQ</p>
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Before you connect your inbox.
          </h2>
          <div>
            {faqs.map((item, i) => (
              <FaqRow
                key={item.q}
                item={item}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-between px-10 py-4 border-t border-black/10 text-[10px] font-mono text-black/40">
        <span>© 2024 ACADEMIC OS KERNEL</span>
        <div className="flex gap-4">
          <span>License</span>
          <span>Technical Specs</span>
          <span>Privacy</span>
        </div>
      </footer>
    </div>
  );
}
