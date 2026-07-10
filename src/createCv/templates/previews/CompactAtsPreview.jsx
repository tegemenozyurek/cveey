import { useMemo } from 'react'
import { buildClassicPreviewBlocks } from './buildPreviewBlocks'
import PaginatedPreviewRenderer from './PaginatedPreviewRenderer'

export default function CompactAtsPreview({
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
      compact: true,
      visibleSectionIds,
      fieldVisibility,
    }),
    [document.content, fieldVisibility, t, visibleSectionIds],
  )

  return (
    <PaginatedPreviewRenderer
      blocks={blocks}
      templateId="compact-ats"
      previewClassName={className}
      ariaLabel={t('createCv.preview.aria')}
      onPageCountChange={onPageCountChange}
      activePreviewPage={activePreviewPage}
      exportMode={exportMode}
    />
  )
}
