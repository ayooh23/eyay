"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"

interface ProjectCardProps {
  name: string
  tag: string
  gradient: string
  dark: boolean
  index: number
  reducedMotion?: boolean
  media?: string
}

const ZOOM_SCALE = 1.06

export function ProjectCard({
  name,
  tag,
  gradient,
  dark,
  index,
  reducedMotion = false,
  media,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
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

  // Hover: image zoom only; title shows in cursor via data-cursor-label
  useEffect(() => {
    if (reducedMotion) return

    if (hovered) {
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          scale: ZOOM_SCALE,
          duration: 0.5,
          ease: "power3.out",
        })
      }
    } else {
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
        })
      }
    }
  }, [hovered, reducedMotion])

  return (
    <div
      ref={cardRef}
      className="flex flex-col gap-2 cursor-pointer w-[360px] shrink-0 snap-start opacity-0 items-start"
      data-hover
      data-cursor-label={name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container — height hugs content, aligned top */}
      <div
        className={`relative rounded-xl overflow-hidden w-full ${media?.endsWith(".mp4") || !media ? "aspect-video" : ""}`}
      >
        <div
          ref={imageRef}
          className={`w-full h-full origin-center ${!media ? `bg-gradient-to-br ${gradient}` : ""}`}
          style={{ willChange: "transform" }}
        >
          {media && media.endsWith(".mp4") ? (
            <video
              src={media}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : media ? (
            <img
              src={media}
              alt={name}
              className="w-full h-auto block"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
