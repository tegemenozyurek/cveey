import { useMemo } from 'react'
import { buildSidebarPreviewBlocks } from './buildPreviewBlocks'
import PaginatedPreviewRenderer from './PaginatedPreviewRenderer'

export default function ModernSidebarPreview({
  document,
  t,
  className,
  onPageCountChange,
  activePreviewPage = 0,
  exportMode = false,
  visibleSectionIds,
  fieldVisibility,
}) {
  const previewData = useMemo(
    () => buildSidebarPreviewBlocks({
      content: document.content,
      t,
      visibleSectionIds,
      fieldVisibility,
    }),
    [document.content, fieldVisibility, t, visibleSectionIds],
  )

  return (
    <PaginatedPreviewRenderer
      blocks={previewData.blocks}
      templateId="modern-sidebar"
      previewClassName={className}
      layout="sidebar"
      renderSidebar={previewData.renderSidebar}
      ariaLabel={t('createCv.preview.aria')}
      onPageCountChange={onPageCountChange}
      activePreviewPage={activePreviewPage}
      exportMode={exportMode}
    />
  )
}
