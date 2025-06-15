'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Smartphone, Search } from 'lucide-react'
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
import { GlowDevice } from '@/types/glow-plan'
import { glowDevicesApi } from '@/lib/api/glow-plans'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const deviceSchema = z.object({
  name: z.string().min(1, '设备名称不能为空').max(100, '设备名称不能超过100个字符'),
  model: z.string().max(100, '设备型号不能超过100个字符').optional(),
})

type DeviceFormData = z.infer<typeof deviceSchema>

export default function GlowDevicesPage() {
  const [devices, setDevices] = useState<GlowDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<GlowDevice | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const form = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      name: '',
      model: '',
    },
  })

  // 加载焕肤设备列表
  const loadDevices = async () => {
    try {
      setLoading(true)
      const response = await glowDevicesApi.getDevices()
      setDevices(response.data)
    } catch (error) {
      console.error('加载焕肤设备失败:', error)
      toast.error('加载焕肤设备失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDevices()
  }, [])

  // 过滤设备列表
  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (device.model && device.model.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // 打开创建对话框
  const handleCreate = () => {
    setEditingDevice(null)
    form.reset({ name: '', model: '' })
    setDialogOpen(true)
  }

  // 打开编辑对话框
  const handleEdit = (device: GlowDevice) => {
    setEditingDevice(device)
    form.reset({
      name: device.name,
      model: device.model ?? '',
    })
    setDialogOpen(true)
  }

  // 删除设备
  const handleDelete = async (device: GlowDevice) => {
    if (!confirm(`确定要删除焕肤设备"${device.name}"吗？`)) {
      return
    }

    try {
      await glowDevicesApi.deleteDevice(device.id)
      toast.success('焕肤设备删除成功')
      loadDevices()
    } catch (error: unknown) {
      console.error('删除焕肤设备失败:', error)
      const errorMessage = error instanceof Error ? error.message : '删除焕肤设备失败'
      toast.error(errorMessage)
    }
  }

  // 提交表单
  const onSubmit = async (data: DeviceFormData) => {
    try {
      setSubmitting(true)

      const submitData = {
        name: data.name,
        model: data.model?.trim() || '',
      }

      if (editingDevice) {
        await glowDevicesApi.updateDevice(editingDevice.id, submitData)
        toast.success('焕肤设备更新成功')
      } else {
        await glowDevicesApi.createDevice(submitData)
        toast.success('焕肤设备创建成功')
      }

      setDialogOpen(false)
      loadDevices()
    } catch (error: unknown) {
      console.error('保存焕肤设备失败:', error)
      const errorMessage = error instanceof Error ? error.message : '保存焕肤设备失败'
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
        title="焕肤设备管理"
        description="管理您的焕肤设备，用于创建焕肤计划时选择"
        showBreadcrumb={false}
      />

      {/* 工具栏 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索焕肤设备..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          添加设备
        </Button>
      </div>

      {filteredDevices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Smartphone className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? '没有找到匹配的设备' : '暂无焕肤设备'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm
                  ? '尝试调整搜索条件'
                  : '添加您的第一个焕肤设备，方便创建计划时选择'
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加设备
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDevices.map(device => (
              <Card key={device.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                      <CardDescription>
                        {device.model && (
                          <span className="text-blue-600 dark:text-blue-400 mr-2">
                            型号: {device.model}
                          </span>
                        )}
                        创建于 {new Date(device.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(device)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(device)}
                        disabled={device._count && device._count.plans > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {device._count && (
                      <>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{device._count.plans}</Badge>
                          <span>个计划</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">{device._count.history}</Badge>
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
              {editingDevice ? '编辑焕肤设备' : '添加焕肤设备'}
            </DialogTitle>
            <DialogDescription>
              {editingDevice ? '修改焕肤设备信息' : '添加一个新的焕肤设备'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>设备名称</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例如：激光脱毛仪、美容仪等"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>设备型号（可选）</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例如：IPL-2000、Beauty Pro等"
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
                  {submitting ? '保存中...' : editingDevice ? '更新' : '添加'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
