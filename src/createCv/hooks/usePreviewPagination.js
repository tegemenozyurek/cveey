import { useLayoutEffect, useRef, useState } from 'react'
import { getCvPageContentHeight, paginatePreviewBlocks } from '../utils/previewPagination'

function pagesAreEqual(a, b) {
  if (a.length !== b.length) return false
  return a.every((page, index) => {
    const other = b[index]
    if (page.length !== other.length) return false
    return page.every((id, i) => id === other[i])
  })
}

export function usePreviewPagination(blocks, templateId, onPageCountChange) {
  const measureRef = useRef(null)
  const [pages, setPages] = useState(() => [blocks.map((block) => block.id)])

  const blockSignature = blocks.map((block) => block.id).join('|')

  useLayoutEffect(() => {
    const root = measureRef.current
    if (!root) return undefined

    const measure = () => {
      const blockMap = new Map(blocks.map((block) => [block.id, block]))
      const nodes = root.querySelectorAll('[data-cv-page-block]')
      const heights = Array.from(nodes).map((node) => {
        const id = node.getAttribute('data-cv-page-block')
        return {
          id,
          groupId: blockMap.get(id)?.groupId,
          height: node.offsetHeight,
        }
      })

      const pageContentHeight = getCvPageContentHeight(templateId)
      const nextPages = paginatePreviewBlocks(heights, pageContentHeight)

      setPages((prev) => (pagesAreEqual(prev, nextPages) ? prev : nextPages))
    }

    measure()
    const raf = requestAnimationFrame(measure)

    const observer = new ResizeObserver(measure)
    observer.observe(root)
    Array.from(root.querySelectorAll('[data-cv-page-block]')).forEach((node) => observer.observe(node))

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [blocks, blockSignature, templateId])

  useLayoutEffect(() => {
    onPageCountChange?.(pages.length)
  }, [pages.length, onPageCountChange])

  return { measureRef, pages, pageCount: pages.length }
}
