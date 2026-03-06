"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

export function Cursor({ dark }: { dark: boolean }) {
  const cursorRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLDivElement>(null)
  const prev = useRef({ x: 0, y: 0 })
  const angle = useRef(0)
  const hovering = useRef(false)
  const hoverType = useRef<"arrow" | "dot" | "tag">("arrow")
  const [cursorLabel, setCursorLabel] = useState<string | null>(null)

  useEffect(() => {
    const el = cursorRef.current
    const arrow = arrowRef.current
    const dot = dotRef.current
    const tag = tagRef.current
    if (!el || !arrow || !dot || !tag) return

    gsap.set(el, { x: -100, y: -100 })
    gsap.set(dot, { scale: 0, opacity: 0 })
    gsap.set(tag, { scale: 0, opacity: 0 })

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - prev.current.x
      const dy = e.clientY - prev.current.y

      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        angle.current = Math.atan2(dy, dx) * (180 / Math.PI)
      }

      prev.current = { x: e.clientX, y: e.clientY }

      gsap.to(el, {
        x: e.clientX,
        y: e.clientY,
        rotation: hovering.current ? 0 : angle.current,
        duration: 0.12,
        ease: "power2.out",
      })
    }

    const onEnter = (e: Event) => {
      const target = e.target as HTMLElement
      const label = target.getAttribute?.("data-cursor-label")
      hovering.current = true

      if (label) {
        hoverType.current = "tag"
        setCursorLabel(label)
        gsap.to(arrow, { scale: 0, opacity: 0, duration: 0.2, ease: "power2.in" })
        gsap.to(dot, { scale: 0, opacity: 0, duration: 0.15, ease: "power2.in" })
        gsap.to(tag, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(1.7)" })
        gsap.to(el, { rotation: 0, duration: 0.2, ease: "power2.out" })
      } else {
        hoverType.current = "dot"
        setCursorLabel(null)
        gsap.to(arrow, { scale: 0, opacity: 0, duration: 0.2, ease: "power2.in" })
        gsap.to(tag, { scale: 0, opacity: 0, duration: 0.15, ease: "power2.in" })
        gsap.to(dot, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(1.7)" })
        gsap.to(el, { rotation: 0, duration: 0.2, ease: "power2.out" })
      }
    }

    const onLeave = () => {
      hovering.current = false
      setCursorLabel(null)
      gsap.to(tag, { scale: 0, opacity: 0, duration: 0.15, ease: "power2.in" })
      gsap.to(dot, { scale: 0, opacity: 0, duration: 0.15, ease: "power2.in" })
      gsap.to(arrow, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(1.7)" })
      hoverType.current = "arrow"
    }

    window.addEventListener("mousemove", onMove)

    const attachListeners = () => {
      const interactives = document.querySelectorAll("a, button, [data-hover], input, textarea")
      interactives.forEach((interactive) => {
        interactive.addEventListener("mouseenter", onEnter)
        interactive.addEventListener("mouseleave", onLeave)
      })
      return interactives
    }

    let interactives = attachListeners()

    const observer = new MutationObserver(() => {
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter)
        el.removeEventListener("mouseleave", onLeave)
      })
      interactives = attachListeners()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener("mousemove", onMove)
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter)
        el.removeEventListener("mouseleave", onLeave)
      })
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[999]"
      style={{ marginLeft: "-8px", marginTop: "-8px", transformOrigin: "center center" }}
    >
      {/* Arrow — default state */}
      <span
        ref={arrowRef}
        style={{
          display: "block",
          fontSize: "16px",
          lineHeight: 1,
          color: "#0000FF",
          fontWeight: 700,
          userSelect: "none",
        }}
      >
        ➜
      </span>

      {/* Dot — hover generic interactive */}
      <div
        ref={dotRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "10px",
          height: "10px",
          marginLeft: "-5px",
          marginTop: "-5px",
          borderRadius: "50%",
          backgroundColor: "#0000FF",
        }}
      />

      {/* Tag — hover project card: rectangle with title, no caps */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          ref={tagRef}
          className="origin-center whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-medium text-white"
          style={{
            backgroundColor: "#0000FF",
            scale: 0,
            opacity: 0,
          }}
        >
          {cursorLabel?.toLowerCase() ?? ""}
        </div>
      </div>
    </div>
  )
}
