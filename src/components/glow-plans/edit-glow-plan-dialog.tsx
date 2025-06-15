'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GlowPlan, GlowArea, GlowDevice, UpdateGlowPlanData, PLAN_STATUS_OPTIONS } from '@/types/glow-plan'
import { glowPlansApi, glowAreasApi, glowDevicesApi } from '@/lib/api/glow-plans'
import { toast } from 'sonner'

const editGlowPlanSchema = z.object({
  name: z.string().min(1, '计划名称不能为空').max(100, '计划名称不能超过100个字符'),
  areaIds: z.array(z.string()).optional(),
  deviceIds: z.array(z.string()).optional(),
  startDate: z.string().min(1, '开始日期不能为空'),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']),
})

type EditGlowPlanFormData = z.infer<typeof editGlowPlanSchema>

interface EditGlowPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: GlowPlan
  onSuccess: () => void
}

export function EditGlowPlanDialog({
  open,
  onOpenChange,
  plan,
  onSuccess,
}: EditGlowPlanDialogProps) {
  const [loading, setLoading] = useState(false)
  const [areas, setAreas] = useState<GlowArea[]>([])
  const [devices, setDevices] = useState<GlowDevice[]>([])

  const form = useForm<EditGlowPlanFormData>({
    resolver: zodResolver(editGlowPlanSchema),
    defaultValues: {
      name: plan.name,
      areaIds: plan.areas?.map(a => a.areaId) || [],
      deviceIds: plan.devices?.map(d => d.deviceId) || [],
      startDate: new Date(plan.startDate).toISOString().split('T')[0],
      status: plan.status,
    },
  })

  // 当计划变化时重置表单
  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        areaIds: plan.areas?.map(a => a.areaId) || [],
        deviceIds: plan.devices?.map(d => d.deviceId) || [],
        startDate: new Date(plan.startDate).toISOString().split('T')[0],
        status: plan.status,
      })
    }
  }, [plan, form])

  // 加载部位和设备列表
  useEffect(() => {
    if (open) {
      loadAreasAndDevices()
    }
  }, [open])

  const loadAreasAndDevices = async () => {
    try {
      const [areasResponse, devicesResponse] = await Promise.all([
        glowAreasApi.getAreas(),
        glowDevicesApi.getDevices(),
      ])
      setAreas(areasResponse.data)
      setDevices(devicesResponse.data)
    } catch (error) {
      console.error('加载部位和设备失败:', error)
      toast.error('加载数据失败')
    }
  }

  const onSubmit = async (data: EditGlowPlanFormData) => {
    try {
      setLoading(true)

      const updateData: UpdateGlowPlanData = {
        name: data.name,
        startDate: data.startDate,
        status: data.status,
        areaIds: data.areaIds || [],
        deviceIds: data.deviceIds || [],
      }

      await glowPlansApi.updatePlan(plan.id, updateData)
      toast.success('焕肤计划更新成功')
      onOpenChange(false)
      onSuccess()
    } catch (error: unknown) {
      console.error('更新焕肤计划失败:', error)
      const errorMessage = error instanceof Error ? error.message : '更新焕肤计划失败'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑焕肤计划</DialogTitle>
          <DialogDescription>
            修改焕肤计划的信息和设置
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>计划名称</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：夏季腿部护理"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areaIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>焕肤部位（可选）</FormLabel>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {areas.map(area => (
                      <div key={area.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-area-${area.id}`}
                          checked={field.value?.includes(area.id) || false}
                          onChange={(e) => {
                            const currentValues = field.value || []
                            if (e.target.checked) {
                              field.onChange([...currentValues, area.id])
                            } else {
                              field.onChange(currentValues.filter(id => id !== area.id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`edit-area-${area.id}`} className="text-sm">
                          {area.name}
                        </label>
                      </div>
                    ))}
                    {areas.length === 0 && (
                      <p className="text-sm text-gray-500">暂无部位，请先添加部位</p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deviceIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>焕肤设备（可选）</FormLabel>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {devices.map(device => (
                      <div key={device.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-device-${device.id}`}
                          checked={field.value?.includes(device.id) || false}
                          onChange={(e) => {
                            const currentValues = field.value || []
                            if (e.target.checked) {
                              field.onChange([...currentValues, device.id])
                            } else {
                              field.onChange(currentValues.filter(id => id !== device.id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`edit-device-${device.id}`} className="text-sm">
                          {device.name} {device.model && `(${device.model})`}
                        </label>
                      </div>
                    ))}
                    {devices.length === 0 && (
                      <p className="text-sm text-gray-500">暂无设备，请先添加设备</p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>开始日期</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>计划状态</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PLAN_STATUS_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '更新中...' : '更新计划'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
