'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  HardDrive, 
  Trash2, 
  RefreshCw, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  Clock,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

interface FileStats {
  totalFiles: number
  totalSize: number
  totalSizeFormatted: string
  averageSize: number
  averageSizeFormatted: string
  oldestFile: string | null
  newestFile: string | null
}

interface FileManagementReport {
  uploadStats: FileStats
  orphanFiles: number
  expiredFiles: number
  totalUsers: number
  averageFilesPerUser: number
}

interface CleanupResult {
  deletedFiles: number
  freedSpace: number
  freedSpaceFormatted: string
  errors: string[]
}

export function FileManagement() {
  const [report, setReport] = useState<FileManagementReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState<string | null>(null)
  const [lastCleanup, setLastCleanup] = useState<CleanupResult | null>(null)

  // 加载文件管理报告
  const loadReport = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/file-management?action=report')
      const data = await response.json()
      
      if (data.success) {
        setReport(data.data)
      } else {
        toast.error(data.error || '加载文件管理报告失败')
      }
    } catch (error) {
      console.error('加载文件管理报告失败:', error)
      toast.error('加载文件管理报告失败')
    } finally {
      setLoading(false)
    }
  }

  // 执行清理操作
  const executeCleanup = async (action: string, options: any = {}) => {
    try {
      setOperationLoading(action)
      
      const response = await fetch('/api/admin/file-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, options })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setLastCleanup(data.data)
        toast.success(data.message)
        // 重新加载报告
        await loadReport()
      } else {
        toast.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('执行清理操作失败:', error)
      toast.error('执行清理操作失败')
    } finally {
      setOperationLoading(null)
    }
  }

  useEffect(() => {
    loadReport()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>加载失败</AlertTitle>
        <AlertDescription>无法加载文件管理报告，请刷新页面重试。</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* 文件统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总文件数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.uploadStats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              平均大小: {report.uploadStats.averageSizeFormatted}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总存储空间</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.uploadStats.totalSizeFormatted}</div>
            <p className="text-xs text-muted-foreground">
              {report.totalUsers} 个用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">孤儿文件</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{report.orphanFiles}</div>
            <p className="text-xs text-muted-foreground">
              数据库中不存在的文件
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">过期文件</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{report.expiredFiles}</div>
            <p className="text-xs text-muted-foreground">
              超过90天的文件
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 用户统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            用户文件统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{report.totalUsers}</div>
              <p className="text-sm text-muted-foreground">总用户数</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{report.averageFilesPerUser.toFixed(1)}</div>
              <p className="text-sm text-muted-foreground">平均文件数/用户</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {((report.uploadStats.totalSize / report.totalUsers) / (1024 * 1024)).toFixed(1)} MB
              </div>
              <p className="text-sm text-muted-foreground">平均存储/用户</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 清理操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            文件清理操作
          </CardTitle>
          <CardDescription>
            执行各种文件清理和优化操作。建议先使用"预览模式"查看将要删除的文件。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">清理孤儿文件</h4>
              <p className="text-sm text-muted-foreground">
                删除数据库中不存在记录的物理文件
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeCleanup('cleanup-orphans', { dryRun: true })}
                  disabled={operationLoading === 'cleanup-orphans'}
                >
                  预览
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => executeCleanup('cleanup-orphans')}
                  disabled={operationLoading === 'cleanup-orphans'}
                >
                  {operationLoading === 'cleanup-orphans' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                  执行清理
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">清理过期文件</h4>
              <p className="text-sm text-muted-foreground">
                删除超过90天的旧文件
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeCleanup('cleanup-expired', { dryRun: true, maxAge: 90 })}
                  disabled={operationLoading === 'cleanup-expired'}
                >
                  预览
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => executeCleanup('cleanup-expired', { maxAge: 90 })}
                  disabled={operationLoading === 'cleanup-expired'}
                >
                  {operationLoading === 'cleanup-expired' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                  执行清理
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">优化文件结构</h4>
              <p className="text-sm text-muted-foreground">
                重新组织文件目录结构
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCleanup('optimize-structure')}
                disabled={operationLoading === 'optimize-structure'}
              >
                {operationLoading === 'optimize-structure' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                优化结构
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">完整清理</h4>
              <p className="text-sm text-muted-foreground">
                执行所有清理操作
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeCleanup('full-cleanup', { dryRun: true })}
                  disabled={operationLoading === 'full-cleanup'}
                >
                  预览
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => executeCleanup('full-cleanup')}
                  disabled={operationLoading === 'full-cleanup'}
                >
                  {operationLoading === 'full-cleanup' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                  完整清理
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近清理结果 */}
      {lastCleanup && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              最近清理结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{lastCleanup.deletedFiles}</div>
                <p className="text-sm text-muted-foreground">删除文件数</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{lastCleanup.freedSpaceFormatted}</div>
                <p className="text-sm text-muted-foreground">释放空间</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{lastCleanup.errors.length}</div>
                <p className="text-sm text-muted-foreground">错误数量</p>
              </div>
            </div>
            
            {lastCleanup.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">错误详情:</h4>
                <div className="space-y-1">
                  {lastCleanup.errors.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-sm text-red-600">{error}</p>
                  ))}
                  {lastCleanup.errors.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      还有 {lastCleanup.errors.length - 5} 个错误...
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 刷新按钮 */}
      <div className="flex justify-center">
        <Button onClick={loadReport} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新报告
        </Button>
      </div>
    </div>
  )
}
