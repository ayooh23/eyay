"use client"

import { useState, useCallback } from "react"

function getScrambledChar(original: string, useOriginalOnly: boolean): string {
  if (useOriginalOnly && original.length > 0) {
    return original[Math.floor(Math.random() * original.length)]
  }
  const set = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return set[Math.floor(Math.random() * set.length)]
}

function scrambleString(text: string, useOriginalOnly: boolean): string {
  return text
    .split("")
    .map((char) => (char === " " ? " " : getScrambledChar(text, useOriginalOnly)))
    .join("")
}

interface ScrambleHoverProps {
  text: string
  scrambleSpeed?: number
  maxIterations?: number
  useOriginalCharsOnly?: boolean
  className?: string
}

export default function ScrambleHover({
  text,
  scrambleSpeed = 50,
  maxIterations = 8,
  useOriginalCharsOnly = true,
  className = "",
}: ScrambleHoverProps) {
  const [display, setDisplay] = useState(text)

  const onMouseEnter = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let iter = 0
    const id = setInterval(() => {
      setDisplay(scrambleString(text, useOriginalCharsOnly))
      iter += 1
      if (iter >= maxIterations) {
        clearInterval(id)
        setDisplay(text)
      }
    }, scrambleSpeed)
  }, [text, scrambleSpeed, maxIterations, useOriginalCharsOnly])

  const onMouseLeave = useCallback(() => {
    setDisplay(text)
  }, [text])

  return (
    <span
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {display}
    </span>
  )
}
