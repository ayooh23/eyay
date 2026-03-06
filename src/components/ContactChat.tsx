"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import gsap from "gsap"
import { MessageBubble } from "@/components/MessageBubble"
import { TypingIndicator } from "@/components/TypingIndicator"

interface ContactChatProps {
  open: boolean
  dark: boolean
  reducedMotion: boolean
  source?: "lab" | "studio"
}

function getIntroMessages(source: "lab" | "studio") {
  return [
    { id: 1, sender: "sinyo" as const, text: "hey!", time: "now" },
    {
      id: 2,
      sender: "sinyo" as const,
      text: source === "studio" ? "tell me about your project" : "tell us about your idea",
      time: "now",
    },
  ]
}

const introTimeline = [
  { type: "typing" as const, at: 400 },
  { type: "message" as const, id: 1, at: 1400 },
  { type: "typing" as const, at: 2000 },
  { type: "message" as const, id: 2, at: 3200 },
  { type: "input" as const, at: 3600 },
]

export function ContactChat({ open, dark, reducedMotion, source = "lab" }: ContactChatProps) {
  const introMessages = useMemo(() => getIntroMessages(source), [source])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])
  const [typing, setTyping] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)

  // Animate height open/close
  useEffect(() => {
    const wrapper = wrapperRef.current
    const inner = innerRef.current
    if (!wrapper || !inner) return

    if (open) {
      // Measure content height, then animate from 0
      gsap.set(wrapper, { height: "auto", overflow: "hidden" })
      const h = inner.offsetHeight
      gsap.fromTo(
        wrapper,
        { height: 0, opacity: 0 },
        {
          height: h,
          opacity: 1,
          duration: reducedMotion ? 0.01 : 0.5,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(wrapper, { height: "auto", overflow: "visible" })
          },
        }
      )
    } else {
      // Collapse
      gsap.to(wrapper, {
        height: 0,
        opacity: 0,
        duration: reducedMotion ? 0.01 : 0.35,
        ease: "power3.in",
        onComplete: () => {
          // Reset state when closed
          setVisibleMessages([])
          setTyping(false)
          setShowInput(false)
          setMessage("")
          setSent(false)
          setHasPlayed(false)
        },
      })
    }
  }, [open, reducedMotion])

  // Re-measure height when content changes (messages appear, input shows)
  useEffect(() => {
    if (!open) return
    const wrapper = wrapperRef.current
    const inner = innerRef.current
    if (!wrapper || !inner) return

    // Only animate height if wrapper is currently auto (fully open)
    const current = wrapper.style.height
    if (current === "auto") {
      const h = inner.offsetHeight
      gsap.to(wrapper, {
        height: h,
        duration: reducedMotion ? 0.01 : 0.3,
        ease: "power3.out",
        onComplete: () => {
          gsap.set(wrapper, { height: "auto" })
        },
      })
    }
  }, [visibleMessages, showInput, sent, typing, open, reducedMotion])

  // Run intro timeline
  useEffect(() => {
    if (!open || hasPlayed) return

    const timers: ReturnType<typeof setTimeout>[] = []

    introTimeline.forEach((event) => {
      const t = setTimeout(() => {
        switch (event.type) {
          case "typing":
            setTyping(true)
            break
          case "message":
            setTyping(false)
            setVisibleMessages((prev) => [...prev, event.id!])
            break
          case "input":
            setShowInput(true)
            break
        }
      }, event.at)
      timers.push(t)
    })

    setHasPlayed(true)
    return () => timers.forEach(clearTimeout)
  }, [open, hasPlayed])

  // Focus input when it appears
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showInput])

  // Send via mailto
  const handleSend = useCallback(() => {
    if (!message.trim()) return
    setSent(true)
    const subject = encodeURIComponent("New idea")
    const body = encodeURIComponent(message.trim())
    window.location.href = `mailto:hello@eyay.studio?subject=${subject}&body=${body}`
  }, [message])

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
      style={{ height: 0, opacity: 0, overflow: "hidden" }}
    >
      <div ref={innerRef} className="pt-8">
        {/* Chat messages */}
        <div className="max-w-md mx-auto flex flex-col gap-0">
          {introMessages.map((msg) =>
            visibleMessages.includes(msg.id) ? (
              <MessageBubble
                key={msg.id}
                text={msg.text}
                sender={msg.sender}
                time={msg.time}
                dark={dark}
                reducedMotion={reducedMotion}
              />
            ) : null
          )}
          {typing && <TypingIndicator dark={dark} />}

          {sent && (
            <MessageBubble
              text={message.trim()}
              sender="ayu"
              time="now"
              dark={dark}
              read={false}
              reducedMotion={reducedMotion}
            />
          )}
        </div>

        {/* Input */}
        {showInput && !sent && (
          <div className="max-w-md mx-auto mt-4">
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="type your idea..."
                rows={1}
                className={`flex-1 resize-none rounded-2xl px-4 py-3 text-[15px] leading-[1.35] outline-none transition-colors duration-300 ${
                  dark
                    ? "bg-neutral-800 text-white placeholder:text-neutral-500"
                    : "bg-neutral-100 text-neutral-900 placeholder:text-neutral-400"
                }`}
                style={{ maxHeight: "120px" }}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                  message.trim()
                    ? dark
                      ? "bg-white text-neutral-900"
                      : "bg-neutral-900 text-white"
                    : dark
                      ? "bg-neutral-800 text-neutral-600"
                      : "bg-neutral-100 text-neutral-400"
                }`}
                data-hover
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Post-send */}
        {sent && (
          <div className={`mt-4 text-center ${dark ? "text-neutral-500" : "text-neutral-400"}`}>
            <p className="text-[13px]">your email client should open shortly</p>
          </div>
        )}
      </div>
    </div>
  )
}
