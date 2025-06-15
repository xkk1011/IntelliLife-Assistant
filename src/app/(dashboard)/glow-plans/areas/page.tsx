'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/layout/breadcrumb'
import { GlowArea } from '@/types/glow-plan'
import { glowAreasApi } from '@/lib/api/glow-plans'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const areaSchema = z.object({
  name: z.string().min(1, '部位名称不能为空').max(50, '部位名称不能超过50个字符'),
})

type AreaFormData = z.infer<typeof areaSchema>

export default function GlowAreasPage() {
  const [areas, setAreas] = useState<GlowArea[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingArea, setEditingArea] = useState<GlowArea | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const form = useForm<AreaFormData>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: '',
    },
  })

  // 加载焕肤部位列表
  const loadAreas = async () => {
    try {
      setLoading(true)
      const response = await glowAreasApi.getAreas()
      setAreas(response.data)
    } catch (error) {
      console.error('加载焕肤部位失败:', error)
      toast.error('加载焕肤部位失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAreas()
  }, [])

  // 过滤部位列表
  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 打开创建对话框
  const handleCreate = () => {
    setEditingArea(null)
    form.reset({ name: '' })
    setDialogOpen(true)
  }

  // 打开编辑对话框
  const handleEdit = (area: GlowArea) => {
    setEditingArea(area)
    form.reset({ name: area.name })
    setDialogOpen(true)
  }

  // 删除部位
  const handleDelete = async (area: GlowArea) => {
    if (!confirm(`确定要删除焕肤部位"${area.name}"吗？`)) {
      return
    }

    try {
      await glowAreasApi.deleteArea(area.id)
      toast.success('焕肤部位删除成功')
      loadAreas()
    } catch (error: unknown) {
      console.error('删除焕肤部位失败:', error)
      const errorMessage = error instanceof Error ? error.message : '删除焕肤部位失败'
      toast.error(errorMessage)
    }
  }

  // 提交表单
  const onSubmit = async (data: AreaFormData) => {
    try {
      setSubmitting(true)
      
      if (editingArea) {
        await glowAreasApi.updateArea(editingArea.id, data)
        toast.success('焕肤部位更新成功')
      } else {
        await glowAreasApi.createArea(data)
        toast.success('焕肤部位创建成功')
      }
      
      setDialogOpen(false)
      loadAreas()
    } catch (error: unknown) {
      console.error('保存焕肤部位失败:', error)
      const errorMessage = error instanceof Error ? error.message : '保存焕肤部位失败'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="焕肤部位管理"
        description="管理您的焕肤部位，用于创建焕肤计划时选择"
        showBreadcrumb={false}
      />

      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索焕肤部位..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          添加部位
        </Button>
      </div>

      {filteredAreas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? '没有找到匹配的部位' : '暂无焕肤部位'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm
                  ? '尝试调整搜索条件'
                  : '添加您的第一个焕肤部位，方便创建计划时选择'
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加部位
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAreas.map(area => (
              <Card key={area.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{area.name}</CardTitle>
                      <CardDescription>
                        创建于 {new Date(area.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(area)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(area)}
                        disabled={area._count && area._count.plans > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {area._count && (
                      <>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{area._count.plans}</Badge>
                          <span>个计划</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{area._count.history}</Badge>
                          <span>次记录</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* 创建/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingArea ? '编辑焕肤部位' : '添加焕肤部位'}
            </DialogTitle>
            <DialogDescription>
              {editingArea ? '修改焕肤部位信息' : '添加一个新的焕肤部位'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>部位名称</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例如：面部、腿部、手臂等"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? '保存中...' : editingArea ? '更新' : '添加'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
