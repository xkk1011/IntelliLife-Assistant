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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { GlowPlan, CompleteGlowPlanData } from '@/types/glow-plan'
import { glowPlansApi } from '@/lib/api/glow-plans'
import { getBeijingTime } from '@/lib/utils'
import { toast } from 'sonner'

const completeGlowPlanSchema = z.object({
  duration: z.string().optional().transform((val) => {
    if (!val || val === '') return undefined
    const num = parseInt(val)
    return isNaN(num) ? undefined : num
  }),
  notes: z.string().max(500, '备注不能超过500个字符').optional(),
  completedAt: z.string().min(1, '完成时间不能为空'),
  areaIds: z.array(z.string()).optional(),
  deviceIds: z.array(z.string()).optional(),
})

type CompleteGlowPlanFormData = z.infer<typeof completeGlowPlanSchema>

interface CompleteGlowPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: GlowPlan
  onSuccess: () => void
}

export function CompleteGlowPlanDialog({
  open,
  onOpenChange,
  plan,
  onSuccess,
}: CompleteGlowPlanDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<CompleteGlowPlanFormData>({
    resolver: zodResolver(completeGlowPlanSchema),
    defaultValues: {
      duration: '',
      notes: '',
      completedAt: getBeijingTime().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
      areaIds: plan.areas?.map(a => a.areaId) || [],
      deviceIds: plan.devices?.map(d => d.deviceId) || [],
    },
  })

  // 每次打开对话框时重置完成时间为当前北京时间
  useEffect(() => {
    if (open) {
      form.setValue('completedAt', getBeijingTime().toISOString().slice(0, 16))
    }
  }, [open, form])

  const onSubmit = async (data: CompleteGlowPlanFormData) => {
    try {
      setLoading(true)

      const completeData: CompleteGlowPlanData = {
        completedAt: data.completedAt,
        areaIds: data.areaIds || [],
        deviceIds: data.deviceIds || [],
      }

      if (data.duration !== undefined) {
        completeData.duration = data.duration
      }

      if (data.notes) {
        completeData.notes = data.notes
      }

      await glowPlansApi.completePlan(plan.id, completeData)
      toast.success('焕肤计划完成记录已保存')
      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error: unknown) {
      console.error('标记焕肤计划完成失败:', error)
      const errorMessage = error instanceof Error ? error.message : '标记焕肤计划完成失败'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>标记完成</DialogTitle>
          <DialogDescription>
            记录您完成焕肤计划&ldquo;{plan.name}&rdquo;的详细信息
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="completedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>完成时间</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>持续时长（分钟）</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="例如：30"
                      min="1"
                      max="480"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 完成的部位选择 */}
            {plan.areas && plan.areas.length > 0 && (
              <FormField
                control={form.control}
                name="areaIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>完成的部位</FormLabel>
                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                      {plan.areas.map(planArea => (
                        <div key={planArea.areaId} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`complete-area-${planArea.areaId}`}
                            checked={field.value?.includes(planArea.areaId) || false}
                            onChange={(e) => {
                              const currentValues = field.value || []
                              if (e.target.checked) {
                                field.onChange([...currentValues, planArea.areaId])
                              } else {
                                field.onChange(currentValues.filter(id => id !== planArea.areaId))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`complete-area-${planArea.areaId}`} className="text-sm">
                            {planArea.area?.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 使用的设备选择 */}
            {plan.devices && plan.devices.length > 0 && (
              <FormField
                control={form.control}
                name="deviceIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>使用的设备</FormLabel>
                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                      {plan.devices.map(planDevice => (
                        <div key={planDevice.deviceId} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`complete-device-${planDevice.deviceId}`}
                            checked={field.value?.includes(planDevice.deviceId) || false}
                            onChange={(e) => {
                              const currentValues = field.value || []
                              if (e.target.checked) {
                                field.onChange([...currentValues, planDevice.deviceId])
                              } else {
                                field.onChange(currentValues.filter(id => id !== planDevice.deviceId))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`complete-device-${planDevice.deviceId}`} className="text-sm">
                            {planDevice.device?.name} {planDevice.device?.model && `(${planDevice.device.model})`}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注（可选）</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="记录您的感受、效果或其他备注..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <div className="text-sm">
                <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  计划信息
                </div>
                <div className="text-blue-700 dark:text-blue-300 space-y-1">
                  <div>计划名称: {plan.name}</div>
                  {plan.areas && plan.areas.length > 0 && (
                    <div>
                      焕肤部位: {plan.areas.map(a => a.area?.name).join(', ')}
                    </div>
                  )}
                  {plan.devices && plan.devices.length > 0 && (
                    <div>
                      使用设备: {plan.devices.map(d => `${d.device?.name}${d.device?.model ? ` (${d.device.model})` : ''}`).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>

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
                {loading ? '保存中...' : '保存完成记录'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
