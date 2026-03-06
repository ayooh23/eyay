"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import gsap from "gsap"
import { MessageBubble } from "@/components/MessageBubble"
import { TypingIndicator } from "@/components/TypingIndicator"

interface ContactChatProps {
  open: boolean
  onClose: () => void
  dark: boolean
  reducedMotion: boolean
}

// Pre-scripted intro messages
const introMessages = [
  { id: 1, sender: "sinyo" as const, text: "hey!", time: "now" },
  { id: 2, sender: "sinyo" as const, text: "tell us about your idea", time: "now" },
]

// Timeline for the intro sequence
const introTimeline = [
  { type: "typing" as const, at: 400 },
  { type: "message" as const, id: 1, at: 1400 },
  { type: "typing" as const, at: 2000 },
  { type: "message" as const, id: 2, at: 3200 },
  { type: "input" as const, at: 3600 },
]

export function ContactChat({ open, onClose, dark, reducedMotion }: ContactChatProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])
  const [typing, setTyping] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)

  // Entrance animation
  useEffect(() => {
    if (!open || !overlayRef.current) return

    if (reducedMotion) {
      gsap.set(overlayRef.current, { clipPath: "inset(0 0 0 0)", opacity: 1 })
    } else {
      gsap.fromTo(
        overlayRef.current,
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0 0 0 0)", duration: 0.5, ease: "power4.out" }
      )
    }
  }, [open, reducedMotion])

  // Run intro timeline when opened (only once per open)
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

  // Close with animation
  const handleClose = useCallback(() => {
    if (!overlayRef.current) {
      onClose()
      return
    }

    const complete = () => {
      // Reset state for next open
      setVisibleMessages([])
      setTyping(false)
      setShowInput(false)
      setMessage("")
      setSent(false)
      setHasPlayed(false)
      onClose()
    }

    if (reducedMotion) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: complete })
    } else {
      gsap.to(overlayRef.current, {
        clipPath: "inset(100% 0 0 0)",
        duration: 0.4,
        ease: "power4.in",
        onComplete: complete,
      })
    }
  }, [onClose, reducedMotion])

  // Send message via mailto
  const handleSend = useCallback(() => {
    if (!message.trim()) return

    setSent(true)

    const subject = encodeURIComponent("New idea")
    const body = encodeURIComponent(message.trim())
    window.location.href = `mailto:hello@eyay.studio?subject=${subject}&body=${body}`
  }, [message])

  // Handle Enter key (send) and Shift+Enter (newline)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex flex-col ${
        dark ? "bg-neutral-950" : "bg-white"
      }`}
      style={{ clipPath: "inset(100% 0 0 0)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
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
          onClick={handleClose}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-300 ${
            dark ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-600"
          }`}
          data-hover
          aria-label="Close contact chat"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-5 pt-8">
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

          {/* Sent confirmation */}
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
      </div>

      {/* Input area — appears after intro */}
      {showInput && !sent && (
        <div className={`px-5 py-4 border-t ${dark ? "border-neutral-800" : "border-neutral-100"}`}>
          <div className="max-w-md mx-auto flex gap-3 items-end">
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

      {/* Post-send state */}
      {sent && (
        <div className={`px-5 py-6 text-center ${dark ? "text-neutral-500" : "text-neutral-400"}`}>
          <p className="text-[13px]">your email client should open shortly</p>
          <button
            onClick={handleClose}
            className={`mt-3 text-[13px] font-medium ${dark ? "text-neutral-300" : "text-neutral-600"}`}
            data-hover
          >
            close
          </button>
        </div>
      )}
    </div>
  )
}
