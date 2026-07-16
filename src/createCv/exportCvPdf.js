import { renderCvPdfBlob, downloadCvPdfBlob } from './pdf/renderCvPdf'

export function buildCvPdfFileName(fullName) {
  const sanitized = String(fullName || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  return `${sanitized || 'CV'}.pdf`
}

/**
 * Build a selectable text PDF from CV data via @react-pdf/renderer.
 * Preview stays HTML/CSS; export uses the same document state.
 */
export async function exportCvPdfBlobFromDocument({
  document,
  t,
  visibleSectionIds,
  fieldVisibility,
}) {
  return renderCvPdfBlob({
    document,
    t,
    visibleSectionIds,
    fieldVisibility,
  })
}

export async function exportCvPdfFromDocument(options, fileName) {
  const blob = await exportCvPdfBlobFromDocument(options)
  await downloadCvPdfBlob(blob, fileName)
}

/** @deprecated DOM screenshot path — kept only if something still imports it. */
export async function exportCvPdfBlobFromRoot() {
  throw new Error('DOM_PDF_EXPORT_REMOVED')
}

/** @deprecated DOM screenshot path — kept only if something still imports it. */
export async function exportCvPdfFromRoot() {
  throw new Error('DOM_PDF_EXPORT_REMOVED')
}
