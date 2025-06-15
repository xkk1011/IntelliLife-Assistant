'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Play, Target, TrendingUp, Dumbbell, BarChart3, Eye, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { PageHeader } from '@/components/layout/breadcrumb'
import { FitnessItem, FitnessHistory, UserVideo, getFitnessStatusLabel, getFitnessStatusColor, formatDuration } from '@/types/fitness-plan'
import { fitnessItemsApi } from '@/lib/api/fitness-plans'
import { CompleteFitnessItemDialog } from '@/components/fitness-plans/complete-fitness-item-dialog'
import { VideoPlayer } from '@/components/video/video-player'
import { toast } from 'sonner'

export default function FitnessItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [item, setItem] = useState<FitnessItem | null>(null)
  const [history, setHistory] = useState<FitnessHistory[]>([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    averageDuration: 0,
    totalSets: 0,
    totalReps: 0,
  })
  const [loading, setLoading] = useState(true)
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<UserVideo | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  // 加载运动条目详情和历史记录
  const loadItemData = useCallback(async () => {
    try {
      setLoading(true)
      const [itemResponse, historyResponse] = await Promise.all([
        fitnessItemsApi.getItem(itemId),
        fitnessItemsApi.getItemHistory(itemId),
      ])

      setItem(itemResponse.data)
      setHistory(historyResponse.data.history)
      setStats(historyResponse.data.stats)
    } catch (error) {
      console.error('加载运动条目数据失败:', error)
      toast.error('加载运动条目数据失败')
      router.push('/fitness-plans')
    } finally {
      setLoading(false)
    }
  }, [itemId, router])

  useEffect(() => {
    if (itemId) {
      loadItemData()
    }
  }, [itemId, loadItemData])

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

  // 处理视频预览
  const handleVideoPreview = (video: UserVideo) => {
    setSelectedVideo(video)
    setShowVideoPlayer(true)
  }

  // 关闭视频预览
  const closeVideoPlayer = () => {
    setShowVideoPlayer(false)
    setSelectedVideo(null)
  }

  // 删除历史记录
  const handleDeleteHistory = async (historyId: string) => {
    if (!confirm('确定要删除这条历史记录吗？此操作无法撤销。')) {
      return
    }

    try {
      await fitnessItemsApi.deleteHistory(historyId)
      toast.success('历史记录删除成功')
      loadItemData() // 重新加载数据
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

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          运动条目不存在
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          您访问的运动条目不存在或已被删除
        </p>
        <Button onClick={() => router.push('/fitness-plans')}>
          返回运动列表
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.name}
        description="查看运动条目的详细信息和历史记录"
        showBreadcrumb={false}
        action={
          <Button
            variant="outline"
            onClick={() => router.push('/fitness-plans')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        }
      />

      {/* 运动条目信息卡片 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {item.name}
                {(item.video || (item.videos && item.videos.length > 0)) && (
                  <Play className="h-5 w-5 text-blue-500" />
                )}
                {item.videos && item.videos.length > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    {item.videos.length} 个视频
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                创建于 {new Date(item.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(item.status)}>
                {getFitnessStatusLabel(item.status)}
              </Badge>
              {item.status === 'ACTIVE' && (
                <Button onClick={() => setCompleteDialogOpen(true)}>
                  标记完成
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {item.plannedDuration && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  计划时长: {formatDuration(item.plannedDuration)}
                </span>
              </div>
            )}
            {(item.plannedSets || item.plannedReps) && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  计划量: {item.plannedSets && `${item.plannedSets}组`}
                  {item.plannedSets && item.plannedReps && ' × '}
                  {item.plannedReps && `${item.plannedReps}次`}
                </span>
              </div>
            )}
            {(item.video || (item.videos && item.videos.length > 0)) && (
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-purple-500" />
                <span className="text-sm">
                  已关联 {item.videos && item.videos.length > 0 ? item.videos.length : 1} 个视频
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 关联视频 */}
      {(item.video || (item.videos && item.videos.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              关联视频
            </CardTitle>
            <CardDescription>
              与此运动条目关联的视频文件
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 显示单个视频（向后兼容） */}
              {item.video && !item.videos?.length && (
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Play className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{item.video.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {(item.video.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVideoPreview(item.video)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="ml-1 text-xs">预览</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* 显示多个视频 */}
              {item.videos?.map((videoRelation) => (
                <div key={videoRelation.video.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Play className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{videoRelation.video.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {(videoRelation.video.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVideoPreview(videoRelation.video)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="ml-1 text-xs">预览</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总组数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSets}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">组</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总次数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReps}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">次</p>
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
            查看您的运动条目完成记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                暂无完成记录，开始您的第一次运动吧！
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

                    {/* 运动数据 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 组数和次数 */}
                      {(record.sets || record.reps) && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Dumbbell className="h-4 w-4 text-green-500" />
                            运动量
                          </div>
                          <div className="flex gap-2">
                            {record.sets && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {record.sets} 组
                              </Badge>
                            )}
                            {record.reps && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {record.reps} 次
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 强度指标 */}
                      {record.duration && (record.sets || record.reps) && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <BarChart3 className="h-4 w-4 text-purple-500" />
                            强度指标
                          </div>
                          <div className="flex gap-2">
                            {record.sets && record.duration && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                {Math.round(record.duration / record.sets)}分钟/组
                              </Badge>
                            )}
                            {record.reps && record.duration && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                {Math.round(record.duration * 60 / record.reps)}秒/次
                              </Badge>
                            )}
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

      {/* 视频预览模态框 */}
      {showVideoPlayer && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl mx-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeVideoPlayer}
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
            >
              <X className="h-4 w-4 mr-2" />
              关闭
            </Button>
            <VideoPlayer
              src={selectedVideo.url}
              title={selectedVideo.originalName}
              className="w-full h-[60vh]"
              controls={true}
            />
          </div>
        </div>
      )}

      {/* 完成对话框 */}
      <CompleteFitnessItemDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        item={item}
        onSuccess={loadItemData}
      />
    </div>
  )
}
