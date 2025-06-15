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

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GlowArea, GlowDevice, CreateGlowPlanData } from '@/types/glow-plan'
import { glowPlansApi, glowAreasApi, glowDevicesApi } from '@/lib/api/glow-plans'
import { getBeijingTime } from '@/lib/utils'
import { toast } from 'sonner'

const createGlowPlanSchema = z.object({
  name: z.string().min(1, '计划名称不能为空').max(100, '计划名称不能超过100个字符'),
  areaIds: z.array(z.string()).optional(),
  deviceIds: z.array(z.string()).optional(),
  startDate: z.string().min(1, '开始日期不能为空'),
})

type CreateGlowPlanFormData = z.infer<typeof createGlowPlanSchema>

interface CreateGlowPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateGlowPlanDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateGlowPlanDialogProps) {
  const [loading, setLoading] = useState(false)
  const [areas, setAreas] = useState<GlowArea[]>([])
  const [devices, setDevices] = useState<GlowDevice[]>([])

  const form = useForm<CreateGlowPlanFormData>({
    resolver: zodResolver(createGlowPlanSchema),
    defaultValues: {
      name: '',
      areaIds: [],
      deviceIds: [],
      startDate: getBeijingTime().toISOString().split('T')[0],
    },
  })

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

  const onSubmit = async (data: CreateGlowPlanFormData) => {
    try {
      setLoading(true)

      const createData: CreateGlowPlanData = {
        name: data.name,
        startDate: data.startDate,
        areaIds: data.areaIds?.filter(id => id !== 'none') || [],
        deviceIds: data.deviceIds?.filter(id => id !== 'none') || [],
      }

      await glowPlansApi.createPlan(createData)
      toast.success('焕肤计划创建成功')
      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error: unknown) {
      console.error('创建焕肤计划失败:', error)
      toast.error(error instanceof Error ? error.message : '创建焕肤计划失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建焕肤计划</DialogTitle>
          <DialogDescription>
            创建一个新的焕肤计划，开始您的美肌之旅
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
                          id={`area-${area.id}`}
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
                        <label htmlFor={`area-${area.id}`} className="text-sm">
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
                          id={`device-${device.id}`}
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
                        <label htmlFor={`device-${device.id}`} className="text-sm">
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
                {loading ? '创建中...' : '创建计划'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
