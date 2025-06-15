'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, MapPin, Smartphone, TrendingUp, Target, Zap, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { PageHeader } from '@/components/layout/breadcrumb'
import { GlowPlan, GlowHistory, getPlanStatusLabel, getPlanStatusColor } from '@/types/glow-plan'
import { glowPlansApi } from '@/lib/api/glow-plans'
import { CompleteGlowPlanDialog } from '@/components/glow-plans/complete-glow-plan-dialog'
import { toast } from 'sonner'

export default function GlowPlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string

  const [plan, setPlan] = useState<GlowPlan | null>(null)
  const [history, setHistory] = useState<GlowHistory[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    averageDuration: 0,
  })
  const [loading, setLoading] = useState(true)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)

  // 加载计划详情和历史记录
  const loadPlanData = useCallback(async () => {
    try {
      setLoading(true)
      const [planResponse, historyResponse] = await Promise.all([
        glowPlansApi.getPlan(planId),
        glowPlansApi.getPlanHistory(planId),
      ])

      setPlan(planResponse.data)
      setHistory(historyResponse.data.history)
      setStats(historyResponse.data.stats)
    } catch (error) {
      console.error('加载计划数据失败:', error)
      toast.error('加载计划数据失败')
      router.push('/glow-plans')
    } finally {
      setLoading(false)
    }
  }, [planId, router])

  useEffect(() => {
    if (planId) {
      loadPlanData()
    }
  }, [planId, loadPlanData])

  // 获取状态颜色
  const getStatusBadgeVariant = (status: string) => {
    const color = getPlanStatusColor(status)
    switch (color) {
      case 'green': return 'default'
      case 'yellow': return 'secondary'
      case 'blue': return 'outline'
      case 'gray': return 'secondary'
      default: return 'default'
    }
  }

  // 格式化时长
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分钟`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
  }

  // 删除历史记录
  const handleDeleteHistory = async (historyId: string) => {
    if (!confirm('确定要删除这条历史记录吗？此操作无法撤销。')) {
      return
    }

    try {
      await glowPlansApi.deleteHistory(historyId)
      toast.success('历史记录删除成功')
      loadPlanData() // 重新加载数据
    } catch (error) {
      console.error('删除历史记录失败:', error)
      toast.error('删除历史记录失败')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-6">
          <div className="h-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          计划不存在
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          您访问的焕肤计划不存在或已被删除
        </p>
        <Button onClick={() => router.push('/glow-plans')}>
          返回计划列表
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={plan.name}
        description="查看焕肤计划的详细信息和历史记录"
        showBreadcrumb={true}
        action={
          <Button
            variant="outline"
            onClick={() => router.push('/glow-plans')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        }
      />

      {/* 计划信息卡片 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription className="mt-2">
                创建于 {new Date(plan.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(plan.status)}>
                {getPlanStatusLabel(plan.status)}
              </Badge>
              {plan.status === 'ACTIVE' && (
                <Button onClick={() => setCompleteDialogOpen(true)}>
                  标记完成
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                开始时间: {new Date(plan.startDate).toLocaleDateString()}
              </span>
            </div>
            {plan.areas && plan.areas.length > 0 && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  部位: {plan.areas.map(pa => pa.area?.name).join('、')}
                </span>
              </div>
            )}
            {plan.devices && plan.devices.length > 0 && (
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  设备: {plan.devices.map(pd => `${pd.device?.name}${pd.device?.model ? ` (${pd.device.model})` : ''}`).join('、')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总完成次数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">次</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总时长</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalDuration > 0 ? formatDuration(stats.totalDuration) : '0分钟'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">累计</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均时长</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageDuration > 0 ? formatDuration(stats.averageDuration) : '0分钟'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">每次</p>
          </CardContent>
        </Card>
      </div>

      {/* 历史记录 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            完成历史
          </CardTitle>
          <CardDescription>
            查看您的焕肤计划完成记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                暂无完成记录，开始您的第一次焕肤之旅吧！
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="space-y-3">
                    {/* 时间和持续时间 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {new Date(record.completedAt).toLocaleString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            weekday: 'short'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.duration && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDuration(record.duration)}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHistory(record.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 完成的部位和设备 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 完成的部位 */}
                      {record.areas && record.areas.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Target className="h-4 w-4 text-blue-500" />
                            完成部位
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {record.areas.map((historyArea) => (
                              <Badge
                                key={historyArea.id}
                                variant="secondary"
                                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              >
                                {historyArea.area?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 使用的设备 */}
                      {record.devices && record.devices.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Zap className="h-4 w-4 text-green-500" />
                            使用设备
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {record.devices.map((historyDevice) => (
                              <Badge
                                key={historyDevice.id}
                                variant="secondary"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              >
                                {historyDevice.device?.name}
                                {historyDevice.device?.model && (
                                  <span className="ml-1 text-xs opacity-75">
                                    ({historyDevice.device.model})
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 备注 */}
                    {record.notes && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">备注：</span>
                          {record.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 完成对话框 */}
      <CompleteGlowPlanDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        plan={plan}
        onSuccess={loadPlanData}
      />
    </div>
  )
}
