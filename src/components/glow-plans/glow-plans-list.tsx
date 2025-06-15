'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GlowPlan, PLAN_STATUS_OPTIONS, getPlanStatusLabel, getPlanStatusColor } from '@/types/glow-plan'
import { glowPlansApi } from '@/lib/api/glow-plans'
import { CreateGlowPlanDialog } from './create-glow-plan-dialog'
import { EditGlowPlanDialog } from './edit-glow-plan-dialog'
import { CompleteGlowPlanDialog } from './complete-glow-plan-dialog'
import { toast } from 'sonner'

export function GlowPlansList() {
  const router = useRouter()
  const [plans, setPlans] = useState<GlowPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<GlowPlan | null>(null)

  // 加载焕肤计划列表
  const loadPlans = useCallback(async () => {
    try {
      setLoading(true)
      const response = await glowPlansApi.getPlans({
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setPlans(response.data.plans)
    } catch (error) {
      console.error('加载焕肤计划失败:', error)
      toast.error('加载焕肤计划失败')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  // 过滤计划
  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.area?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.device?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 删除计划
  const handleDeletePlan = async (plan: GlowPlan) => {
    if (!confirm(`确定要删除焕肤计划"${plan.name}"吗？`)) {
      return
    }

    try {
      await glowPlansApi.deletePlan(plan.id)
      toast.success('焕肤计划删除成功')
      loadPlans()
    } catch (error) {
      console.error('删除焕肤计划失败:', error)
      toast.error('删除焕肤计划失败')
    }
  }

  // 编辑计划
  const handleEditPlan = (plan: GlowPlan) => {
    setSelectedPlan(plan)
    setEditDialogOpen(true)
  }

  // 标记完成
  const handleCompletePlan = (plan: GlowPlan) => {
    setSelectedPlan(plan)
    setCompleteDialogOpen(true)
  }

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索焕肤计划..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {PLAN_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建计划
        </Button>
      </div>

      {/* 计划列表 */}
      {filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || statusFilter !== 'all' ? '没有找到匹配的计划' : '暂无焕肤计划'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? '尝试调整搜索条件或筛选器' 
                  : '创建您的第一个焕肤计划，开始您的美肌之旅'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建计划
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPlans.map(plan => (
            <Card key={plan.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {plan.areas && plan.areas.length > 0 && (
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          {plan.areas.map(pa => pa.area?.name).join('、')}
                        </span>
                      )}
                      {plan.devices && plan.devices.length > 0 && (
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {plan.devices.map(pd => pd.device?.name).join('、')}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(plan.status)}>
                      {getPlanStatusLabel(plan.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/glow-plans/${plan.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑计划
                        </DropdownMenuItem>
                        {plan.status === 'ACTIVE' && (
                          <DropdownMenuItem onClick={() => handleCompletePlan(plan)}>
                            <Check className="h-4 w-4 mr-2" />
                            标记完成
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeletePlan(plan)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除计划
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex gap-4">
                    <span>开始时间: {new Date(plan.startDate).toLocaleDateString()}</span>
                    {plan._count && (
                      <>
                        <span>完成次数: {plan._count.history}</span>
                        <span>提醒数: {plan._count.reminders}</span>
                      </>
                    )}
                  </div>
                  <span>创建于 {new Date(plan.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 对话框 */}
      <CreateGlowPlanDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadPlans}
      />

      {selectedPlan && (
        <>
          <EditGlowPlanDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            plan={selectedPlan}
            onSuccess={loadPlans}
          />
          <CompleteGlowPlanDialog
            open={completeDialogOpen}
            onOpenChange={setCompleteDialogOpen}
            plan={selectedPlan}
            onSuccess={loadPlans}
          />
        </>
      )}
    </div>
  )
}
