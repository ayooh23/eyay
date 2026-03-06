"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import en from "@/locales/en.json"
import nl from "@/locales/nl.json"

const translations = { en, nl } as const
export type Locale = keyof typeof translations

const LOCALE_KEY = "eyay-lang"

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en"
  const stored = localStorage.getItem(LOCALE_KEY) as Locale | null
  if (stored === "en" || stored === "nl") return stored
  const lang = navigator.language?.slice(0, 2)
  return lang === "nl" ? "nl" : "en"
}

function get(obj: unknown, path: string): string | undefined {
  const keys = path.split(".")
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === "string" ? current : undefined
}

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLocaleState(getInitialLocale())
    setReady(true)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    if (typeof window !== "undefined") localStorage.setItem(LOCALE_KEY, next)
  }, [])

  const t = useCallback(
    (key: string): string => {
      const dict = translations[locale]
      return get(dict, key) ?? get(en, key) ?? key
    },
    [locale]
  )

  const value = useMemo(
    () => (ready ? { locale, setLocale, t } : { locale: "en" as Locale, setLocale: () => {}, t: (k: string) => get(en, k) ?? k }),
    [locale, setLocale, t, ready]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}
