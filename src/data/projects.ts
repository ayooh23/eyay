export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:5"

export interface Project {
  id: string
  name: string
  tag: string
  gradient: string
  url?: string
  media?: string // path to image or video in /public/content/
  aspectRatio?: AspectRatio
}

export const projects: Project[] = [
  {
    id: "project-1",
    name: "Speakeasy",
    tag: "…promotes a language that keeps evolving",
    gradient: "from-neutral-300 to-neutral-500",
    media: "/content/speakeasy.png",
    aspectRatio: "4:5",
  },
  {
    id: "project-2",
    name: "BR-ND People",
    tag: "…truly reflects a creative change agency",
    gradient: "from-neutral-400 to-neutral-600",
    media: "/content/Website-Refresh-BR-NDPeople.mp4",
    aspectRatio: "16:9",
  },
  {
    id: "project-3",
    name: "23plusone",
    tag: "…turns happiness scans into actionable insight",
    gradient: "from-neutral-500 to-neutral-800",
    media: "/content/23plusone-digital-scan.mp4",
    aspectRatio: "16:9",
  },
  {
    id: "project-4",
    name: "d+o",
    tag: "…connects people to emergency care faster",
    gradient: "from-neutral-300 to-neutral-600",
    media: "/content/DO-SpoednaarSteun-CV6.jpg",
    aspectRatio: "4:5",
  },
  {
    id: "project-5",
    name: "GEO Search",
    tag: "…improves how people search and find",
    gradient: "from-neutral-400 to-neutral-700",
    aspectRatio: "1:1",
  },
  {
    id: "project-6",
    name: "Cultuurbehoud",
    tag: "…preserves culture for the next generation",
    gradient: "from-neutral-300 to-neutral-500",
    aspectRatio: "1:1",
  },
  {
    id: "project-7",
    name: "workflow tool",
    tag: "…automates what your team does by hand",
    gradient: "from-neutral-200 to-neutral-500",
    aspectRatio: "9:16",
  },
  {
    id: "project-8",
    name: "client portal",
    tag: "…makes your service feel as good as it is",
    gradient: "from-neutral-400 to-neutral-700",
    aspectRatio: "4:5",
  },
  {
    id: "project-9",
    name: "Untangle",
    tag: "…helps users choose action over reassurance?",
    gradient: "from-neutral-300 to-neutral-600",
    aspectRatio: "16:9",
  },
]

// Service descriptors shown as placeholder cards in the gallery (tagKey = i18n key)
export interface GalleryServicePlaceholder {
  type: "service"
  tagKey: string
  aspectRatio: AspectRatio
  gradient: string
}

export const galleryServicePlaceholders: GalleryServicePlaceholder[] = [
  { type: "service", tagKey: "galleryServices.mvp", aspectRatio: "16:9", gradient: "from-neutral-400 to-neutral-600" },
  { type: "service", tagKey: "galleryServices.aiFeature", aspectRatio: "4:5", gradient: "from-neutral-500 to-neutral-700" },
  { type: "service", tagKey: "galleryServices.sprint", aspectRatio: "1:1", gradient: "from-neutral-300 to-neutral-500" },
  { type: "service", tagKey: "galleryServices.retainer", aspectRatio: "9:16", gradient: "from-neutral-400 to-neutral-600" },
  { type: "service", tagKey: "galleryServices.workflows", aspectRatio: "16:9", gradient: "from-neutral-200 to-neutral-500" },
]

export type GalleryItem = { type: "project"; project: Project } | GalleryServicePlaceholder

// Interleave projects with service placeholders: one placeholder for each service, in between projects.
export function getGalleryItems(): GalleryItem[] {
  const items: GalleryItem[] = []
  const services = [...galleryServicePlaceholders]
  projects.forEach((project, i) => {
    items.push({ type: "project", project })
    if (services.length > 0) {
      items.push(services.shift()!)
    }
  })
  return items
}
