'use client'


import { PageHeader } from '@/components/layout/breadcrumb'
import { GlowPlansList } from '@/components/glow-plans/glow-plans-list'

export default function GlowPlansPage() {
  return (
    <div>
      <PageHeader
        title="焕肤计划"
        description="管理您的个性化焕肤计划，设置提醒和记录进度"
        showBreadcrumb={false}
      />

      <GlowPlansList />
    </div>
  )
}
