"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

export function Cursor({ dark }: { dark: boolean }) {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    // Set initial position off-screen
    gsap.set(dot, { xPercent: -50, yPercent: -50, x: -100, y: -100 })
    gsap.set(ring, { xPercent: -50, yPercent: -50, x: -100, y: -100 })

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }

      // Dot follows instantly
      gsap.to(dot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.05,
        ease: "none",
      })

      // Ring follows with spring-like easing
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.35,
        ease: "power2.out",
      })
    }

    // Expand ring on interactive elements
    const onEnterInteractive = () => {
      gsap.to(ring, { scale: 1.6, opacity: 0.5, duration: 0.25, ease: "power2.out" })
    }
    const onLeaveInteractive = () => {
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" })
    }

    window.addEventListener("mousemove", onMove)

    // Attach hover listeners to interactive elements
    const interactives = document.querySelectorAll("a, button, [data-hover]")
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnterInteractive)
      el.addEventListener("mouseleave", onLeaveInteractive)
    })

    return () => {
      window.removeEventListener("mousemove", onMove)
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterInteractive)
        el.removeEventListener("mouseleave", onLeaveInteractive)
      })
    }
  }, [])

  // Update colors when dark mode changes
  useEffect(() => {
    if (dotRef.current) {
      gsap.to(dotRef.current, {
        backgroundColor: dark ? "#fff" : "#0d0d0d",
        duration: 0.3,
      })
    }
    if (ringRef.current) {
      gsap.to(ringRef.current, {
        borderColor: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)",
        duration: 0.3,
      })
    }
  }, [dark])

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[6px] h-[6px] rounded-full pointer-events-none z-[999]"
        style={{ backgroundColor: dark ? "#fff" : "#0d0d0d" }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-[28px] h-[28px] rounded-full border pointer-events-none z-[998]"
        style={{ borderColor: dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.2)" }}
      />
    </>
  )
}
