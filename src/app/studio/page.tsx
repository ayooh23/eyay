"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ContactChat } from "@/components/ContactChat"
import { Cursor } from "@/components/Cursor"
import { useLocale } from "@/contexts/LocaleContext"

// ─── Types ────────────────────────────────────────────────────
type ServiceKey = "sprint" | "build" | "ai" | "retainer"

interface ServiceData {
  label: string
  price: string
  priceNum: number
  suffix: string
  timeline: string
  tagline: string
  deliverables: string[]
  rationale: string
}

// ─── Data ─────────────────────────────────────────────────────
const services: Record<ServiceKey, ServiceData> = {
  sprint: {
    label: "Design Sprint",
    price: "2.5k",
    priceNum: 2500,
    suffix: "",
    timeline: "2–3 weeks",
    tagline: "Research to prototype. No deck, no fluff.",
    deliverables: [
      "UX audit of existing product or brief",
      "Redesign proposal with rationale",
      "Interactive prototype (Figma or live)",
      "Handoff-ready for development",
    ],
    rationale:
      "Most studios take 6 weeks to deliver a prototype — half that time is internal reviews, junior revisions, and slide decks. We take 2–3 weeks because AI compresses research synthesis, copy variants, and iteration loops that used to eat entire sprints. You get a senior designer's full attention and a production-ready prototype. One flat fee. No surprises.",
  },
  build: {
    label: "Build & Launch",
    price: "8k+",
    priceNum: 8000,
    suffix: "+",
    timeline: "4–12 weeks",
    tagline: "From concept to shipped product. End to end.",
    deliverables: [
      "Full UX/UI design system",
      "Production-grade development (Next.js, TypeScript)",
      "Deployed and live on your infrastructure",
      "One team from first call to launch — no handoffs",
    ],
    rationale:
      "A full agency charges €30k+ and takes a quarter. We charge a fraction of that and ship in weeks — because we've removed the overhead: no account managers, no handoffs, no legacy process. AI handles what used to require three junior developers. You pay for the outcome, not our calendar. Flat fee. No scope creep.",
  },
  ai: {
    label: "AI Feature",
    price: "3k",
    priceNum: 3000,
    suffix: "",
    timeline: "2–4 weeks",
    tagline: "One real AI feature. Scoped tight, shipped fast.",
    deliverables: [
      "Scoping session — what to build and why",
      "One production-ready AI feature in your product",
      "Integration with your existing stack",
      "Documentation and handoff",
    ],
    rationale:
      "Most 'AI integrations' are wrappers with a chatbot. We scope and ship a feature that actually changes how your product works — automated reporting, smart search, a workflow that replaces manual hours. We know what AI is genuinely good at and what it isn't. You get practical output, not a proof of concept.",
  },
  retainer: {
    label: "Retainer",
    price: "2k/mo",
    priceNum: 2000,
    suffix: "/mo",
    timeline: "Ongoing",
    tagline: "Ongoing senior support. No retainer bloat.",
    deliverables: [
      "Flexible monthly design and development scope",
      "Priority response and direct access to the team",
      "Weekly check-in, async or call",
      "Scales up when you need it, honest when you don't",
    ],
    rationale:
      "Most retainers are padded with hours that don't move the needle. Ours aren't. We work fast because of how we're built — AI compresses the repetitive work, so every hour goes into things that actually matter. You get senior-level output without senior-agency overhead. Cancel anytime.",
  },
}

const serviceKeys: ServiceKey[] = ["sprint", "build", "ai", "retainer"]

const chatBubbles = [
  { problem: "Our website doesn't reflect the quality of our business.", solution: "Premium site — designed, built, and shipped." },
  { problem: "My team wastes hours on repetitive manual work.", solution: "Internal tool that automates the workflow." },
  { problem: "We need a product but have no tech team.", solution: "Full MVP — concept to launch, one team." },
  { problem: "We know AI could help but don't know where to start.", solution: "One practical AI feature, scoped and shipped." },
]

const teamMembers = [
  { name: "Ayu Koene", role: "Design & Strategy", initial: "A" },
  { name: "Sinyo Koene", role: "Development & AI", initial: "S" },
  { name: "Alexander Koene", role: "Senior Advisor", initial: "A" },
]

const selectedBuilds = [
  { name: "d+o", tag: "Emergency care platform · OLVG Amsterdam" },
  { name: "BR-ND People", tag: "Brand website with motion storytelling" },
  { name: "Van Vulpen", tag: "Culture film · 1,300 employees" },
  { name: "23plusone", tag: "Happiness scan · digital assessment product" },
]

const pillars = [
  { num: "01", title: "AI-Native Workflow", desc: "AI accelerates every stage — design, code, iteration, QA. More output, fewer people, faster delivery." },
  { num: "02", title: "End-to-End Ownership", desc: "One team from research to production. No handoffs, no middlemen. The people you meet are the people who build." },
  { num: "03", title: "Cutting-Edge Stack", desc: "Next.js, TypeScript, Tailwind, Vercel, Supabase. Built for performance and maintainability. No legacy from day one." },
]

// ─── Theme (sync with home) ───────────────────────────────────
const THEME_KEY = "eyay-dark"

function getInitialDark(): boolean {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === "true") return true
  if (stored === "false") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

// ─── Animated counter ──────────────────────────────────────────
function useAnimatedCounter(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const from = 0
    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

// ─── Main ──────────────────────────────────────────────────────
export default function StudioPage() {
  const [dark, setDark] = useState(false)
  const [themeReady, setThemeReady] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [activeService, setActiveService] = useState<ServiceKey>("sprint")
  const [showRationale, setShowRationale] = useState(false)
  const [deliverablesKey, setDeliverablesKey] = useState(0)
  const { locale, setLocale, t } = useLocale()
  const animatedPrice = useAnimatedCounter(services[activeService].priceNum)

  useEffect(() => {
    setDark(getInitialDark())
    setThemeReady(true)
  }, [])

  useEffect(() => {
    setIsDesktop(window.matchMedia("(pointer: fine)").matches)
  }, [])

  const handleToggleDark = useCallback(() => {
    setDark((d) => {
      const next = !d
      if (typeof window !== "undefined") localStorage.setItem(THEME_KEY, String(next))
      return next
    })
  }, [])

  const handleServiceSwitch = useCallback((key: ServiceKey) => {
    setActiveService(key)
    setShowRationale(false)
    setDeliverablesKey((k) => k + 1)
  }, [])

  const current = services[activeService]

  const formatPrice = (num: number) => {
    if (num >= 1000) {
      const k = num / 1000
      return k % 1 === 0 ? `€${k}k` : `€${k.toFixed(1)}k`
    }
    return `€${num}`
  }

  if (!themeReady) {
    return (
      <div className="min-h-screen bg-[#0000FF]" aria-hidden="true" />
    )
  }

  return (
    <div
      className={`min-h-screen bg-[#0000FF] text-white transition-colors duration-500 ${
        isDesktop ? "cursor-none" : ""
      }`}
    >
      {isDesktop && <Cursor dark={true} />}
      {/* ─── Fixed header (match home) ─── */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4">
        <div className="flex flex-col items-start">
          <Link href="/" className="text-[18px] font-bold tracking-tight text-white hover:opacity-90">
            eyay
          </Link>
          <span
            className="border-b-2 border-dashed border-red-500 -mt-0.5"
            style={{ width: "2.8ch" }}
          />
        </div>
        <Link
          href="/"
          className="text-[11px] uppercase font-medium tracking-widest text-white/70 hover:text-white transition-colors duration-300"
        >
          {t("lab")}
        </Link>
      </header>

      {/* ─── Bottom toggles (match home) ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-4 px-5 py-4">
        <button
          onClick={handleToggleDark}
          className="flex items-center justify-center rounded-full w-9 h-9 bg-white/15 text-white hover:bg-white/25 transition-colors duration-300"
          aria-label="Toggle dark mode"
        >
          {dark ? "☀" : "●"}
        </button>
        <div className="flex items-center rounded-full text-[12px] font-medium bg-white/15 text-white/80">
          <button
            onClick={() => setLocale("en")}
            className={`px-3 py-2 rounded-full transition-colors duration-200 ${locale === "en" ? "text-white bg-white/25" : ""}`}
          >
            EN
          </button>
          <button
            onClick={() => setLocale("nl")}
            className={`px-3 py-2 rounded-full transition-colors duration-200 ${locale === "nl" ? "text-white bg-white/25" : ""}`}
          >
            NL
          </button>
        </div>
      </div>

      <main className="pt-24 pb-28 px-5 max-w-3xl mx-auto">
        {/* Contact chat */}
        <div className="max-w-xl mx-auto">
          <ContactChat open={contactOpen} dark={true} reducedMotion={false} source="studio" />
        </div>

        {/* ─── Hero ─── */}
        <section className="pt-16 pb-20 text-center">
          <p
            className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-6"
            style={{ letterSpacing: "0.2em" }}
          >
            eyay.studio · Amsterdam
          </p>
          <h1
            className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.15] tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            We build with AI.
            <br />
            <span className="text-white/70">Not just about it.</span>
          </h1>
          <p className="text-[15px] sm:text-[17px] leading-relaxed text-white/70 max-w-md mx-auto mt-6">
            A digital product studio in Amsterdam. Three people delivering what used to take ten — faster iteration, higher output, senior-level quality.
          </p>
        </section>

        {/* ─── Pillars (editorial list) ─── */}
        <section className="py-16 border-t border-white/15">
          <div className="flex flex-col gap-14">
            {pillars.map((p) => (
              <div key={p.num}>
                <span className="text-[11px] uppercase tracking-[0.12em] text-white/50">{p.num}</span>
                <h2 className="text-[20px] sm:text-[22px] font-semibold mt-2 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                  {p.title}
                </h2>
                <p className="text-[15px] leading-relaxed text-white/70 mt-2 max-w-xl">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── What we solve (editorial) ─── */}
        <section className="py-16 border-t border-white/15">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-10">
            What we solve
          </p>
          <ul className="space-y-8">
            {chatBubbles.map((pair, i) => (
              <li key={i} className="space-y-2">
                <p className="text-[14px] text-white/60 italic">{pair.problem}</p>
                <p className="text-[15px] font-medium">{pair.solution}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ─── Pricing & process ─── */}
        <section className="py-16 border-t border-white/15">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">
            Pricing & process
          </p>
          <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-tight mt-2" style={{ letterSpacing: "-0.03em" }}>
            Transparent pricing. Flat fees. No surprises.
          </h2>

          <div className="flex flex-wrap gap-2 mt-10 mb-10">
            {serviceKeys.map((key) => (
              <button
                key={key}
                onClick={() => handleServiceSwitch(key)}
                className={`px-4 py-2.5 rounded-full text-[14px] font-medium transition-colors duration-200 ${
                  activeService === key
                    ? "bg-white text-[#0000FF]"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {services[key].label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-12 sm:gap-16">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">From</p>
              <p className="text-[3rem] sm:text-[4rem] font-bold leading-none tracking-tight mt-1" style={{ letterSpacing: "-0.04em" }}>
                {formatPrice(animatedPrice)}
                {current.suffix && (
                  <span className="text-[0.35em] font-normal text-white/60 align-top">{current.suffix}</span>
                )}
              </p>
              <p className="text-[14px] text-white/60 mt-2">Project time: {current.timeline}</p>

              <button
                onClick={() => setShowRationale((s) => !s)}
                className="mt-6 text-[14px] text-white/80 hover:text-white underline underline-offset-2"
              >
                {showRationale ? "Hide" : "Why does this cost / take this long?"}
              </button>

              {showRationale && (
                <div className="mt-4 p-5 rounded-lg bg-white/10 text-[14px] leading-relaxed text-white/80">
                  {current.rationale}
                </div>
              )}
            </div>

            <div key={deliverablesKey}>
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">What you get</p>
              <p className="text-[18px] font-semibold mt-2 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                {current.tagline}
              </p>
              <ul className="mt-5 space-y-3">
                {current.deliverables.map((item) => (
                  <li key={item} className="text-[14px] text-white/75 leading-relaxed pl-4 border-l-2 border-white/30">
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setContactOpen(true)}
                className="mt-8 px-5 py-3 rounded-full bg-white text-[#0000FF] text-[14px] font-medium hover:bg-white/90 transition-colors"
              >
                Discuss this project →
              </button>
            </div>
          </div>
        </section>

        {/* ─── Team ─── */}
        <section className="py-16 border-t border-white/15">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-10">
            The team
          </p>
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-16">
            {teamMembers.map((member) => (
              <div key={member.name}>
                <span className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-white/15 text-[18px] font-semibold text-white/80">
                  {member.initial}
                </span>
                <p className="mt-3 text-[16px] font-semibold">{member.name}</p>
                <p className="text-[14px] text-white/60">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Selected builds ─── */}
        <section className="py-16 border-t border-white/15">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-10">
            Selected builds
          </p>
          <ul className="space-y-6">
            {selectedBuilds.map((build) => (
              <li key={build.name} className="group">
                <p className="text-[16px] font-semibold group-hover:text-white/90">{build.name}</p>
                <p className="text-[14px] text-white/60 mt-0.5">{build.tag}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[13px] italic text-white/50 text-center">
            More work available on request — some projects are under NDA.
          </p>
        </section>

        {/* ─── Footer CTA ─── */}
        <footer className="py-20 text-center border-t border-white/15">
          <h2
            className="text-[28px] sm:text-[36px] font-semibold tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            {t("footer.headline")}
          </h2>
          <p className="mt-4 text-[15px] sm:text-[16px] leading-relaxed text-white/70 max-w-xl mx-auto">
            {t("footer.subheadline")}
          </p>
          <button
            onClick={() => setContactOpen(true)}
            className="mt-6 px-6 py-3 rounded-full bg-white text-[#0000FF] text-[15px] font-medium hover:bg-white/90 transition-colors"
          >
            {contactOpen ? "Close" : "Get in touch →"}
          </button>

          <div className="flex justify-center gap-10 mt-10">
            {[
              { value: "2025", label: t("footer.founded") },
              { value: "3", label: "team" },
              { value: "100%", label: t("footer.selfInitiated") },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-[15px] font-medium">{value}</span>
                <span className="text-[11px] uppercase text-white/60" style={{ letterSpacing: "0.12em" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[13px] text-white/50" style={{ letterSpacing: "0.12em" }}>
            eyay.studio · Amsterdam, NL
          </p>
        </footer>
      </main>
    </div>
  )
}
