export interface Project {
  id: string
  name: string
  tag: string
  gradient: string // Tailwind gradient classes as placeholder
  url?: string
  media?: string // path to image or video in /public/content/
}

export const projects: Project[] = [
  {
    id: "project-1",
    name: "Speakeasy",
    tag: "\u2026promotes evolving language",
    gradient: "from-neutral-300 to-neutral-500",
    media: "/content/speakeasy.png",
  },
  {
    id: "project-2",
    name: "Cultuurbehoud",
    tag: "\u2026preserves culture",
    gradient: "from-neutral-400 to-neutral-700",
  },
  {
    id: "project-3",
    name: "-",
    tag: "coming soon",
    gradient: "from-neutral-200 to-neutral-400",
  },
  {
    id: "project-4",
    name: "23plusone dashboard",
    tag: "\u2026challenges happiness scans",
    gradient: "from-neutral-500 to-neutral-800",
    media: "/content/23plusone-digital-scan.mp4",
  },
  {
    id: "project-5",
    name: "GEO Search",
    tag: "\u2026improves search finds",
    gradient: "from-neutral-300 to-neutral-600",
  },
  {
    id: "project-6",
    name: "-",
    tag: "...",
    gradient: "from-neutral-200 to-neutral-500",
  },
]
