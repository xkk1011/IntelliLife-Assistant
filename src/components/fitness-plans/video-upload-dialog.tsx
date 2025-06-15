'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Upload, X, FileVideo, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface VideoUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const MAX_FILE_SIZE = 300 * 1024 * 1024 // 300MB

export function VideoUploadDialog({
  open,
  onOpenChange,
  onSuccess
}: VideoUploadDialogProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: { file: File; errors: { code: string; message: string }[] }[]) => {
    setError(null)

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.some((e) => e.code === 'file-too-large')) {
        setError('文件大小不能超过 300MB')
      } else if (rejection.errors.some((e) => e.code === 'file-invalid-type')) {
        setError('不支持的文件类型，请上传 MP4、WebM、AVI、MOV 或 WMV 格式的视频')
      } else {
        setError('文件验证失败，请重试')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.avi', '.mov', '.wmv']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  })

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      setUploadProgress(0)
      setError(null)

      const formData = new FormData()
      formData.append('video', selectedFile)

      // 创建 XMLHttpRequest 以支持上传进度
      const xhr = new XMLHttpRequest()

      // 监听上传进度
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      })

      // 处理响应
      xhr.addEventListener('load', () => {
        if (xhr.status === 201) {
          JSON.parse(xhr.responseText) // 验证响应格式
          toast.success('视频上传成功')
          onSuccess()
          handleClose()
        } else {
          const errorResponse = JSON.parse(xhr.responseText)
          setError(errorResponse.error || '上传失败，请重试')
        }
        setUploading(false)
      })

      // 处理错误
      xhr.addEventListener('error', () => {
        setError('网络错误，请检查网络连接后重试')
        setUploading(false)
      })

      // 发送请求
      xhr.open('POST', '/api/upload/video')
      xhr.send(formData)

    } catch (error: unknown) {
      console.error('上传视频失败:', error)
      setError(error instanceof Error ? error.message : '上传失败，请重试')
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (uploading) return
    setSelectedFile(null)
    setUploadProgress(0)
    setError(null)
    onOpenChange(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>上传运动视频</DialogTitle>
          <DialogDescription>
            支持 MP4、WebM、AVI、MOV、WMV 格式，文件大小不超过 300MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {isDragActive ? '释放文件以上传' : '拖拽视频文件到这里'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                或者点击选择文件
              </p>
              <p className="text-xs text-gray-400">
                支持 MP4、WebM、AVI、MOV、WMV 格式，最大 300MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 文件信息 */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <FileVideo className="h-8 w-8 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* 上传进度 */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>上传进度</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={uploading}
                >
                  取消
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? '上传中...' : '开始上传'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
