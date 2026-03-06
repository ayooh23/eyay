"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

export function TypingIndicator({ dark }: { dark: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dots = containerRef.current?.querySelectorAll(".typing-dot")
    if (!dots) return

    // Staggered bounce animation
    gsap.to(dots, {
      y: -4,
      duration: 0.4,
      ease: "power1.inOut",
      stagger: { each: 0.15, repeat: -1, yoyo: true },
    })
  }, [])

  return (
    <div className="flex justify-start mb-1.5">
      <div
        ref={containerRef}
        className={`
          flex items-center gap-[5px] px-3.5 py-2.5 rounded-2xl rounded-bl-sm
          ${dark ? "bg-neutral-800" : "bg-neutral-100"}
        `}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`typing-dot block w-[7px] h-[7px] rounded-full ${
              dark ? "bg-neutral-500" : "bg-neutral-400"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
