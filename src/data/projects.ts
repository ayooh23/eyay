export interface Project {
  id: string
  name: string
  tag: string
  gradient: string // Tailwind gradient classes as placeholder
  height: number // image height in px — varies per card
  url?: string
}

export const projects: Project[] = [
  {
    id: "project-1",
    name: "Vaultflow",
    tag: "\u2026promotes evolving language",
    gradient: "from-violet-600 to-indigo-900",
    height: 220,
  },
  {
    id: "project-2",
    name: "Mosaic",
    tag: "\u2026preserves culture",
    gradient: "from-emerald-500 to-teal-800",
    height: 280,
  },
  {
    id: "project-3",
    name: "Pulse",
    tag: "coming soon",
    gradient: "from-rose-500 to-pink-900",
    height: 200,
  },
  {
    id: "project-4",
    name: "Onyx",
    tag: "\u2026challenges happiness scans",
    gradient: "from-amber-500 to-orange-800",
    height: 260,
  },
  {
    id: "project-5",
    name: "Arclight",
    tag: "\u2026improves search finds",
    gradient: "from-cyan-400 to-blue-900",
    height: 240,
  },
  {
    id: "project-6",
    name: "Terrain",
    tag: "coming soon",
    gradient: "from-lime-400 to-green-800",
    height: 190,
  },
]
