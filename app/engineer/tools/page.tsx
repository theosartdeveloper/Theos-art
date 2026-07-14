'use client'

import { EngineerPageFrame } from '@/components/engineer/engineer-page-frame'
import { StudioToolsPlaceholder } from '@/components/tools/studio-tools-placeholder'

export default function EngineerToolsPage() {
  return (
    <EngineerPageFrame
      title="Studio tools"
      description="Creative helpers for the Theos Art community — coming soon."
    >
      <div className="max-w-3xl">
        <StudioToolsPlaceholder showBrowseCta={false} />
      </div>
    </EngineerPageFrame>
  )
}
