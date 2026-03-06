"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ContactChat } from "@/components/ContactChat"

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
  {
    problem: "Our website doesn't reflect the quality of our business.",
    solution: "Premium site — designed, built, and shipped.",
  },
  {
    problem: "My team wastes hours on repetitive manual work.",
    solution: "Internal tool that automates the workflow.",
  },
  {
    problem: "We need a product but have no tech team.",
    solution: "Full MVP — concept to launch, one team.",
  },
  {
    problem: "We know AI could help but don't know where to start.",
    solution: "One practical AI feature, scoped and shipped.",
  },
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

// ─── Animated counter hook ────────────────────────────────────
function useAnimatedCounter(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const from = 0

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // cubic ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

// ─── CSS keyframes (injected once) ────────────────────────────
const keyframesCSS = `
@keyframes up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes in {
  from { opacity: 0; }
  to { opacity: 1; }
}
`

// ─── Main component ───────────────────────────────────────────
export default function StudioPage() {
  const [dark, setDark] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [activeService, setActiveService] = useState<ServiceKey>("sprint")
  const [showRationale, setShowRationale] = useState(false)
  const [deliverablesKey, setDeliverablesKey] = useState(0)
  const animatedPrice = useAnimatedCounter(services[activeService].priceNum)

  // Read system preference on mount
  useEffect(() => {
    setDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
  }, [])

  const handleServiceSwitch = useCallback((key: ServiceKey) => {
    setActiveService(key)
    setShowRationale(false)
    setDeliverablesKey((k) => k + 1)
  }, [])

  const current = services[activeService]

  // ─── Colors driven by state ──────────────────────────────
  const bg = dark ? "#0a0a0a" : "#f5f5f0"
  const fg = dark ? "#f0f0eb" : "#0a0a0a"
  const muted = dark ? "#525252" : "#888880"
  const border = dark ? "#222222" : "#ddddd5"
  const subtle = dark ? "#161616" : "#eceee8"

  const formatPrice = (num: number) => {
    if (num >= 1000) {
      const k = num / 1000
      return k % 1 === 0 ? `€${k}k` : `€${k.toFixed(1)}k`
    }
    return `€${num}`
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />
      <div
        style={{
          minHeight: "100vh",
          background: bg,
          color: fg,
          fontFamily: "system-ui, -apple-system, sans-serif",
          transition: "background 0.4s, color 0.4s",
        }}
      >
        {/* ─── Fixed Nav ─── */}
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: `1px solid ${border}`,
            background: dark ? "rgba(10,10,10,0.85)" : "rgba(245,245,240,0.85)",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", color: fg }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>eyay</span>
              <span
                style={{
                  width: "2.8ch",
                  borderBottom: "2px dashed #ef4444",
                  marginTop: -2,
                }}
              />
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="/"
              style={{
                fontSize: 13,
                color: muted,
                textDecoration: "none",
                transition: "color 0.3s",
              }}
            >
              &larr; Lab
            </Link>
            <button
              onClick={() => setDark((d) => !d)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: `1px solid ${border}`,
                background: subtle,
                color: muted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                transition: "all 0.3s",
              }}
              aria-label="Toggle dark mode"
            >
              {dark ? "☀" : "●"}
            </button>
            <button
              onClick={() => setContactOpen((o) => !o)}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: bg,
                background: fg,
                border: "none",
                borderRadius: 999,
                padding: "8px 16px",
                cursor: "pointer",
                transition: "opacity 0.3s",
              }}
            >
              {contactOpen ? "Close" : "Get in touch →"}
            </button>
          </div>
        </nav>

        {/* Contact chat overlay */}
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px" }}>
          <ContactChat open={contactOpen} dark={dark} reducedMotion={false} source="studio" />
        </div>

        {/* ─── Section 1: Hero ─── */}
        <section
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "120px 20px 80px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: muted,
              marginBottom: 24,
              animation: "in 0.6s ease both",
            }}
          >
            eyay.studio · Amsterdam
          </p>
          <h1
            style={{
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: 0,
              animation: "up 0.7s ease both",
            }}
          >
            We build with AI.
            <br />
            <span style={{ color: muted }}>Not just about it.</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(15px, 2vw, 18px)",
              lineHeight: 1.6,
              color: muted,
              maxWidth: 560,
              margin: "24px auto 0",
              animation: "up 0.8s ease 0.1s both",
            }}
          >
            A digital product studio in Amsterdam. Three people delivering what used to take ten
            — faster iteration, higher output, senior-level quality.
          </p>
        </section>

        {/* ─── Section 2: Three Pillars ─── */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 80px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              border: `1px solid ${border}`,
              borderRadius: 12,
            }}
          >
            {[
              {
                num: "01",
                title: "AI-Native Workflow",
                desc: "AI accelerates every stage — design, code, iteration, QA. More output, fewer people, faster delivery.",
              },
              {
                num: "02",
                title: "End-to-End Ownership",
                desc: "One team from research to production. No handoffs, no middlemen. The people you meet are the people who build.",
              },
              {
                num: "03",
                title: "Cutting-Edge Stack",
                desc: "Next.js, TypeScript, Tailwind, Vercel, Supabase. Built for performance and maintainability. No legacy from day one.",
              },
            ].map((pillar, i) => (
              <div
                key={pillar.num}
                style={{
                  padding: 32,
                  borderRight: i < 2 ? `1px solid ${border}` : "none",
                  animation: `up 0.6s ease ${0.1 + i * 0.1}s both`,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: muted,
                    letterSpacing: "0.08em",
                  }}
                >
                  {pillar.num}
                </span>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    margin: "12px 0 8px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {pillar.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: muted, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Section 3: What we solve ─── */}
        <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 20px 80px" }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: muted,
              marginBottom: 32,
            }}
          >
            What we solve
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {chatBubbles.map((pair, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  animation: `up 0.5s ease ${0.1 + i * 0.08}s both`,
                }}
              >
                {/* Problem — left */}
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      background: subtle,
                      color: muted,
                      padding: "12px 16px",
                      borderRadius: "18px 18px 18px 4px",
                      fontSize: 14,
                      lineHeight: 1.5,
                      maxWidth: "80%",
                    }}
                  >
                    {pair.problem}
                  </div>
                </div>
                {/* Solution — right */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      background: fg,
                      color: bg,
                      padding: "12px 16px",
                      borderRadius: "18px 18px 4px 18px",
                      fontSize: 14,
                      lineHeight: 1.5,
                      maxWidth: "80%",
                      fontWeight: 500,
                    }}
                  >
                    {pair.solution}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Section 4: Pricing ─── */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 80px" }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: muted,
              marginBottom: 12,
            }}
          >
            Pricing &amp; process
          </p>
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              margin: "0 0 32px",
            }}
          >
            Transparent pricing. Flat fees. No surprises.
          </h2>

          {/* Service tabs */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 40,
            }}
          >
            {serviceKeys.map((key) => (
              <button
                key={key}
                onClick={() => handleServiceSwitch(key)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: `1px solid ${activeService === key ? fg : border}`,
                  background: activeService === key ? fg : "transparent",
                  color: activeService === key ? bg : fg,
                  transition: "all 0.25s",
                }}
              >
                {services[key].label}
              </button>
            ))}
          </div>

          {/* Two-column layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 40,
            }}
          >
            {/* Left: Price */}
            <div>
              <span style={{ fontSize: 12, textTransform: "uppercase", color: muted, letterSpacing: "0.12em" }}>
                From
              </span>
              <div
                style={{
                  fontSize: "clamp(48px, 8vw, 72px)",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  margin: "8px 0",
                }}
              >
                {formatPrice(animatedPrice)}
                {current.suffix && (
                  <span style={{ fontSize: "0.4em", color: muted, fontWeight: 400 }}>
                    {current.suffix}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 14, color: muted, margin: "4px 0 24px" }}>
                Project time: {current.timeline}
              </p>

              <button
                onClick={() => setShowRationale((s) => !s)}
                style={{
                  fontSize: 14,
                  color: fg,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "none",
                  opacity: 0.7,
                  transition: "opacity 0.2s",
                }}
              >
                › {showRationale ? "Hide" : "Why does this cost / take this long?"}
              </button>

              {showRationale && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 20,
                    border: `1px solid ${border}`,
                    borderRadius: 10,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: muted,
                    animation: "in 0.3s ease both",
                  }}
                >
                  {current.rationale}
                </div>
              )}
            </div>

            {/* Right: Deliverables */}
            <div key={deliverablesKey}>
              <span style={{ fontSize: 12, textTransform: "uppercase", color: muted, letterSpacing: "0.12em" }}>
                What you get
              </span>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  margin: "12px 0 20px",
                  letterSpacing: "-0.02em",
                  animation: "up 0.4s ease both",
                }}
              >
                {current.tagline}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
                {current.deliverables.map((item, i) => (
                  <li
                    key={item}
                    style={{
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: muted,
                      padding: "6px 0",
                      paddingLeft: 16,
                      position: "relative",
                      animation: `up 0.4s ease ${0.05 + i * 0.07}s both`,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 6,
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: muted,
                        display: "inline-block",
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setContactOpen(true)}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: bg,
                  background: fg,
                  border: "none",
                  borderRadius: 999,
                  padding: "10px 22px",
                  cursor: "pointer",
                  transition: "opacity 0.3s",
                  animation: "up 0.4s ease 0.35s both",
                }}
              >
                Discuss this project →
              </button>
            </div>
          </div>
        </section>

        {/* ─── Section 5: Team ─── */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 80px" }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: muted,
              marginBottom: 32,
            }}
          >
            The team
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 32,
            }}
          >
            {teamMembers.map((member, i) => (
              <div
                key={member.name}
                style={{
                  textAlign: "center",
                  animation: `up 0.5s ease ${0.1 + i * 0.1}s both`,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: subtle,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: 24,
                    fontWeight: 600,
                    color: muted,
                  }}
                >
                  {member.initial}
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>
                  {member.name}
                </p>
                <p style={{ fontSize: 13, color: muted, margin: 0 }}>{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Section 6: Selected builds ─── */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 80px" }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: muted,
              marginBottom: 32,
            }}
          >
            Selected builds
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              border: `1px solid ${border}`,
              borderRadius: 12,
            }}
          >
            {selectedBuilds.map((build, i) => (
              <SelectedBuildCard
                key={build.name}
                name={build.name}
                tag={build.tag}
                border={border}
                subtle={subtle}
                muted={muted}
                fg={fg}
                isLast={i === selectedBuilds.length - 1}
                index={i}
              />
            ))}
          </div>
          <p
            style={{
              fontSize: 13,
              fontStyle: "italic",
              color: muted,
              marginTop: 20,
              textAlign: "center",
            }}
          >
            More work available on request — some projects are under NDA.
          </p>
        </section>

        {/* ─── Section 7: CTA footer ─── */}
        <section
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "40px 20px 80px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              margin: "0 0 16px",
              animation: "up 0.6s ease both",
            }}
          >
            Your idea from this morning, built today.
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: muted,
              maxWidth: 480,
              margin: "0 auto 28px",
              animation: "up 0.6s ease 0.1s both",
            }}
          >
            Let&apos;s have a 30-minute call. No pitch, no obligation. We&apos;ll figure out if
            there&apos;s a fit.
          </p>
          <button
            onClick={() => setContactOpen(true)}
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: bg,
              background: fg,
              border: "none",
              borderRadius: 999,
              padding: "12px 28px",
              cursor: "pointer",
              transition: "opacity 0.3s",
              animation: "up 0.5s ease 0.2s both",
            }}
          >
            Get in touch →
          </button>

          {/* Facts */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 40,
              marginTop: 40,
            }}
          >
            {[
              { value: "2025", label: "founded" },
              { value: "3", label: "team" },
              { value: "100%", label: "self-initiated" },
            ].map(({ value, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 500 }}>{value}</span>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: muted,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 32, fontSize: 13, color: muted, letterSpacing: "0.12em" }}>
            eyay.studio · Amsterdam, NL
          </p>
        </section>
      </div>
    </>
  )
}

// ─── Selected build card (hover state needs its own component) ──
function SelectedBuildCard({
  name,
  tag,
  border,
  subtle,
  muted,
  fg,
  isLast,
  index,
}: {
  name: string
  tag: string
  border: string
  subtle: string
  muted: string
  fg: string
  isLast: boolean
  index: number
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 24,
        borderRight: isLast ? "none" : `1px solid ${border}`,
        borderBottom: `1px solid ${border}`,
        background: hovered ? subtle : "transparent",
        transition: "background 0.25s",
        cursor: "default",
        animation: `up 0.5s ease ${0.1 + index * 0.08}s both`,
      }}
    >
      <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px", color: fg }}>{name}</p>
      <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.5 }}>{tag}</p>
    </div>
  )
}
