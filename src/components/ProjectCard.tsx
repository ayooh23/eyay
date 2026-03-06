"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

interface ProjectCardProps {
  name: string
  tag: string
  gradient: string
  height: number
  shift: "up" | "down" | "left" | "right"
  dark: boolean
  index: number
  reducedMotion?: boolean
}

const shiftOffset: Record<string, { x: number; y: number }> = {
  up:    { x: 0, y: -18 },
  down:  { x: 0, y: 18 },
  left:  { x: -18, y: 0 },
  right: { x: 18, y: 0 },
}

export function ProjectCard({
  name,
  tag,
  gradient,
  height,
  shift,
  dark,
  index,
  reducedMotion = false,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  // Staggered entrance animation
  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    if (reducedMotion) {
      gsap.set(el, { opacity: 1 })
      return
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        delay: 0.2 + index * 0.12,
        duration: 0.7,
        ease: "power3.out",
      }
    )
  }, [index, reducedMotion])

  // Hover: image directional shift + overlay clip-path reveal
  useEffect(() => {
    if (reducedMotion) return
    const offset = shiftOffset[shift]

    if (hovered) {
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          x: offset.x,
          y: offset.y,
          duration: 0.5,
          ease: "power3.out",
        })
      }
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          clipPath: "inset(0% 0 0 0)",
          duration: 0.3,
          ease: "power3.out",
        })
      }
    } else {
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
        })
      }
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          clipPath: "inset(100% 0 0 0)",
          duration: 0.3,
          ease: "power3.out",
        })
      }
    }
  }, [hovered, reducedMotion, shift])

  return (
    <div
      ref={cardRef}
      className="flex flex-col gap-2 cursor-pointer w-[260px] shrink-0 snap-start opacity-0"
      data-hover
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container — variable height per project */}
      <div className="relative rounded-xl overflow-hidden" style={{ height }}>
        <div
          ref={imageRef}
          className={`w-full h-full bg-gradient-to-br ${gradient}`}
          style={{ willChange: "transform" }}
        />

        {/* Name overlay — clip-path reveal */}
        <div
          ref={overlayRef}
          className="absolute inset-0 flex items-end p-4 bg-black/50"
          style={{ clipPath: "inset(100% 0 0 0)" }}
        >
          <span className="text-white text-[15px] font-semibold">{name}</span>
        </div>
      </div>

      {/* Tag pill */}
      <span
        className={`
          self-start px-2.5 py-1 rounded-full text-[13px] leading-[1.5]
          ${dark ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-600"}
        `}
      >
        {tag}
      </span>
    </div>
  )
}
