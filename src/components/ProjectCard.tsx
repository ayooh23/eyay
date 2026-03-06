"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import type { AspectRatio } from "@/data/projects"

const ASPECT_CLASS: Record<AspectRatio, string> = {
  "1:1": "aspect-square",
  "16:9": "aspect-video",
  "9:16": "aspect-[9/16]",
  "4:5": "aspect-[4/5]",
}

interface ProjectCardProps {
  name: string
  tag: string
  gradient: string
  dark: boolean
  index: number
  reducedMotion?: boolean
  media?: string
  aspectRatio?: AspectRatio
  isPlaceholder?: boolean
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
  aspectRatio = "16:9",
  isPlaceholder = false,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const aspectClass = ASPECT_CLASS[aspectRatio]

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

  const showMedia = media && !isPlaceholder

  return (
    <div
      ref={cardRef}
      className="flex flex-col gap-2 cursor-pointer w-[360px] shrink-0 snap-center opacity-0 items-start"
      data-hover
      data-cursor-label={isPlaceholder ? undefined : name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`relative rounded-xl overflow-hidden w-full ${aspectClass}`}>
        <div
          ref={imageRef}
          className={`w-full h-full min-h-0 origin-center ${!showMedia ? `bg-gradient-to-br ${gradient}` : ""}`}
          style={{ willChange: "transform" }}
        >
          {showMedia && media.endsWith(".mp4") ? (
            <video
              src={media}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : showMedia && media ? (
            <img
              src={media}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
