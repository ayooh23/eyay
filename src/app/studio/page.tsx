"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
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
export default function StudioPage() {
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
            {t("studioPage.heroSubtitle")}
          </p>
          <h1
            className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.15] tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            {t("studioPage.heroTitle1")}
            <br />
            <span className="text-white/70">{t("studioPage.heroTitle2")}</span>
          </h1>
          <p className="text-[15px] sm:text-[17px] leading-relaxed text-white/70 max-w-md mx-auto mt-6">
            {t("studioPage.heroDescription")}
          </p>
        </section>

        {/* ─── Pillars (editorial list) ─── */}
        <section className="py-16 border-t border-white/15">
          <div className="flex flex-col gap-14">
            {pillarNums.map((num) => (
              <div key={num}>
                <span className="text-[11px] uppercase tracking-[0.12em] text-white/50">{num}</span>
                <h2 className="text-[20px] sm:text-[22px] font-semibold mt-2 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                  {t(`studioPage.pillars.${num}.title`)}
                </h2>
                <p className="text-[15px] leading-relaxed text-white/70 mt-2 max-w-xl">
                  {t(`studioPage.pillars.${num}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── What we solve (editorial) ─── */}
        <section className="py-16 border-t border-white/15">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-10">
            {t("studioPage.sectionWhatWeSolve")}
          </p>
          <ul className="space-y-8">
            {chatBubbleIndices.map((i) => (
              <li key={i} className="space-y-2">
                <p className="text-[14px] text-white/60 italic">{t(`studioPage.chatBubbles.${i}.problem`)}</p>
                <p className="text-[15px] font-medium">{t(`studioPage.chatBubbles.${i}.solution`)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ─── Pricing & process ─── */}
        <section className="py-16 border-t border-white/15">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-2">
            {t("studioPage.sectionPricing")}
          </p>
          <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-tight mt-2" style={{ letterSpacing: "-0.03em" }}>
            {t("studioPage.pricingHeadline")}
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
                {t(`studioPage.services.${key}.label`)}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-12 sm:gap-16">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">{t("studioPage.from")}</p>
              <p className="text-[3rem] sm:text-[4rem] font-bold leading-none tracking-tight mt-1" style={{ letterSpacing: "-0.04em" }}>
                {formatPrice(animatedPrice)}
                {currentMeta.suffix && (
                  <span className="text-[0.35em] font-normal text-white/60 align-top">{currentMeta.suffix}</span>
                )}
              </p>
              <p className="text-[14px] text-white/60 mt-2">{t("studioPage.projectTime")} {t(`studioPage.services.${activeService}.timeline`)}</p>

              <button
                onClick={() => setShowRationale((s) => !s)}
                className="mt-6 text-[14px] text-white/80 hover:text-white underline underline-offset-2"
              >
                {showRationale ? t("studioPage.hide") : t("studioPage.whyCost")}
              </button>

              {showRationale && (
                <div className="mt-4 p-5 rounded-lg bg-white/10 text-[14px] leading-relaxed text-white/80">
                  {t(`studioPage.services.${activeService}.rationale`)}
                </div>
              )}
            </div>

            <div key={deliverablesKey}>
              <p className="text-[11px] uppercase tracking-[0.12em] text-white/50">{t("studioPage.whatYouGet")}</p>
              <p className="text-[18px] font-semibold mt-2 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                {t(`studioPage.services.${activeService}.tagline`)}
              </p>
              <ul className="mt-5 space-y-3">
                {[0, 1, 2, 3].map((i) => {
                  const text = t(`studioPage.services.${activeService}.deliverables.${i}`)
                  return text ? (
                    <li key={i} className="text-[14px] text-white/75 leading-relaxed pl-4 border-l-2 border-white/30">
                      {text}
                    </li>
                  ) : null
                })}
              </ul>
              <button
                onClick={() => setContactOpen(true)}
                className="mt-8 px-5 py-3 rounded-full bg-white text-[#0000FF] text-[14px] font-medium hover:bg-white/90 transition-colors"
              >
                {t("studioPage.discussProject")}
              </button>
            </div>
          </div>
        </section>

        {/* ─── Team ─── */}
        <section className="py-16 border-t border-white/15">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-10">
            {t("studioPage.sectionTeam")}
          </p>
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-16">
            {teamKeys.map((member) => (
              <div key={member.key}>
                <span className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-white/15 text-[18px] font-semibold text-white/80">
                  {member.initial}
                </span>
                <p className="mt-3 text-[16px] font-semibold">{member.name}</p>
                <p className="text-[14px] text-white/60">{t(`studioPage.team.${member.key}.role`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Selected builds ─── */}
        <section className="py-16 border-t border-white/15">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 mb-10">
            {t("studioPage.sectionSelectedBuilds")}
          </p>
          <ul className="space-y-6">
            {selectedBuildKeys.map((build) => (
              <li key={build.key} className="group">
                <p className="text-[16px] font-semibold group-hover:text-white/90">{build.name}</p>
                <p className="text-[14px] text-white/60 mt-0.5">{t(`studioPage.selectedBuilds.${build.key}.tag`)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[13px] italic text-white/50 text-center">
            {t("studioPage.moreWorkNda")}
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
            {contactOpen ? t("footer.close") : t("footer.getInTouch")}
          </button>

          <div className="flex justify-center gap-10 mt-10">
            {[
              { value: "2025", label: t("footer.founded") },
              { value: "3", label: t("footer.team") },
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
            {t("studioPage.footerAddress")}
          </p>
        </footer>
      </main>
    </div>
  )
}
