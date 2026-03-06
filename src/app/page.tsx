"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import gsap from "gsap"
import Link from "next/link"
import { Cursor } from "@/components/Cursor"
import { TypingIndicator } from "@/components/TypingIndicator"
import { MessageBubble } from "@/components/MessageBubble"
import { ProjectCard } from "@/components/ProjectCard"
import { getGalleryItems } from "@/data/projects"
import { ContactChat } from "@/components/ContactChat"
import { useLocale } from "@/contexts/LocaleContext"

// ─── Chat timeline data ──────────────────────────────────────
function buildMessages() {
  return [
    { id: 1, sender: "sinyo" as const, time: "01:23" },
    { id: 2, sender: "ayu" as const, time: "06:46" },
    { id: 3, sender: "sinyo" as const, time: "11:18" },
  ]
}

// Timeline events driving the iMessage sequence
const timeline = [
  { type: "typing", sender: "sinyo", at: 800 },
  { type: "message", id: 1, at: 2000 },
  { type: "typing", sender: "ayu", at: 2800 },
  { type: "message", id: 2, at: 4000 },
  { type: "read", id: 2, at: 4400 },
  { type: "typing", sender: "sinyo", at: 4800 },
  { type: "message", id: 3, at: 6000 },
  { type: "read", id: 3, at: 6400 },
  { type: "gallery", at: 7200 },
]

// ─── Loader ──────────────────────────────────────────────────
function Loader({
  dark,
  suffix,
  onDone,
  reducedMotion,
}: {
  dark: boolean
  suffix: string
  onDone: () => void
  reducedMotion: boolean
}) {
  const loaderRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const prompt = "➜  eyay: "

  useEffect(() => {
    if (reducedMotion) {
      if (textRef.current) textRef.current.textContent = suffix
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }

    let i = 0
    const interval = setInterval(() => {
      if (textRef.current) {
        textRef.current.textContent = suffix.slice(0, i + 1)
      }
      i++
      if (i >= suffix.length) {
        clearInterval(interval)
        setTimeout(onDone, 1200)
      }
    }, 55)

    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        opacity: 0,
        repeat: -1,
        yoyo: true,
        duration: 0.5,
        ease: "steps(1)",
      })
    }

    return () => clearInterval(interval)
  }, [onDone, reducedMotion, suffix])

  return (
    <div
      ref={loaderRef}
      data-loader
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        dark ? "bg-neutral-950" : "bg-neutral-100"
      }`}
      style={{ clipPath: "inset(0 0 0 0)" }}
    >
      {/* Terminal content only */}
      <div
        className={`px-4 py-4 font-mono text-[14px] sm:text-[15px] ${
          dark ? "text-neutral-500" : "text-neutral-400"
        }`}
      >
        <span className="text-[#0000FF]">
          {prompt}
        </span>
        <span ref={textRef} className="tabular-nums" />
        <span
          ref={cursorRef}
          className="inline-block w-2.5 h-4 ml-0.5 align-middle bg-[#0000FF]"
          style={{ verticalAlign: "text-bottom" }}
        />
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────
const THEME_KEY = "eyay-dark"
const VISITED_KEY = "eyay-visited"

function getInitialDark(): boolean {
  if (typeof window === "undefined") return false
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === "true") return true
  if (stored === "false") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function isReturnVisit(): boolean {
  if (typeof window === "undefined") return false
  return !!sessionStorage.getItem(VISITED_KEY)
}

export default function Home() {
  const [dark, setDark] = useState(false)
  const [themeReady, setThemeReady] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [phase, setPhase] = useState<"loading" | "chat" | "gallery">("loading")
  const { locale, setLocale, t } = useLocale()
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])
  const [typingSender, setTypingSender] = useState<string | null>(null)
  const [readMessages, setReadMessages] = useState<Set<number>>(new Set())
  const [showGallery, setShowGallery] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const footerRef = useRef<HTMLDivElement>(null)
  const galleryScrollRef = useRef<HTMLDivElement>(null)
  const galleryCardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)

  const messages = useMemo(() => buildMessages(), [])
  const galleryItems = useMemo(() => getGalleryItems(), [])

  const [reducedMotion, setReducedMotion] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    setIsDesktop(window.matchMedia("(pointer: fine)").matches)
  }, [])

  // Sync dark mode with user preference (localStorage + system) on mount.
  // On return visit (reload), skip loader and show hero + gallery immediately.
  useEffect(() => {
    setDark(getInitialDark())
    setThemeReady(true)
    if (isReturnVisit()) {
      setPhase("gallery")
      setVisibleMessages([1, 2, 3])
      setReadMessages(new Set([2, 3]))
      setShowGallery(true)
    }
    setSessionChecked(true)
  }, [])

  const handleToggleDark = useCallback(() => {
    setDark((d) => {
      const next = !d
      if (typeof window !== "undefined") localStorage.setItem(THEME_KEY, String(next))
      return next
    })
  }, [])

  // Loader done → clip-path wipe exit, then start chat. Mark session as visited for reloads.
  const handleLoaderDone = useCallback(() => {
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem(VISITED_KEY, "1")
    const loaderEl = document.querySelector("[data-loader]") as HTMLElement
    if (!loaderEl) {
      setPhase("chat")
      return
    }

    if (reducedMotion) {
      gsap.to(loaderEl, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          loaderEl.style.display = "none"
          setPhase("chat")
        },
      })
    } else {
      // Clip-path wipe upward — reveals the chat underneath
      gsap.to(loaderEl, {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.7,
        ease: "power4.inOut",
        onComplete: () => {
          loaderEl.style.display = "none"
          setPhase("chat")
        },
      })
    }
  }, [reducedMotion])

  // Chat timeline
  useEffect(() => {
    if (phase !== "chat") return

    const timers: ReturnType<typeof setTimeout>[] = []

    timeline.forEach((event) => {
      const t = setTimeout(() => {
        switch (event.type) {
          case "typing":
            setTypingSender(event.sender ?? null)
            break
          case "message":
            setTypingSender(null)
            setVisibleMessages((prev) => [...prev, event.id!])
            break
          case "read":
            setReadMessages((prev) => new Set([...prev, event.id!]))
            break
          case "gallery":
            setShowGallery(true)
            setPhase("gallery")
            break
        }
      }, event.at)
      timers.push(t)
    })

    return () => timers.forEach(clearTimeout)
  }, [phase])

  // Which project card is in the center of the gallery viewport (messaging area)
  // Use getBoundingClientRect so "center" is the visible viewport center, not scroll content
  const updateActiveProject = useCallback(() => {
    const scrollEl = galleryScrollRef.current
    if (!scrollEl) return
    const rect = scrollEl.getBoundingClientRect()
    const viewportCenterX = rect.left + rect.width / 2
    const cards = galleryCardRefs.current
    let best = 0
    let bestDist = Infinity
    cards.forEach((el, i) => {
      if (!el) return
      const cardRect = el.getBoundingClientRect()
      const cardCenterX = cardRect.left + cardRect.width / 2
      const dist = Math.abs(viewportCenterX - cardCenterX)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    setActiveGalleryIndex(best)
  }, [])

  useEffect(() => {
    if (!showGallery) return
    let cleanup: (() => void) | undefined
    const t = setTimeout(() => {
      updateActiveProject()
      const scrollEl = galleryScrollRef.current
      if (!scrollEl) return
      scrollEl.addEventListener("scroll", updateActiveProject)
      window.addEventListener("resize", updateActiveProject)
      cleanup = () => {
        scrollEl.removeEventListener("scroll", updateActiveProject)
        window.removeEventListener("resize", updateActiveProject)
      }
    }, 50)
    return () => {
      clearTimeout(t)
      cleanup?.()
    }
  }, [showGallery, updateActiveProject])

  // Footer entrance — IntersectionObserver triggers GSAP
  useEffect(() => {
    if (!showGallery || !footerRef.current) return

    if (reducedMotion) {
      gsap.set(footerRef.current, { opacity: 1, y: 0 })
      return
    }

    const el = footerRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              el,
              { opacity: 0, y: 32 },
              { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
            )
            observer.disconnect()
          }
        })
      },
      { rootMargin: "-80px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [showGallery, reducedMotion])

  // When opening contact: scroll footer into view so section is fully visible
  useEffect(() => {
    if (!contactOpen || !footerRef.current) return
    const footer = footerRef.current
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        footer.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    })
    return () => cancelAnimationFrame(t)
  }, [contactOpen])

  // When contact is open: close on scroll up (footer leaves viewport upward)
  useEffect(() => {
    if (!contactOpen) return
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0
    const onScroll = () => {
      const y = window.scrollY
      if (y < lastScrollY) {
        const footer = footerRef.current
        if (footer && footer.getBoundingClientRect().top < -60) {
          setContactOpen(false)
        }
      }
      lastScrollY = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [contactOpen])

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        dark ? "bg-neutral-950" : "bg-white"
      } ${isDesktop ? "cursor-none" : ""}`}
    >
      {isDesktop && <Cursor dark={dark} />}

      {/* ─── Fixed header ─── */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4">
        <div className="flex flex-col items-start">
          <span
            className={`text-[18px] font-bold tracking-tight ${
              dark ? "text-white" : "text-neutral-900"
            }`}
          >
            eyay
          </span>
          <span
            className="border-b-2 border-dashed border-red-500 -mt-0.5"
            style={{ width: "2.8ch" }}
          />
        </div>

        <Link
          href="/studio"
          className={`text-[11px] uppercase font-medium tracking-widest transition-colors duration-300 ${
            dark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-400 hover:text-neutral-600"
          }`}
          data-hover
        >
          {t("studio")}
        </Link>
      </header>

      {/* ─── Bottom toggles: theme + language ─── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-4 px-5 py-4"
      >
        <button
          onClick={handleToggleDark}
          className={`flex items-center justify-center rounded-full w-9 h-9 transition-colors duration-300 ${
            dark
              ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
          data-hover
          aria-label="Toggle dark mode"
        >
          <DarkModeIcon dark={dark} />
        </button>
        <div
          className={`flex items-center rounded-full text-[12px] font-medium ${
            dark ? "bg-neutral-800 text-neutral-400" : "bg-neutral-100 text-neutral-500"
          }`}
        >
          <button
            onClick={() => setLocale("en")}
            className={`px-3 py-2 rounded-full transition-colors duration-200 ${
              locale === "en" ? (dark ? "text-white bg-neutral-700" : "text-neutral-900 bg-neutral-200") : ""
            }`}
            data-hover
          >
            EN
          </button>
          <button
            onClick={() => setLocale("nl")}
            className={`px-3 py-2 rounded-full transition-colors duration-200 ${
              locale === "nl" ? (dark ? "text-white bg-neutral-700" : "text-neutral-900 bg-neutral-200") : ""
            }`}
            data-hover
          >
            NL
          </button>
        </div>
      </div>

      {/* ─── Loader (only on first visit in this session) ─── */}
      {phase === "loading" && themeReady && sessionChecked && (
        <Loader dark={dark} suffix={t("loader.suffix")} onDone={handleLoaderDone} reducedMotion={reducedMotion} />
      )}

      {/* ─── Chat + Gallery + Footer ─── */}
      {(phase === "chat" || phase === "gallery") && (
        <main className="pt-24 pb-24 px-5 max-w-3xl mx-auto">
          {/* iMessage chat */}
          <div className="max-w-md mx-auto flex flex-col gap-0">
            {messages.map((msg) =>
              visibleMessages.includes(msg.id) ? (
                <MessageBubble
                  key={msg.id}
                  text={t(`messages.${msg.id}`)}
                  sender={msg.sender}
                  time={msg.time}
                  dark={dark}
                  read={readMessages.has(msg.id)}
                  reducedMotion={reducedMotion}
                />
              ) : null
            )}
            {typingSender && <TypingIndicator dark={dark} />}
            {/* Descriptor as message — right below last bubble, updates with centered card */}
            {showGallery && (
              <div className="flex justify-start mb-1.5">
                <div>
                  <div
                    className={`
                      max-w-[240px] px-3.5 py-2 text-[15px] leading-[1.35]
                      rounded-2xl rounded-bl-sm
                      ${dark ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-900"}
                    `}
                  >
                    {(() => {
                      const item = galleryItems[activeGalleryIndex]
                      if (!item) return null
                      return item.type === "project"
                        ? t(`projectTags.${item.project.id}`)
                        : t(item.tagKey)
                    })()}
                  </div>
                  <div className={`flex items-center gap-1 mt-0.5 text-[11px] justify-start ${dark ? "text-neutral-600" : "text-neutral-400"}`}>
                    <span>11:18</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Gallery — full viewport width scroll, soft side overlays ─── */}
          {showGallery && (
            <section
              className="mt-6 relative"
              style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", width: "100vw" }}
            >
              {/* Side overlays — subtle gradient fade */}
              <div
                className={`absolute left-0 top-0 bottom-4 w-12 z-10 pointer-events-none ${
                  dark ? "bg-gradient-to-r from-neutral-950/30 to-transparent" : "bg-gradient-to-r from-white/30 to-transparent"
                }`}
              />
              <div
                className={`absolute right-0 top-0 bottom-4 w-12 z-10 pointer-events-none ${
                  dark ? "bg-gradient-to-l from-neutral-950/30 to-transparent" : "bg-gradient-to-l from-white/30 to-transparent"
                }`}
              />
              <div
                ref={galleryScrollRef}
                className="flex gap-4 overflow-x-auto overflow-y-visible no-scrollbar snap-x snap-mandatory items-start pb-4"
                style={{
                  paddingLeft: "calc((100vw - 360px) / 2)",
                  paddingRight: "calc((100vw - 360px) / 2)",
                  scrollPaddingLeft: "calc((100vw - 360px) / 2)",
                  scrollPaddingRight: "calc((100vw - 360px) / 2)",
                }}
              >
                {galleryItems.map((item, i) => (
                  <div
                    key={item.type === "project" ? item.project.id : item.tagKey}
                    ref={(el) => { galleryCardRefs.current[i] = el }}
                    className="shrink-0 snap-center"
                  >
                    {item.type === "project" ? (
                      <ProjectCard
                        name={item.project.name}
                        tag={item.project.tag}
                        gradient={item.project.gradient}
                        dark={dark}
                        index={i}
                        reducedMotion={reducedMotion}
                        media={item.project.media}
                        aspectRatio={item.project.aspectRatio ?? "16:9"}
                      />
                    ) : (
                      <ProjectCard
                        name=""
                        tag={t(item.tagKey)}
                        gradient={item.gradient}
                        dark={dark}
                        index={i}
                        reducedMotion={reducedMotion}
                        aspectRatio={item.aspectRatio}
                        isPlaceholder
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── Footer ─── */}
          {showGallery && (
            <footer
              ref={footerRef}
              className={`mt-16 mb-12 text-center opacity-0 ${
                contactOpen ? "min-h-[80vh] flex flex-col" : ""
              }`}
            >
              <div className={contactOpen ? "shrink-0" : ""}>
                <h2
                  className={`text-[28px] sm:text-[36px] font-semibold ${
                    dark ? "text-white" : "text-neutral-900"
                  }`}
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {t("footer.headline")}
                </h2>

                <p
                  className={`mt-4 text-[15px] sm:text-[16px] leading-relaxed max-w-xl mx-auto ${
                    dark ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  {t("footer.subheadline")}
                </p>

                <button
                  onClick={() => setContactOpen((o) => !o)}
                  className={`inline-block mt-5 px-6 py-3 rounded-full text-[15px] font-medium transition-all duration-300 ${
                    dark
                      ? "bg-white text-neutral-900 hover:bg-neutral-200"
                      : "bg-neutral-900 text-white hover:bg-neutral-700"
                  }`}
                  data-hover
                >
                  {contactOpen ? t("footer.close") : t("footer.getInTouch")}
                </button>
              </div>

              {/* Contact chat — fills remaining viewport height when open */}
              <div className={contactOpen ? "flex-1 min-h-0 flex flex-col" : ""}>
                <ContactChat
                  open={contactOpen}
                  dark={dark}
                  reducedMotion={reducedMotion}
                  source="lab"
                />
              </div>

              <div className={contactOpen ? "shrink-0" : ""}>
                <div className="flex justify-center gap-8 mt-6">
                {[
                  { value: "2025", label: t("footer.founded") },
                  { value: "2", label: t("footer.builders") },
                  { value: "100%", label: t("footer.selfInitiated") },
                ].map(({ value, label }) => (
                  <div key={label} className="flex flex-col items-center gap-0.5">
                    <span
                      className={`text-[15px] font-medium ${
                        dark ? "text-white" : "text-neutral-900"
                      }`}
                    >
                      {value}
                    </span>
                    <span
                      className={`text-[11px] uppercase ${
                        dark ? "text-neutral-600" : "text-neutral-400"
                      }`}
                      style={{ letterSpacing: "0.12em" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href="/studio"
                className={`inline-block mt-6 text-[11px] uppercase font-medium tracking-widest transition-colors duration-300 ${
                  dark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-400 hover:text-neutral-600"
                }`}
                data-hover
              >
                {t("footer.studioLink")}
              </Link>

              <p
                className={`mt-3 text-[13px] ${
                  dark ? "text-neutral-600" : "text-neutral-400"
                }`}
                style={{ letterSpacing: "0.12em" }}
              >
                {t("footer.studioAddress")}
              </p>
              </div>
            </footer>
          )}
        </main>
      )}

    </div>
  )
}

// ─── Dark mode icon with GSAP rotate animation ──────────────
function DarkModeIcon({ dark }: { dark: boolean }) {
  const iconRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { rotate: -90, scale: 0.5, opacity: 0 },
        { rotate: 0, scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      )
    }
  }, [dark])

  if (dark) {
    return (
      <svg ref={iconRef} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    )
  }

  return (
    <svg ref={iconRef} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
