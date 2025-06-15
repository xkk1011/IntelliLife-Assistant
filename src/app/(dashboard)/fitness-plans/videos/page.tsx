'use client'

import { PageHeader } from '@/components/layout/breadcrumb'
import { VideosList } from '@/components/fitness-plans/videos-list'

export default function FitnessVideosPage() {
  return (
    <div>
      <PageHeader
        title="视频管理"
        description="管理您的运动视频，用于创建运动计划时选择"
        showBreadcrumb={false}
      />

      <VideosList />
    </div>
  )
}
