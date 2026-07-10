import { A4_HEIGHT_MM, A4_WIDTH_MM } from './constants'

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

export async function exportCvPdfFromRoot(exportRoot, fileName) {
  if (!exportRoot) {
    throw new Error('EXPORT_ROOT_MISSING')
  }

  const pages = Array.from(exportRoot.querySelectorAll('.cv-preview-doc--page'))
  if (!pages.length) {
    throw new Error('EXPORT_PAGES_MISSING')
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index]
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: page.offsetWidth,
      height: page.offsetHeight,
      windowWidth: page.scrollWidth,
      windowHeight: page.scrollHeight,
    })

    const imageData = canvas.toDataURL('image/jpeg', 0.92)
    if (index > 0) {
      pdf.addPage()
    }
    pdf.addImage(imageData, 'JPEG', 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM)
  }

  pdf.save(fileName)
}
