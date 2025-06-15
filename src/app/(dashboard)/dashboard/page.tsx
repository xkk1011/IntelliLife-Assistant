'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from '@/components/layout/breadcrumb'
import { dashboardApi } from '@/lib/api/dashboard'
import { DashboardStats } from '@/types/dashboard'
import { RefreshCw, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ExportButtons } from '@/components/dashboard/export-buttons'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // 加载统计数据
  const loadStats = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await dashboardApi.getStats()
      if (response.success) {
        setStats(response.data)
        if (isRefresh) {
          toast.success('数据已刷新')
        }
      } else {
        toast.error(response.error || '获取统计数据失败')
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
      toast.error('加载统计数据失败')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 手动刷新
  const handleRefresh = () => {
    loadStats(true)
  }

  useEffect(() => {
    if (session) {
      loadStats()
    }
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`欢迎回来，${session?.user.name || session?.user.email}！`}
        description="这是您的智享生活助手仪表盘"
        showBreadcrumb={false}
        action={
          <div className="flex gap-2">
            <ExportButtons />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              刷新数据
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>焕肤计划</CardTitle>
            <CardDescription>管理您的焕肤护理计划</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.glowPlans.active || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              个活跃计划 / 共{stats?.glowPlans.total || 0}个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>运动计划</CardTitle>
            <CardDescription>管理您的运动健身计划</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.fitnessItems.active || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              个活跃条目 / 共{stats?.fitnessItems.total || 0}个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>提醒</CardTitle>
            <CardDescription>查看您的提醒通知</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.notifications.unread || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">条未读通知</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>活跃提醒</CardTitle>
            <CardDescription>您设置的提醒统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>焕肤提醒:</span>
                <span className="font-medium">{stats?.reminders.glow || 0}个</span>
              </div>
              <div className="flex justify-between">
                <span>运动提醒:</span>
                <span className="font-medium">{stats?.reminders.fitness || 0}个</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">总计:</span>
                <span className="font-bold">{stats?.reminders.total || 0}个</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>用户信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>邮箱:</strong> {session?.user.email}</p>
              <p><strong>姓名:</strong> {session?.user.name || "未设置"}</p>
              <p><strong>角色:</strong> {session?.user.role}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
