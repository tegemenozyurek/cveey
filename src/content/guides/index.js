import { groupA } from './groupA.js'
import { groupB } from './groupB.js'
import { groupC } from './groupC.js'

export const guides = [...groupA, ...groupB, ...groupC]

export function listGuides() {
  return guides
}

export function getGuideBySlug(slug) {
  if (!slug) return null
  return guides.find((guide) => guide.slug === slug) || null
}

export function relatedGuides(slug, count = 4) {
  const others = guides.filter((guide) => guide.slug !== slug)
  if (others.length <= count) return others
  const origin = Math.max(0, guides.findIndex((guide) => guide.slug === slug))
  const step = Math.max(1, Math.floor(others.length / count))
  const picked = []
  for (let i = 0; i < others.length && picked.length < count; i += 1) {
    const item = others[(origin + i * step) % others.length]
    if (!picked.includes(item)) picked.push(item)
  }
  return picked
}

export function guideBodyText(copy) {
  if (!copy?.sections) return ''
  return copy.sections
    .flatMap((section) => [
      section.heading,
      ...(section.paragraphs || []),
      ...(section.list || []),
    ])
    .join(' ')
}

export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}
