"use client"

import { forwardRef, useImperativeHandle, useRef, useState } from "react"

function getScrambledChar(original: string, useOriginalOnly: boolean): string {
  if (useOriginalOnly && original.length > 0) {
    return original[Math.floor(Math.random() * original.length)]
  }
  const set = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  return set[Math.floor(Math.random() * set.length)]
}

function scrambleString(
  text: string,
  revealCount: number,
  useOriginalOnly: boolean
): string {
  return text
    .split("")
    .map((char, i) =>
      i < revealCount ? char : char === " " ? " " : getScrambledChar(text, useOriginalOnly)
    )
    .join("")
}

export interface ScrambleInHandle {
  start: () => void
}

interface ScrambleInProps {
  text: string
  scrambleSpeed?: number
  autoStart?: boolean
  className?: string
}

const ScrambleIn = forwardRef<ScrambleInHandle, ScrambleInProps>(
  (
    {
      text,
      scrambleSpeed = 25,
      autoStart = false,
      className = "",
    },
    ref
  ) => {
    const [display, setDisplay] = useState(autoStart ? text : scrambleString(text, 0, true))
    const started = useRef(false)

    useImperativeHandle(ref, () => ({
      start() {
        if (started.current) return
        started.current = true
        if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setDisplay(text)
          return
        }
        const len = text.length
        let revealed = 0
        const interval = setInterval(() => {
          revealed += 1
          setDisplay(scrambleString(text, revealed, true))
          if (revealed >= len) clearInterval(interval)
        }, scrambleSpeed)
      },
    }))

    return <span className={className}>{display}</span>
  }
)

ScrambleIn.displayName = "ScrambleIn"

export default ScrambleIn
