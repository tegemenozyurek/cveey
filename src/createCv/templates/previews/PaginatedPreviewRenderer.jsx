import { usePreviewPagination } from '../../hooks/usePreviewPagination'
import { PreviewPageBlock } from './PreviewPageBlock'

function renderPageBlocks(pageIds, blocks, pageIndex) {
  const blockMap = Object.fromEntries(blocks.map((block) => [block.id, block]))

  return pageIds.map((id) => {
    const block = blockMap[id]
    if (!block) return null

    return (
      <div key={`page-${pageIndex}-${id}`} className="cv-preview-page-block">
        {block.render()}
      </div>
    )
  })
}

export default function PaginatedPreviewRenderer({
  blocks,
  templateId,
  previewClassName,
  layout = 'single',
  renderSidebar,
  ariaLabel,
  onPageCountChange,
  activePreviewPage = 0,
  exportMode = false,
}) {
  const { measureRef, pages } = usePreviewPagination(blocks, templateId, onPageCountChange)

  const measureBody = layout === 'sidebar' ? (
    <div className="cv-preview-layout-sidebar">
      {renderSidebar?.()}
      <div className="cv-preview-main">
        {blocks.map((block) => (
          <PreviewPageBlock key={`measure-${block.id}`} id={block.id}>
            {block.render()}
          </PreviewPageBlock>
        ))}
      </div>
    </div>
  ) : (
    blocks.map((block) => (
      <PreviewPageBlock key={`measure-${block.id}`} id={block.id}>
        {block.render()}
      </PreviewPageBlock>
    ))
  )

  return (
    <>
      <div ref={measureRef} className="cv-preview-measure" aria-hidden="true">
        <article className={`${previewClassName} cv-preview-doc--measure`}>
          {measureBody}
        </article>
      </div>

      <div className="cv-preview-pages" data-cv-export-root="">
        {pages.map((pageIds, index) => {
          const isActive = exportMode || index === activePreviewPage

          return (
            <article
              key={`page-${index}`}
              className={`${previewClassName} cv-preview-doc--page cv-preview-doc--export${isActive ? ' cv-preview-doc--page-active' : ' cv-preview-doc--page-hidden'}`}
              aria-label={ariaLabel}
              aria-hidden={exportMode ? false : !isActive}
              data-cv-page-index={index}
            >
              {layout === 'sidebar' ? (
                <div className="cv-preview-layout-sidebar">
                  {renderSidebar?.()}
                  <div className="cv-preview-main">
                    {renderPageBlocks(pageIds, blocks, index)}
                  </div>
                </div>
              ) : (
                renderPageBlocks(pageIds, blocks, index)
              )}
            </article>
          )
        })}
      </div>
    </>
  )
}
