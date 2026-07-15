import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

/** Firestore string/document size için güvenli üst sınır (~100k karakter). */
export const MAX_EXTRACTED_TEXT_LENGTH = 100_000

GlobalWorkerOptions.workerSrc = pdfWorker

/**
 * PDF dosyasından düz metin çıkarır.
 * @param {Blob | ArrayBuffer | Uint8Array} source
 * @returns {Promise<string>}
 */
export async function extractTextFromPdf(source) {
  const data = source instanceof ArrayBuffer || ArrayBuffer.isView(source)
    ? source
    : await source.arrayBuffer()

  const pdf = await getDocument({ data, useSystemFonts: true }).promise
  const pages = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    const line = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/[ \t]+/g, ' ')
      .trim()
    if (line) pages.push(line)
  }

  return normalizeExtractedText(pages.join('\n'))
}

export function normalizeExtractedText(text) {
  const cleaned = String(text ?? '')
    .replace(/\u0000/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (cleaned.length <= MAX_EXTRACTED_TEXT_LENGTH) return cleaned
  return cleaned.slice(0, MAX_EXTRACTED_TEXT_LENGTH)
}
