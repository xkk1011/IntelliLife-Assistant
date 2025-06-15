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
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Trophy } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn, getBeijingTime } from '@/lib/utils'
import { toast } from 'sonner'
import { FitnessItem } from '@/types/fitness-plan'

// 表单验证schema
const completeFitnessItemSchema = z.object({
  duration: z.number().min(1, '实际时长必须大于0').max(600, '实际时长不能超过600分钟').optional(),
  sets: z.number().min(1, '实际组数必须大于0').max(100, '实际组数不能超过100').optional(),
  reps: z.number().min(1, '实际次数必须大于0').max(1000, '实际次数不能超过1000').optional(),
  notes: z.string().max(500, '备注不能超过500个字符').optional(),
  completedAt: z.date().optional(),
})

type CompleteFitnessItemFormData = z.infer<typeof completeFitnessItemSchema>

interface CompleteFitnessItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  item: FitnessItem | null
}

export function CompleteFitnessItemDialog({
  open,
  onOpenChange,
  onSuccess,
  item,
}: CompleteFitnessItemDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<CompleteFitnessItemFormData>({
    resolver: zodResolver(completeFitnessItemSchema),
    defaultValues: {
      duration: undefined,
      sets: undefined,
      reps: undefined,
      notes: '',
      completedAt: getBeijingTime(),
    },
  })

  // 每次打开对话框时重置完成时间为当前北京时间
  useEffect(() => {
    if (open && item) {
      form.setValue('completedAt', getBeijingTime())
    }
  }, [open, item, form])

  const onSubmit = async (data: CompleteFitnessItemFormData) => {
    if (!item) return

    try {
      setLoading(true)

      const response = await fetch(`/api/fitness-items/${item.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('运动完成记录已保存')
        form.reset()
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(result.error || '保存失败')
      }
    } catch (error) {
      console.error('完成运动条目错误:', error)
      toast.error('保存失败')
    } finally {
      setLoading(false)
    }
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span>完成运动</span>
          </DialogTitle>
          <DialogDescription>
            记录您完成运动&ldquo;{item.name}&rdquo;的详细信息
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 计划信息展示 */}
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-gray-700">计划目标</h4>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                {item.plannedDuration && (
                  <div>
                    <span className="block font-medium">时长</span>
                    <span>{item.plannedDuration}分钟</span>
                  </div>
                )}
                {item.plannedSets && (
                  <div>
                    <span className="block font-medium">组数</span>
                    <span>{item.plannedSets}组</span>
                  </div>
                )}
                {item.plannedReps && (
                  <div>
                    <span className="block font-medium">次数</span>
                    <span>{item.plannedReps}次</span>
                  </div>
                )}
              </div>
            </div>

            {/* 实际完成情况 */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>实际时长（分钟）</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={item.plannedDuration?.toString() || "30"}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>实际组数</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={item.plannedSets?.toString() || "3"}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>实际次数</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={item.plannedReps?.toString() || "15"}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="completedAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>完成时间</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: zhCN })
                          ) : (
                            <span>选择日期</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > getBeijingTime() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="记录运动感受、注意事项等"
                      className="min-h-[80px]"
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
                {loading ? '保存中...' : '完成运动'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
