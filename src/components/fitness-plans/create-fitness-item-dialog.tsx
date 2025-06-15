'use client'

import { useState } from 'react'
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
import { VideoList } from '@/components/video/video-list'

import { Switch } from '@/components/ui/switch'
import { X, Video } from 'lucide-react'
import { toast } from 'sonner'
import { UserVideo } from '@/types/fitness-plan'

// 表单验证schema
const createFitnessItemSchema = z.object({
  name: z.string().min(1, '运动名称不能为空').max(100, '运动名称不能超过100个字符'),
  plannedDuration: z.number().min(1, '计划时长必须大于0').max(600, '计划时长不能超过600分钟').optional(),
  plannedSets: z.number().min(1, '计划组数必须大于0').max(100, '计划组数不能超过100').optional(),
  plannedReps: z.number().min(1, '计划次数必须大于0').max(1000, '计划次数不能超过1000').optional(),
  description: z.string().max(500, '描述不能超过500个字符').optional(),
})

type CreateFitnessItemFormData = z.infer<typeof createFitnessItemSchema>

interface CreateFitnessItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateFitnessItemDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateFitnessItemDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<UserVideo | null>(null)
  const [selectedVideos, setSelectedVideos] = useState<UserVideo[]>([])
  const [showVideoSelector, setShowVideoSelector] = useState(false)
  const [useMultiSelect, setUseMultiSelect] = useState(false)

  const form = useForm<CreateFitnessItemFormData>({
    resolver: zodResolver(createFitnessItemSchema),
    defaultValues: {
      name: '',
      plannedDuration: undefined,
      plannedSets: undefined,
      plannedReps: undefined,
      description: '',
    },
  })

  const onSubmit = async (data: CreateFitnessItemFormData) => {
    try {
      setLoading(true)

      const submitData = {
        ...data,
        videoId: selectedVideo?.id,
        videoIds: useMultiSelect ? selectedVideos.map(v => v.id) : undefined,
      }

      const response = await fetch('/api/fitness-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('运动条目创建成功')
        form.reset()
        setSelectedVideo(null)
        setSelectedVideos([])
        setUseMultiSelect(false)
        onOpenChange(false)
        onSuccess()
      } else {
        toast.error(result.error || '创建失败')
      }
    } catch (error) {
      console.error('创建运动条目错误:', error)
      toast.error('创建失败')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoSelect = (video: UserVideo) => {
    setSelectedVideo(video)
    setShowVideoSelector(false)
  }

  const handleMultipleVideoSelect = (videos: UserVideo[]) => {
    setSelectedVideos(videos)
  }

  const removeSelectedVideo = (videoId: string) => {
    if (useMultiSelect) {
      setSelectedVideos(prev => prev.filter(v => v.id !== videoId))
    } else {
      setSelectedVideo(null)
    }
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${showVideoSelector ? 'max-w-6xl' : 'max-w-4xl'} max-h-[90vh] overflow-hidden flex flex-col`}>
        <DialogHeader>
          <DialogTitle>创建运动条目</DialogTitle>
          <DialogDescription>
            添加新的运动条目到您的健身计划中
          </DialogDescription>
        </DialogHeader>

        {showVideoSelector ? (
          <div className="space-y-4 flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">选择视频</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={useMultiSelect}
                    onCheckedChange={setUseMultiSelect}
                    id="multi-select"
                  />
                  <label htmlFor="multi-select" className="text-sm">多选模式</label>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowVideoSelector(false)}
                >
                  {useMultiSelect && selectedVideos.length > 0 ? '确认选择' : '取消'}
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <VideoList
                onVideoSelect={useMultiSelect ? undefined : handleVideoSelect}
                onMultipleVideoSelect={useMultiSelect ? handleMultipleVideoSelect : undefined}
                selectable={true}
                multiSelect={useMultiSelect}
                selectedVideos={selectedVideos}
                showUpload={false}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>运动名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入运动名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="plannedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>计划时长（分钟）</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
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
                  name="plannedSets"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>计划组数</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="3"
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
                  name="plannedReps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>计划次数</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="请输入运动描述或注意事项"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 视频选择 */}
              <div className="space-y-3">
                <FormLabel>关联视频（可选）</FormLabel>

                {/* 显示已选择的视频 */}
                {selectedVideos.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        已选择 {selectedVideos.length} 个视频
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVideoSelector(true)}
                      >
                        重新选择
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                      {selectedVideos.map((video) => (
                        <div key={video.id} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="font-medium text-xs">{video.originalName}</p>
                              <p className="text-xs text-gray-500">
                                {(video.size / (1024 * 1024)).toFixed(1)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelectedVideo(video.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedVideo ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Video className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{selectedVideo.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSelectedVideo(selectedVideo.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowVideoSelector(true)}
                    className="w-full"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    选择视频
                  </Button>
                )}
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
                    {loading ? '创建中...' : '创建'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
