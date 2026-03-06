"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import ScrambleIn, { ScrambleInHandle } from "@/components/fancy/text/scramble-in"
import { ContactChat } from "@/components/ContactChat"
import { Cursor } from "@/components/Cursor"
import { useLocale } from "@/contexts/LocaleContext"

// ─── Types ────────────────────────────────────────────────────
type ServiceKey = "sprint" | "build" | "ai" | "retainer"

// ─── Data (structure only; copy from locale) ─────────────────
const serviceKeys: ServiceKey[] = ["sprint", "build", "ai", "retainer"]

const serviceMeta: Record<
  ServiceKey,
  { price: string; priceNum: number; suffix: string }
> = {
  sprint: { price: "2.5k", priceNum: 2500, suffix: "" },
  build: { price: "8k+", priceNum: 8000, suffix: "+" },
  ai: { price: "3k", priceNum: 3000, suffix: "" },
  retainer: { price: "2k/mo", priceNum: 2000, suffix: "/mo" },
}

const pillarNums = ["01", "02", "03"] as const
const chatBubbleIndices = [0, 1, 2, 3] as const
const teamKeys = [
  { key: "ayu", name: "Ayu Koene", initial: "A" },
  { key: "sinyo", name: "Sinyo Koene", initial: "S" },
  { key: "alexander", name: "Alexander Koene", initial: "A" },
] as const
const selectedBuildKeys = [
  { key: "do", name: "d+o" },
  { key: "brnd", name: "BR-ND People" },
  { key: "vanvulpen", name: "Van Vulpen" },
  { key: "23plusone", name: "23plusone" },
] as const

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
export default function ServicesPage() {
  const [dark, setDark] = useState(false)
  const [themeReady, setThemeReady] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [activeService, setActiveService] = useState<ServiceKey>("sprint")
  const [showRationale, setShowRationale] = useState(false)
  const [deliverablesKey, setDeliverablesKey] = useState(0)
  const { locale, setLocale, t } = useLocale()
  const animatedPrice = useAnimatedCounter(serviceMeta[activeService].priceNum)
  const currentMeta = serviceMeta[activeService]
  const heroScrambleRef = useRef<ScrambleInHandle>(null)

  useEffect(() => {
    setDark(getInitialDark())
    setThemeReady(true)
  }, [])

  useEffect(() => {
    setIsDesktop(window.matchMedia("(pointer: fine)").matches)
  }, [])

  useEffect(() => {
    if (isDesktop) document.body.classList.add("hide-system-cursor")
    else document.body.classList.remove("hide-system-cursor")
    return () => document.body.classList.remove("hide-system-cursor")
  }, [isDesktop])

  useEffect(() => {
    const t = setTimeout(() => heroScrambleRef.current?.start(), 500)
    return () => clearTimeout(t)
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
          {t("home")}
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

      <main className="pt-24 pb-28 px-5 max-w-4xl mx-auto">
        {/* Contact chat */}
        <div className="max-w-xl mx-auto">
          <ContactChat open={contactOpen} dark={true} reducedMotion={false} source="services" />
        </div>

        {/* ─── Hero (editorial + terminal accent) ─── */}
        <section className="pt-16 pb-24 text-center">
          <p className="font-mono text-[11px] tracking-wider text-white/50 mb-4">
            <span className="text-white/40">$</span>{" "}
            <ScrambleIn
              ref={heroScrambleRef}
              text="eyay --services"
              scrambleSpeed={35}
              autoStart={false}
            />
          </p>
          <p
            className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-6"
            style={{ letterSpacing: "0.2em" }}
          >
            {t("servicesPage.heroSubtitle")}
          </p>
          <h1
            className="text-[clamp(2.25rem,5.5vw,3.5rem)] font-semibold leading-[1.12] tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            {t("servicesPage.heroTitle1")}
            <br />
            <span className="text-white/70">{t("servicesPage.heroTitle2")}</span>
          </h1>
          <p className="text-[16px] sm:text-[18px] leading-[1.65] text-white/70 max-w-lg mx-auto mt-8">
            {t("servicesPage.heroDescription")}
          </p>
        </section>

        {/* ─── Pillars (editorial + line-number style) ─── */}
        <section className="py-20 border-t border-white/15">
          <p className="font-mono text-[11px] text-white/40 mb-12">
            <span className="text-white/30">→</span> pillars
          </p>
          <div className="flex flex-col gap-16">
            {pillarNums.map((num) => (
              <div key={num} className="flex gap-6 sm:gap-8">
                <span className="font-mono text-[12px] text-white/40 tabular-nums shrink-0 pt-0.5">{num}</span>
                <div>
                  <h2 className="text-[21px] sm:text-[24px] font-semibold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                    {t(`servicesPage.pillars.${num}.title`)}
                  </h2>
                  <p className="text-[15px] sm:text-[16px] leading-relaxed text-white/70 mt-3 max-w-xl">
                    {t(`servicesPage.pillars.${num}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── What we solve (editorial) ─── */}
        <section className="py-20 border-t border-white/15">
          <p className="font-mono text-[11px] text-white/40 mb-2">
            <span className="text-white/30">→</span> problems
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-10">
            {t("servicesPage.sectionWhatWeSolve")}
          </p>
          <ul className="space-y-10">
            {chatBubbleIndices.map((i) => (
              <li key={i} className="space-y-2">
                <p className="text-[14px] text-white/55 italic">{t(`servicesPage.chatBubbles.${i}.problem`)}</p>
                <p className="text-[16px] font-medium text-white/90">{t(`servicesPage.chatBubbles.${i}.solution`)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ─── Pricing & process (terminal-style labels) ─── */}
        <section className="py-20 border-t border-white/15">
          <p className="font-mono text-[11px] text-white/40 mb-2">
            <span className="text-white/30">→</span> pricing
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">
            {t("servicesPage.sectionPricing")}
          </p>
          <h2 className="text-[28px] sm:text-[36px] font-semibold tracking-tight mt-2" style={{ letterSpacing: "-0.03em" }}>
            {t("servicesPage.pricingHeadline")}
          </h2>

          <div className="flex flex-wrap gap-2 mt-10 mb-12">
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
                {t(`servicesPage.services.${key}.label`)}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-12 sm:gap-20">
            <div>
              <p className="font-mono text-[11px] text-white/45">{t("servicesPage.from")}</p>
              <p className="text-[3rem] sm:text-[4rem] font-bold leading-none tracking-tight mt-1 font-mono tabular-nums" style={{ letterSpacing: "-0.04em" }}>
                {formatPrice(animatedPrice)}
                {currentMeta.suffix && (
                  <span className="text-[0.35em] font-normal text-white/60 align-top font-sans">{currentMeta.suffix}</span>
                )}
              </p>
              <p className="text-[14px] text-white/60 mt-2 font-mono text-[13px]">
                {t("servicesPage.projectTime")} {t(`servicesPage.services.${activeService}.timeline`)}
              </p>

              <button
                onClick={() => setShowRationale((s) => !s)}
                className="mt-6 text-[13px] text-white/80 hover:text-white underline underline-offset-2 font-mono"
              >
                {showRationale ? t("servicesPage.hide") : t("servicesPage.whyCost")}
              </button>

              {showRationale && (
                <div className="mt-4 p-5 rounded-lg bg-white/10 text-[14px] leading-relaxed text-white/80 border-l-2 border-white/20">
                  {t(`servicesPage.services.${activeService}.rationale`)}
                </div>
              )}
            </div>

            <div key={deliverablesKey}>
              <p className="font-mono text-[11px] text-white/45">{t("servicesPage.whatYouGet")}</p>
              <p className="text-[18px] font-semibold mt-2 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                {t(`servicesPage.services.${activeService}.tagline`)}
              </p>
              <ul className="mt-6 space-y-3">
                {[0, 1, 2, 3].map((i) => {
                  const text = t(`servicesPage.services.${activeService}.deliverables.${i}`)
                  return text ? (
                    <li key={i} className="text-[13px] text-white/75 leading-relaxed pl-4 border-l-2 border-white/25 font-mono">
                      <span className="text-white/50">$</span> {text}
                    </li>
                  ) : null
                })}
              </ul>
              <button
                onClick={() => setContactOpen(true)}
                className="mt-8 px-5 py-3 rounded-full bg-white text-[#0000FF] text-[14px] font-medium hover:bg-white/90 transition-colors"
              >
                {t("servicesPage.discussProject")}
              </button>
            </div>
          </div>
        </section>

        {/* ─── Team ─── */}
        <section className="py-20 border-t border-white/15">
          <p className="font-mono text-[11px] text-white/40 mb-2">
            <span className="text-white/30">→</span> team
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-10">
            {t("servicesPage.sectionTeam")}
          </p>
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-16">
            {teamKeys.map((member) => (
              <div key={member.key}>
                <span className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-white/15 text-[18px] font-semibold text-white/80 font-mono">
                  {member.initial}
                </span>
                <p className="mt-3 text-[16px] font-semibold">{member.name}</p>
                <p className="text-[13px] text-white/60 font-mono">{t(`servicesPage.team.${member.key}.role`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Selected builds ─── */}
        <section className="py-20 border-t border-white/15">
          <p className="font-mono text-[11px] text-white/40 mb-2">
            <span className="text-white/30">→</span> builds
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-10">
            {t("servicesPage.sectionSelectedBuilds")}
          </p>
          <ul className="space-y-6">
            {selectedBuildKeys.map((build) => (
              <li key={build.key} className="group flex gap-3">
                <span className="font-mono text-[12px] text-white/40 shrink-0">./</span>
                <div>
                  <p className="text-[16px] font-semibold group-hover:text-white/90">{build.name}</p>
                  <p className="text-[14px] text-white/60 mt-0.5">{t(`servicesPage.selectedBuilds.${build.key}.tag`)}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-[13px] italic text-white/50 text-center">
            {t("servicesPage.moreWorkNda")}
          </p>
        </section>

        {/* ─── Footer CTA ─── */}
        <footer className="py-24 text-center border-t border-white/15">
          <p className="font-mono text-[11px] text-white/40 mb-6">
            <span className="text-white/30">→</span> get in touch
          </p>
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
            {contactOpen ? t("footer.close") : t("footer.getInTouch")}
          </button>

          <div className="flex justify-center gap-10 mt-12">
            {[
              { value: "2025", label: t("footer.founded") },
              { value: "3", label: t("footer.team") },
              { value: "100%", label: t("footer.selfInitiated") },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-[15px] font-medium font-mono tabular-nums">{value}</span>
                <span className="text-[11px] uppercase text-white/60 font-mono" style={{ letterSpacing: "0.12em" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[13px] text-white/50 font-mono" style={{ letterSpacing: "0.08em" }}>
            {t("servicesPage.footerAddress")}
          </p>
        </footer>
      </main>
    </div>
  )
}
