'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { VideoPlayer } from './video-player'
import { 
  Play, 
  Trash2, 
  Download, 
  Eye,
  Calendar,
  FileVideo,
  Upload
} from 'lucide-react'
import { formatBytes, formatBeijingTime } from '@/lib/utils'
import { toast } from 'sonner'

interface Video {
  id: string
  filename: string
  originalName: string
  url: string
  size: number
  mimeType: string
  createdAt: string
  _count: {
    fitnessItems: number
  }
}

interface VideoListProps {
  onVideoSelect?: (video: Video) => void
  onMultipleVideoSelect?: (videos: Video[]) => void
  selectable?: boolean
  multiSelect?: boolean
  selectedVideos?: Video[]
  showUpload?: boolean
}

export function VideoList({
  onVideoSelect,
  onMultipleVideoSelect,
  selectable = false,
  multiSelect = false,
  selectedVideos = [],
  showUpload = true
}: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [internalSelectedVideos, setInternalSelectedVideos] = useState<Video[]>(selectedVideos)

  // 加载视频列表
  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/upload/video')
      const result = await response.json()

      if (result.success) {
        setVideos(result.data.videos)
      } else {
        toast.error(result.error || '加载视频列表失败')
      }
    } catch (error) {
      console.error('加载视频列表错误:', error)
      toast.error('加载视频列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [])

  // 删除视频
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('确定要删除这个视频吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('视频删除成功')
        loadVideos() // 重新加载列表
      } else {
        toast.error(result.error || '删除视频失败')
      }
    } catch (error) {
      console.error('删除视频错误:', error)
      toast.error('删除视频失败')
    }
  }

  // 播放视频
  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video)
    setShowPlayer(true)
  }

  // 选择视频
  const handleSelectVideo = (video: Video) => {
    if (selectable && !multiSelect && onVideoSelect) {
      onVideoSelect(video)
    } else if (!selectable) {
      handlePlayVideo(video)
    }
  }

  // 预览视频（在选择模式下也能预览）
  const handlePreviewVideo = (video: Video) => {
    handlePlayVideo(video)
  }

  // 多选视频处理
  const handleMultiSelectVideo = (video: Video, checked: boolean) => {
    let newSelectedVideos: Video[]

    if (checked) {
      newSelectedVideos = [...internalSelectedVideos, video]
    } else {
      newSelectedVideos = internalSelectedVideos.filter(v => v.id !== video.id)
    }

    setInternalSelectedVideos(newSelectedVideos)

    if (onMultipleVideoSelect) {
      onMultipleVideoSelect(newSelectedVideos)
    }
  }

  // 检查视频是否已选中
  const isVideoSelected = (video: Video) => {
    return internalSelectedVideos.some(v => v.id === video.id)
  }

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    const newSelectedVideos = checked ? [...videos] : []
    setInternalSelectedVideos(newSelectedVideos)

    if (onMultipleVideoSelect) {
      onMultipleVideoSelect(newSelectedVideos)
    }
  }

  // 检查是否全选
  const isAllSelected = videos.length > 0 && internalSelectedVideos.length === videos.length

  // 下载视频
  const handleDownloadVideo = (video: Video) => {
    const link = document.createElement('a')
    link.href = video.url
    link.download = video.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">加载视频列表中...</p>
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <FileVideo className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无视频</h3>
          <p className="text-gray-500 text-center mb-4">
            您还没有上传任何视频文件
          </p>
          {showUpload && (
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              上传视频
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 视频播放器模态框 */}
      {showPlayer && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl mx-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlayer(false)}
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
            >
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

      {/* 多选模式的头部控制 */}
      {multiSelect && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                id="select-all"
                className="w-5 h-5 border-2 border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </div>
            <label htmlFor="select-all" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
              全选视频
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              {internalSelectedVideos.length} / {videos.length}
            </div>
            <span className="text-sm text-gray-600">已选择</span>
          </div>
        </div>
      )}

      {/* 视频列表 */}
      <div className={`${
        selectable
          ? 'grid grid-cols-1 gap-3 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      }`}>
        {videos.map((video) => (
          <Card key={video.id} className={`group relative overflow-hidden transition-all duration-300 ${
            multiSelect && isVideoSelected(video)
              ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50/50'
              : 'hover:shadow-lg'
          } ${selectable ? 'cursor-pointer border-gray-200' : ''}`}>
            {selectable ? (
              /* 选择模式：横向布局 */
              <div className="flex items-center p-4 gap-4">
                {/* 视频预览缩略图 */}
                <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0 w-24 h-16">
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewVideo(video)}
                      className="text-white hover:bg-white/20 p-1"
                      title="预览视频"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                </div>

                {/* 视频信息 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-800 leading-tight mb-2" title={video.originalName}>
                    {video.originalName}
                  </h3>
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="secondary" className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1">
                      {video.mimeType.split('/')[1].toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500 font-medium">
                      {formatBytes(video.size)}
                    </span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2">
                    {!multiSelect && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectVideo(video)}
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        选择此视频
                      </Button>
                    )}
                    {multiSelect && (
                      <Button
                        variant={isVideoSelected(video) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleMultiSelectVideo(video, !isVideoSelected(video))}
                        className={`font-medium transition-all ${
                          isVideoSelected(video)
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {isVideoSelected(video) ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            已选择
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            选择
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* 复选框 */}
                {multiSelect && (
                  <div className="flex-shrink-0">
                    <Checkbox
                      checked={isVideoSelected(video)}
                      onCheckedChange={(checked) => handleMultiSelectVideo(video, checked as boolean)}
                      className="w-5 h-5 border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </div>
                )}
              </div>
            ) : (
              /* 非选择模式：垂直布局 */
              <>
                <CardHeader className="pb-3 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <CardTitle className="text-sm font-semibold text-gray-800 leading-tight" title={video.originalName}>
                        {video.originalName}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary" className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1">
                          {video.mimeType.split('/')[1].toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500 font-medium">
                          {formatBytes(video.size)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 pb-4">
                  {/* 视频预览 */}
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 overflow-hidden group-hover:shadow-md transition-shadow aspect-video">
                    <video
                      src={video.url}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={() => handleSelectVideo(video)}
                          className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full transition-all duration-200 hover:scale-110"
                          title="播放视频"
                        >
                          <Play className="h-8 w-8" />
                        </Button>
                      </div>
                    </div>

                    {/* 视频时长标签 */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                      视频
                    </div>
                  </div>
                  {/* 视频信息 */}
                  {!selectable && (
                    <div className="space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatBeijingTime(video.createdAt, 'date')}
                      </div>

                      {video._count.fitnessItems > 0 && (
                        <div className="text-xs text-blue-600">
                          已关联 {video._count.fitnessItems} 个运动计划
                        </div>
                      )}
                    </div>
                  )}

                  {/* 操作按钮 */}
                  {!selectable && (
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectVideo(video)}
                      >
                        播放
                      </Button>

                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadVideo(video)}
                          title="下载视频"
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVideo(video.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="删除视频"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
