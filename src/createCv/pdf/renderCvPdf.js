import { createElement } from 'react'

/**
 * Generate a real text PDF blob from CV document data (not a screenshot).
 * Dynamically loads @react-pdf so the main app bundle stays lean.
 */
export async function renderCvPdfBlob({
  document,
  t,
  visibleSectionIds = [],
  fieldVisibility = {},
}) {
  const [{ pdf }, { ensurePdfFonts }, { default: ScandiAtsPdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./fonts'),
    import('./ScandiAtsPdfDocument'),
  ])

  ensurePdfFonts()

  const element = createElement(ScandiAtsPdfDocument, {
    document,
    t,
    visibleSectionIds,
    fieldVisibility,
  })

  return pdf(element).toBlob()
}

export async function downloadCvPdfBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
