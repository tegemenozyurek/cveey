import { Font } from '@react-pdf/renderer'

let fontsRegistered = false

/**
 * Inter (same family as HTML preview) with Latin Ext for Turkish glyphs.
 * Static TTFs from Inter 4.0 under /public/fonts.
 */
export function ensurePdfFonts() {
  if (fontsRegistered) return

  Font.register({
    family: 'CvSans',
    fonts: [
      { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
      { src: '/fonts/Inter-Medium.ttf', fontWeight: 500 },
      { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
      { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
    ],
  })

  // Allow long unbroken strings (e.g. test filler) to wrap like CSS overflow-wrap.
  Font.registerHyphenationCallback((word) => {
    if (word.length <= 12) return [word]
    const chunks = []
    for (let i = 0; i < word.length; i += 8) {
      chunks.push(word.slice(i, i + 8))
    }
    return chunks
  })

  fontsRegistered = true
}
