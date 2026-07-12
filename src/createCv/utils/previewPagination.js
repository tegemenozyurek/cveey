import { A4_HEIGHT_PX, MM_TO_PX } from '../constants.js'

/** Usable content height inside each template (px), excluding vertical padding. */
export const CV_PAGE_CONTENT_HEIGHT_PX = {
  'classic-ats': A4_HEIGHT_PX - ((20 + 18) * MM_TO_PX),
  'compact-ats': A4_HEIGHT_PX - ((14 + 16) * MM_TO_PX),
  'modern-sidebar': A4_HEIGHT_PX - (20 * MM_TO_PX),
}

export function getCvPageContentHeight(templateId) {
  return CV_PAGE_CONTENT_HEIGHT_PX[templateId] ?? CV_PAGE_CONTENT_HEIGHT_PX['classic-ats']
}

/**
 * Pack blocks onto pages without splitting a block across pages.
 * Keeps a section group together when it fits on one page. If the complete
 * group is taller than a page, it falls back to item-level page breaks.
 * @param {{ id: string, groupId?: string, height: number }[]} blocks
 * @param {number} pageContentHeight
 * @returns {string[][]}
 */
export function paginatePreviewBlocks(blocks, pageContentHeight) {
  const visible = blocks.filter((block) => block.height > 0)
  if (!visible.length) return [blocks.map((block) => block.id)]

  const pages = []
  let currentPage = []
  let currentHeight = 0

  const units = []
  for (let index = 0; index < visible.length;) {
    const block = visible[index]
    if (!block.groupId) {
      units.push([block])
      index += 1
      continue
    }

    const group = []
    while (index < visible.length && visible[index].groupId === block.groupId) {
      group.push(visible[index])
      index += 1
    }
    units.push(group)
  }

  const placeBlock = (block) => {
    if (currentPage.length > 0 && currentHeight + block.height > pageContentHeight) {
      pages.push(currentPage)
      currentPage = [block.id]
      currentHeight = block.height
    } else {
      currentPage.push(block.id)
      currentHeight += block.height
    }
  }

  for (const unit of units) {
    const unitHeight = unit.reduce((total, block) => total + block.height, 0)

    if (unitHeight <= pageContentHeight) {
      if (currentPage.length > 0 && currentHeight + unitHeight > pageContentHeight) {
        pages.push(currentPage)
        currentPage = []
        currentHeight = 0
      }
      unit.forEach(placeBlock)
      continue
    }

    unit.forEach(placeBlock)
  }

  if (currentPage.length > 0) {
    pages.push(currentPage)
  }

  return pages
}
