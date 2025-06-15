'use client'

import { PageHeader } from '@/components/layout/breadcrumb'
import { FitnessItemsList } from '@/components/fitness-plans/fitness-items-list'

export default function FitnessPlansPage() {
  return (
    <div>
      <PageHeader
        title="运动计划"
        description="管理您的个性化运动计划，上传视频和记录进度"
        showBreadcrumb={false}
      />

      <FitnessItemsList />
    </div>
  )
}
