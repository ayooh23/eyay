"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import gsap from "gsap"
import { MessageBubble } from "@/components/MessageBubble"
import { TypingIndicator } from "@/components/TypingIndicator"
import { useLocale } from "@/contexts/LocaleContext"

interface ContactChatProps {
  open: boolean
  dark: boolean
  reducedMotion: boolean
  source?: "lab" | "studio"
}

interface DisplayMessage {
  id: number
  sender: "sinyo" | "ayu"
  text: string
}

interface ChatHistoryItem {
  role: "user" | "assistant"
  content: string
}

const introTimeline = [
  { type: "typing" as const, at: 400 },
  { type: "message" as const, messageKey: "contact.hey", at: 1400 },
  { type: "typing" as const, at: 2000 },
]

export function ContactChat({ open, dark, reducedMotion, source = "lab" }: ContactChatProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { t } = useLocale()

  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([])
  const [typing, setTyping] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const chatHistoryRef = useRef<ChatHistoryItem[]>([])

  // ─── Open/close animation ────────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current
    const inner = innerRef.current
    if (!wrapper || !inner) return

    if (open) {
      gsap.set(wrapper, { overflow: "hidden", display: "block", height: 0, opacity: 0 })
      gsap.fromTo(
        wrapper,
        { height: 0, opacity: 0 },
        {
          height: () => inner.scrollHeight,
          opacity: 1,
          duration: reducedMotion ? 0.01 : 0.45,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(wrapper, {
              height: "auto",
              overflow: "visible",
              minHeight: 0,
            })
            wrapper.classList.add("flex-1", "flex", "flex-col")
          },
        }
      )
    } else {
      gsap.to(wrapper, {
        height: 0,
        opacity: 0,
        duration: reducedMotion ? 0.01 : 0.3,
        ease: "power3.in",
        onComplete: () => {
          gsap.set(wrapper, { display: "none" })
          wrapper.classList.remove("flex-1", "flex", "flex-col")
          wrapper.style.height = ""
          wrapper.style.minHeight = ""
          setDisplayMessages([])
          setTyping(false)
          setShowInput(false)
          setInput("")
          setLoading(false)
          setHasPlayed(false)
          chatHistoryRef.current = []
        },
      })
    }
  }, [open, reducedMotion])

  // ─── Re-expand wrapper when content grows (only when not filling viewport) ───────────────
  useEffect(() => {
    if (!open) return
    const wrapper = wrapperRef.current
    const inner = innerRef.current
    if (!wrapper || !inner) return
    if (wrapper.classList.contains("flex-1")) return // filling viewport, don't animate height
    if (wrapper.style.height === "auto") {
      gsap.to(wrapper, {
        height: () => inner.scrollHeight,
        duration: reducedMotion ? 0.01 : 0.3,
        ease: "power3.out",
        onComplete: () => {
          gsap.set(wrapper, { height: "auto" })
        },
      })
    }
  }, [displayMessages, typing, showInput, loading, open, reducedMotion])

  // ─── Intro timeline ──────────────────────────────────────
  useEffect(() => {
    if (!open || hasPlayed) return
    setHasPlayed(true)

    const timers: ReturnType<typeof setTimeout>[] = []
    const secondMessageKey = source === "studio" ? "contact.introStudio" : "contact.introLab"

    introTimeline.forEach((event) => {
      const tmr = setTimeout(() => {
        if (event.type === "typing") setTyping(true)
        if (event.type === "message" && "messageKey" in event) {
          setTyping(false)
          setDisplayMessages((prev) => [
            ...prev,
            { id: Date.now(), sender: "sinyo", text: t(event.messageKey) },
          ])
        }
      }, event.at)
      timers.push(tmr)
    })

    // Second intro message
    const t2 = setTimeout(() => {
      setTyping(false)
      setDisplayMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "sinyo", text: t(secondMessageKey) },
      ])
    }, 3200)
    timers.push(t2)

    const tInput = setTimeout(() => setShowInput(true), 3600)
    timers.push(tInput)

    return () => timers.forEach(clearTimeout)
  }, [open, hasPlayed, source, t])

  // ─── Focus input when it appears ────────────────────────
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showInput])

  // ─── Textarea auto-grow ──────────────────────────────────
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  // ─── Send message to API ─────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput("")
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }

    // Add user bubble
    setDisplayMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "ayu", text },
    ])

    const newHistory: ChatHistoryItem[] = [
      ...chatHistoryRef.current,
      { role: "user", content: text },
    ]
    chatHistoryRef.current = newHistory

    setLoading(true)
    setTyping(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      })

      const data = await res.json()
      const reply = data.reply as string

      setTyping(false)
      setLoading(false)

      if (reply) {
        setDisplayMessages((prev) => [
          ...prev,
          { id: Date.now(), sender: "sinyo", text: reply },
        ])
        chatHistoryRef.current = [...newHistory, { role: "assistant", content: reply }]
      }
    } catch {
      setTyping(false)
      setLoading(false)
      // Fallback to mailto if API unavailable
      const subject = encodeURIComponent(t("contact.mailtoSubject"))
      const body = encodeURIComponent(text)
      window.open(`mailto:hello@eyay.studio?subject=${subject}&body=${body}`, "_blank")
    }
  }, [input, loading, t])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col min-h-0"
      style={open ? { overflow: "hidden" } : { display: "none" }}
    >
      <div ref={innerRef} className="pt-8 flex-1 flex flex-col min-h-0">
        {/* Chat messages — scrollable when space is limited */}
        <div className="max-w-md mx-auto flex flex-col gap-0 flex-1 min-h-0 overflow-auto">
          {displayMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              sender={msg.sender}
              time="now"
              dark={dark}
              reducedMotion={reducedMotion}
            />
          ))}
          {typing && <TypingIndicator dark={dark} />}
        </div>

        {/* Input area — pinned at bottom of chat area */}
        {showInput && (
          <div className="max-w-md mx-auto mt-4 shrink-0 pb-2">
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={t("contact.placeholder")}
                rows={1}
                disabled={loading}
                className={`flex-1 resize-none rounded-2xl px-4 py-3 text-[15px] leading-[1.35] outline-none transition-colors duration-300 ${
                  dark
                    ? "bg-neutral-800 text-white placeholder:text-neutral-500 disabled:opacity-40"
                    : "bg-neutral-100 text-neutral-900 placeholder:text-neutral-400 disabled:opacity-40"
                }`}
                style={{ maxHeight: "120px" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                  input.trim() && !loading
                    ? dark
                      ? "bg-white text-neutral-900"
                      : "bg-neutral-900 text-white"
                    : dark
                      ? "bg-neutral-800 text-neutral-600"
                      : "bg-neutral-100 text-neutral-400"
                }`}
                data-hover
                aria-label={t("contact.sendAria")}
              >
                {loading ? (
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
