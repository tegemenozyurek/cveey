/** mm → PDF points (1mm ≈ 2.83465pt) */
export const mm = (value) => value * 2.83465

/**
 * Scandi ATS PDF tokens — mirrored from `.cv-preview-doc--scandi` in App.css.
 * Slightly tighter than CSS on purpose: react-pdf line boxes run a bit taller
 * than browser Inter, so 1:1 mm still pushed short CVs onto page 2.
 */
export const PDF_TOKENS = {
  page: {
    width: 'A4',
    // Preview: padding 16mm 16mm 14mm
    paddingTop: mm(15),
    paddingBottom: mm(12),
    paddingHorizontal: mm(15),
  },
  color: {
    text: '#374151',
    heading: '#111827',
    entry: '#1f2937',
    muted: '#4b5563',
    soft: '#6b7280',
    rule: '#e5e7eb',
  },
  font: {
    family: 'CvSans',
    name: 22,
    title: 11.5,
    section: 9,
    body: 10,
    entryHead: 10.5,
    entryText: 9.5,
    meta: 8.5,
    contact: 9,
    small: 8.5,
  },
  space: {
    // Preview header: pad-bottom 3mm, margin-bottom 3.5mm
    headerPadBottom: mm(2.8),
    headerBottom: mm(3),
    // Preview section margin-top 3.5mm
    sectionTop: mm(3),
    // Preview title: pad-bottom 1.2mm, margin-bottom 2mm
    sectionTitlePadBottom: mm(1.1),
    sectionTitleBottom: mm(1.8),
    // Preview entry margin-bottom 2.5mm
    entryBottom: mm(2.2),
    nameBottom: mm(1),
    titleBottom: mm(1.8),
  },
  line: {
    body: 1.34,
    summary: 1.38,
    name: 1.12,
  },
}
