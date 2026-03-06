"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import gsap from "gsap"
import { Cursor } from "@/components/Cursor"
import { TypingIndicator } from "@/components/TypingIndicator"
import { MessageBubble } from "@/components/MessageBubble"
import { ProjectCard } from "@/components/ProjectCard"
import { projects } from "@/data/projects"
import { ContactChat } from "@/components/ContactChat"

// ─── Chat timeline data ──────────────────────────────────────
function buildMessages() {
  return [
    { id: 1, sender: "sinyo" as const, text: "Ey ay", time: "01:23" },
    { id: 2, sender: "ayu" as const, text: "Yo sin", time: "06:46" },
    { id: 3, sender: "sinyo" as const, text: "what if we create something that\u2026", time: "11:18" },
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
  onDone,
  reducedMotion,
}: {
  dark: boolean
  onDone: () => void
  reducedMotion: boolean
}) {
  const loaderRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const fullText = "eyay where ideas get built"

  useEffect(() => {
    if (reducedMotion) {
      if (textRef.current) textRef.current.textContent = fullText
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }

    let i = 0
    const interval = setInterval(() => {
      if (textRef.current) {
        textRef.current.textContent = fullText.slice(0, i + 1)
      }
      i++
      if (i >= fullText.length) {
        clearInterval(interval)
        setTimeout(onDone, 1200)
      }
    }, 65)

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
  }, [onDone, reducedMotion])

  return (
    <div
      ref={loaderRef}
      data-loader
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        dark ? "bg-neutral-950" : "bg-white"
      }`}
      style={{ clipPath: "inset(0 0 0 0)" }}
    >
      <div className="text-center">
        <span
          ref={textRef}
          className={`text-[18px] sm:text-[22px] font-medium tracking-tight ${
            dark ? "text-white" : "text-neutral-900"
          }`}
        />
        <span
          ref={cursorRef}
          className={`inline-block w-[2px] h-[22px] ml-0.5 align-middle ${
            dark ? "bg-white" : "bg-neutral-900"
          }`}
        />
        <div className="relative mt-1 flex justify-center">
          <span
            className="border-b-2 border-dashed border-red-500"
            style={{ width: "3.2ch" }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────
export default function Home() {
  const [dark, setDark] = useState(false)
  const [phase, setPhase] = useState<"loading" | "chat" | "gallery">("loading")
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])
  const [typingSender, setTypingSender] = useState<string | null>(null)
  const [readMessages, setReadMessages] = useState<Set<number>>(new Set())
  const [showGallery, setShowGallery] = useState(false)
  const footerRef = useRef<HTMLDivElement>(null)

  const messages = useMemo(() => buildMessages(), [])

  const [reducedMotion, setReducedMotion] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    setIsDesktop(window.matchMedia("(pointer: fine)").matches)
  }, [])

  // Loader done → clip-path wipe exit, then start chat
  const handleLoaderDone = useCallback(() => {
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

        <button
          onClick={() => setDark((d) => !d)}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-300 ${
            dark
              ? "bg-neutral-800 text-neutral-300"
              : "bg-neutral-100 text-neutral-600"
          }`}
          data-hover
          aria-label="Toggle dark mode"
        >
          <DarkModeIcon dark={dark} />
        </button>
      </header>

      {/* ─── Loader ─── */}
      {phase === "loading" && (
        <Loader dark={dark} onDone={handleLoaderDone} reducedMotion={reducedMotion} />
      )}

      {/* ─── Chat + Gallery + Footer ─── */}
      {(phase === "chat" || phase === "gallery") && (
        <main className="pt-24 pb-8 px-5 max-w-3xl mx-auto">
          {/* iMessage chat */}
          <div className="max-w-md mx-auto flex flex-col gap-0">
            {messages.map((msg) =>
              visibleMessages.includes(msg.id) ? (
                <MessageBubble
                  key={msg.id}
                  text={msg.text}
                  sender={msg.sender}
                  time={msg.time}
                  dark={dark}
                  read={readMessages.has(msg.id)}
                  reducedMotion={reducedMotion}
                />
              ) : null
            )}
            {typingSender && <TypingIndicator dark={dark} />}
          </div>

          {/* ─── Gallery ─── */}
          {showGallery && (
            <section className="mt-12" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", width: "100vw" }}>
              <div className="flex items-end gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 px-5">
                {projects.map((project, i) => (
                  <ProjectCard
                    key={project.id}
                    name={project.name}
                    tag={project.tag}
                    gradient={project.gradient}
                    height={project.height}
                    shift={project.shift}
                    dark={dark}
                    index={i}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ─── Footer ─── */}
          {showGallery && (
            <footer ref={footerRef} className="mt-16 mb-12 text-center opacity-0">
              <h2
                className={`text-[28px] sm:text-[36px] font-semibold ${
                  dark ? "text-white" : "text-neutral-900"
                }`}
                style={{ letterSpacing: "-0.03em" }}
              >
                Your idea, finally built.
              </h2>

              <a
                href="mailto:hello@eyay.studio"
                className={`inline-block mt-5 px-6 py-3 rounded-full text-[15px] font-medium transition-all duration-300 ${
                  dark
                    ? "bg-white text-neutral-900 hover:bg-neutral-200"
                    : "bg-neutral-900 text-white hover:bg-neutral-700"
                }`}
                data-hover
              >
                Get in touch &rarr;
              </a>

              {/* Facts */}
              <div className="flex justify-center gap-8 mt-6">
                {[
                  { value: "2025", label: "founded" },
                  { value: "2", label: "builders" },
                  { value: "100%", label: "self-initiated" },
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

              <p
                className={`mt-6 text-[13px] ${
                  dark ? "text-neutral-600" : "text-neutral-400"
                }`}
                style={{ letterSpacing: "0.12em" }}
              >
                eyay.studio &mdash; Amsterdam
              </p>
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
