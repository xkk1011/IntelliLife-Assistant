'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Video,
  Trash2,
  Play,

  HardDrive,
  Eye,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VideoUploadDialog } from './video-upload-dialog'
import { VideoPlayer } from '@/components/video/video-player'
import { UserVideo } from '@/types/fitness-plan'
import { videosApi } from '@/lib/api/videos'

export function VideosList() {
  const [videos, setVideos] = useState<UserVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<UserVideo | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  // 加载视频列表
  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await videosApi.getVideos()
      setVideos(response.data.videos)
    } catch (error) {
      console.error('加载视频失败:', error)
      toast.error('加载视频失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [])

  // 过滤视频列表
  const filteredVideos = videos.filter(video =>
    video.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 删除视频
  const handleDelete = async (video: UserVideo) => {
    if (!confirm(`确定要删除视频"${video.originalName}"吗？`)) {
      return
    }

    try {
      await videosApi.deleteVideo(video.id)
      toast.success('视频删除成功')
      loadVideos()
    } catch (error: unknown) {
      console.error('删除视频失败:', error)
      toast.error(error instanceof Error ? error.message : '删除视频失败')
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
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
              placeholder="搜索视频..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          上传视频
        </Button>
      </div>

      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Video className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm ? '没有找到匹配的视频' : '暂无运动视频'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm
                  ? '尝试调整搜索条件'
                  : '上传您的第一个运动视频，方便创建计划时选择'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  上传视频
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVideos.map(video => (
            <Card key={video.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    {/* 视频缩略图或图标 */}
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                      <video
                        src={video.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        onError={() => {
                          // 如果视频加载失败，显示默认图标
                          console.log('视频预览加载失败:', video.originalName)
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {video.originalName}
                        <Play className="h-4 w-4 text-blue-500" />
                      </CardTitle>
                      <CardDescription className="mt-1">
                        上传于 {new Date(video.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVideoPreview(video)}
                      title="预览视频"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(video)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    <span>{formatFileSize(video.size)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">{video.mimeType}</Badge>
                  </div>
                  {video._count && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">{video._count.fitnessItems}</Badge>
                      <span>个计划使用</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      {/* 视频上传对话框 */}
      <VideoUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={() => {
          loadVideos()
          setUploadDialogOpen(false)
        }}
      />
    </div>
  )
}
