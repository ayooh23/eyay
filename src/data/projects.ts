export interface Project {
  id: string
  name: string
  tag: string
  gradient: string // Tailwind gradient classes as placeholder
  height: number // image height in px — varies per card
  shift: "up" | "down" | "left" | "right" // image pan direction on hover
  url?: string
}

export const projects: Project[] = [
  {
    id: "project-1",
    name: "Vaultflow",
    tag: "\u2026promotes evolving language",
    gradient: "from-neutral-300 to-neutral-500",
    height: 220,
    shift: "up",
  },
  {
    id: "project-2",
    name: "Mosaic",
    tag: "\u2026preserves culture",
    gradient: "from-neutral-400 to-neutral-700",
    height: 280,
    shift: "right",
  },
  {
    id: "project-3",
    name: "Pulse",
    tag: "coming soon",
    gradient: "from-neutral-200 to-neutral-400",
    height: 200,
    shift: "down",
  },
  {
    id: "project-4",
    name: "Onyx",
    tag: "\u2026challenges happiness scans",
    gradient: "from-neutral-500 to-neutral-800",
    height: 260,
    shift: "left",
  },
  {
    id: "project-5",
    name: "Arclight",
    tag: "\u2026improves search finds",
    gradient: "from-neutral-300 to-neutral-600",
    height: 240,
    shift: "up",
  },
  {
    id: "project-6",
    name: "Terrain",
    tag: "coming soon",
    gradient: "from-neutral-200 to-neutral-500",
    height: 190,
    shift: "right",
  },
]
