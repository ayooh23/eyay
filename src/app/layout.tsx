import type { Metadata } from "next"
import { LocaleProvider } from "@/contexts/LocaleContext"
import "./globals.css"

export const metadata: Metadata = {
  title: "eyay — where ideas get built",
  description: "eyay.studio — Amsterdam-based digital studio. We turn ideas into products.",
  openGraph: {
    title: "eyay — where ideas get built",
    description: "Amsterdam-based digital studio. We turn ideas into products.",
    url: "https://eyay.studio",
    siteName: "eyay",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  )
}
