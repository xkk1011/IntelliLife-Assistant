'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, MoreHorizontal, Eye, Play, Clock, Target, Edit, Check, Trash2 } from 'lucide-react'
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
import { 
  FitnessItem, 
  FITNESS_STATUS_OPTIONS, 
  getFitnessStatusLabel, 
  getFitnessStatusColor,
  formatDuration 
} from '@/types/fitness-plan'
import { fitnessItemsApi } from '@/lib/api/fitness-plans'
import { CreateFitnessItemDialog } from './create-fitness-item-dialog'
import { EditFitnessItemDialog } from './edit-fitness-item-dialog'
import { CompleteFitnessItemDialog } from './complete-fitness-item-dialog'
import { toast } from 'sonner'

export function FitnessItemsList() {
  const router = useRouter()
  const [items, setItems] = useState<FitnessItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FitnessItem | null>(null)

  // 加载运动条目列表
  const loadItems = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fitnessItemsApi.getItems({
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setItems(response.data.items)
    } catch (error) {
      console.error('加载运动条目失败:', error)
      toast.error('加载运动条目失败')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  // 过滤条目
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 删除条目
  const handleDeleteItem = async (item: FitnessItem) => {
    if (!confirm(`确定要删除运动条目"${item.name}"吗？`)) {
      return
    }

    try {
      await fitnessItemsApi.deleteItem(item.id)
      toast.success('运动条目删除成功')
      loadItems()
    } catch (error) {
      console.error('删除运动条目失败:', error)
      toast.error('删除运动条目失败')
    }
  }

  // 编辑条目
  const handleEditItem = (item: FitnessItem) => {
    setSelectedItem(item)
    setEditDialogOpen(true)
  }

  // 标记完成
  const handleCompleteItem = (item: FitnessItem) => {
    setSelectedItem(item)
    setCompleteDialogOpen(true)
  }

  // 获取状态颜色
  const getStatusBadgeVariant = (status: string) => {
    const color = getFitnessStatusColor(status)
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
              placeholder="搜索运动条目..."
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
              {FITNESS_STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建运动
        </Button>
      </div>

      {/* 条目列表 */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || statusFilter !== 'all' ? '没有找到匹配的运动' : '暂无运动条目'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? '尝试调整搜索条件或筛选器' 
                  : '创建您的第一个运动条目，开始您的健身之旅'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建运动
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {item.name}
                      {(item.video || (item.videos && item.videos.length > 0)) && (
                        <Play className="h-4 w-4 text-blue-500" />
                      )}
                      {item.videos && item.videos.length > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          {item.videos.length} 个视频
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      {item.plannedDuration && (
                        <span className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                          <Clock className="h-3 w-3" />
                          {formatDuration(item.plannedDuration)}
                        </span>
                      )}
                      {(item.plannedSets || item.plannedReps) && (
                        <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                          <Target className="h-3 w-3" />
                          {item.plannedSets && `${item.plannedSets}组`}
                          {item.plannedSets && item.plannedReps && ' × '}
                          {item.plannedReps && `${item.plannedReps}次`}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {getFitnessStatusLabel(item.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/fitness-plans/${item.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditItem(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          编辑运动
                        </DropdownMenuItem>
                        {item.status === 'ACTIVE' && (
                          <DropdownMenuItem onClick={() => handleCompleteItem(item)}>
                            <Check className="h-4 w-4 mr-2" />
                            标记完成
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteItem(item)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除运动
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex gap-4">
                    {item._count && (
                      <>
                        <span>完成次数: {item._count.history}</span>
                        <span>提醒数: {item._count.reminders}</span>
                      </>
                    )}
                    {item.video && (
                      <span className="text-blue-600 dark:text-blue-400">
                        已关联视频
                      </span>
                    )}
                  </div>
                  <span>创建于 {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 对话框 */}
      <CreateFitnessItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadItems}
      />

      {selectedItem && (
        <>
          <EditFitnessItemDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={selectedItem}
            onSuccess={loadItems}
          />
          <CompleteFitnessItemDialog
            open={completeDialogOpen}
            onOpenChange={setCompleteDialogOpen}
            item={selectedItem}
            onSuccess={loadItems}
          />
        </>
      )}
    </div>
  )
}
