"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

interface MessageBubbleProps {
  text: string
  sender: "sinyo" | "ayu"
  time: string
  dark: boolean
  read?: boolean
  reducedMotion?: boolean
  wide?: boolean
}

export function MessageBubble({
  text,
  sender,
  time,
  dark,
  read = false,
  reducedMotion = false,
  wide = false,
}: MessageBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null)
  const isSinyo = sender === "sinyo"

  useEffect(() => {
    const el = bubbleRef.current
    if (!el) return

    if (reducedMotion) {
      gsap.set(el, { opacity: 1 })
      return
    }

    // Blur-in spring entrance
    gsap.fromTo(
      el,
      { opacity: 0, y: 14, scale: 0.92, filter: "blur(4px)" },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "back.out(1.4)",
      }
    )
  }, [reducedMotion])

  return (
    <div className={`flex ${isSinyo ? "justify-start" : "justify-end"} mb-1.5`}>
      <div ref={bubbleRef} className="opacity-0">
        <div
          className={`
            ${wide ? "max-w-[340px]" : "max-w-[240px]"} px-3.5 py-2 text-[15px] leading-[1.35]
            ${
              isSinyo
                ? `rounded-2xl rounded-bl-sm ${
                    dark ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-900"
                  }`
                : `rounded-2xl rounded-br-sm ${dark ? "bg-neutral-700 text-white" : "bg-neutral-900 text-white"}`
            }
          `}
        >
          {text}
        </div>
        <div
          className={`
            flex items-center gap-1 mt-0.5 text-[11px]
            ${isSinyo ? "justify-start" : "justify-end"}
            ${dark ? "text-neutral-600" : "text-neutral-400"}
          `}
        >
          <span>{time}</span>
          {!isSinyo && read && (
            <span className={`text-[10px] font-medium ${dark ? "text-neutral-500" : "text-neutral-400"}`}>Read</span>
          )}
        </div>
      </div>
    </div>
  )
}
