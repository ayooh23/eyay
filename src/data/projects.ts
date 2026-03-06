export interface Project {
  id: string
  name: string
  tag: string
  gradient: string // Tailwind gradient classes as placeholder
  url?: string
}

export const projects: Project[] = [
  {
    id: "project-1",
    name: "Vaultflow",
    tag: "fintech dashboard",
    gradient: "from-violet-600 to-indigo-900",
  },
  {
    id: "project-2",
    name: "Mosaic",
    tag: "generative art tool",
    gradient: "from-emerald-500 to-teal-800",
  },
  {
    id: "project-3",
    name: "Pulse",
    tag: "health tracker",
    gradient: "from-rose-500 to-pink-900",
  },
  {
    id: "project-4",
    name: "Onyx",
    tag: "e-commerce platform",
    gradient: "from-amber-500 to-orange-800",
  },
  {
    id: "project-5",
    name: "Arclight",
    tag: "creative portfolio",
    gradient: "from-cyan-400 to-blue-900",
  },
  {
    id: "project-6",
    name: "Terrain",
    tag: "real estate app",
    gradient: "from-lime-400 to-green-800",
  },
]
