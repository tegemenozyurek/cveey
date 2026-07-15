import { useMemo } from 'react'
import { buildClassicPreviewBlocks } from './buildPreviewBlocks'
import PaginatedPreviewRenderer from './PaginatedPreviewRenderer'

export default function ScandiAtsPreview({
  document,
  t,
  className,
  onPageCountChange,
  activePreviewPage = 0,
  exportMode = false,
  visibleSectionIds,
  fieldVisibility,
}) {
  const blocks = useMemo(
    () => buildClassicPreviewBlocks({
      content: document.content,
      t,
      visibleSectionIds,
      fieldVisibility,
    }),
    [document.content, fieldVisibility, t, visibleSectionIds],
  )

  return (
    <PaginatedPreviewRenderer
      blocks={blocks}
      templateId="scandi-ats"
      previewClassName={className}
      ariaLabel={t('createCv.preview.aria')}
      onPageCountChange={onPageCountChange}
      activePreviewPage={activePreviewPage}
      exportMode={exportMode}
    />
  )
}
