export function PreviewPageBlock({ id, children }) {
  if (!children) return null

  return (
    <div data-cv-page-block={id} className="cv-preview-page-block">
      {children}
    </div>
  )
}
