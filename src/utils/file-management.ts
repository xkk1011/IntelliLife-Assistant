// 文件管理优化工具

import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { prisma } from '@/lib/db'

export interface FileCleanupOptions {
  maxAge?: number // 文件最大保留时间（天）
  maxSize?: number // 最大总文件大小（字节）
  dryRun?: boolean // 是否为试运行
}

export interface FileStats {
  totalFiles: number
  totalSize: number
  oldestFile: Date | null
  newestFile: Date | null
  averageSize: number
}

export interface CleanupResult {
  deletedFiles: number
  freedSpace: number
  errors: string[]
}

// 获取文件统计信息
export async function getFileStats(directory: string): Promise<FileStats> {
  try {
    const files = await fs.readdir(directory, { withFileTypes: true })
    let totalFiles = 0
    let totalSize = 0
    let oldestFile: Date | null = null
    let newestFile: Date | null = null

    for (const file of files) {
      if (file.isFile()) {
        const filePath = join(directory, file.name)
        const stats = await fs.stat(filePath)
        
        totalFiles++
        totalSize += stats.size
        
        if (!oldestFile || stats.mtime < oldestFile) {
          oldestFile = stats.mtime
        }
        
        if (!newestFile || stats.mtime > newestFile) {
          newestFile = stats.mtime
        }
      } else if (file.isDirectory()) {
        const subStats = await getFileStats(join(directory, file.name))
        totalFiles += subStats.totalFiles
        totalSize += subStats.totalSize
        
        if (subStats.oldestFile && (!oldestFile || subStats.oldestFile < oldestFile)) {
          oldestFile = subStats.oldestFile
        }
        
        if (subStats.newestFile && (!newestFile || subStats.newestFile > newestFile)) {
          newestFile = subStats.newestFile
        }
      }
    }

    return {
      totalFiles,
      totalSize,
      oldestFile,
      newestFile,
      averageSize: totalFiles > 0 ? totalSize / totalFiles : 0
    }
  } catch (error) {
    console.error('获取文件统计失败:', error)
    return {
      totalFiles: 0,
      totalSize: 0,
      oldestFile: null,
      newestFile: null,
      averageSize: 0
    }
  }
}

// 清理孤儿文件（数据库中不存在的文件）
export async function cleanupOrphanFiles(
  directory: string,
  options: FileCleanupOptions = {}
): Promise<CleanupResult> {
  const { dryRun = false } = options
  const result: CleanupResult = {
    deletedFiles: 0,
    freedSpace: 0,
    errors: []
  }

  try {
    // 获取数据库中的所有文件路径
    const dbVideos = await prisma.userVideo.findMany({
      select: { path: true }
    })
    const dbPaths = new Set(dbVideos.map(v => v.path))

    // 递归扫描目录
    await scanAndCleanDirectory(directory, dbPaths, result, dryRun)
  } catch (error) {
    result.errors.push(`清理孤儿文件失败: ${error}`)
  }

  return result
}

// 递归扫描目录并清理孤儿文件
async function scanAndCleanDirectory(
  directory: string,
  dbPaths: Set<string>,
  result: CleanupResult,
  dryRun: boolean
): Promise<void> {
  try {
    const files = await fs.readdir(directory, { withFileTypes: true })

    for (const file of files) {
      const filePath = join(directory, file.name)

      if (file.isDirectory()) {
        await scanAndCleanDirectory(filePath, dbPaths, result, dryRun)
        
        // 检查目录是否为空，如果为空则删除
        try {
          const dirContents = await fs.readdir(filePath)
          if (dirContents.length === 0) {
            if (!dryRun) {
              await fs.rmdir(filePath)
            }
            console.log(`删除空目录: ${filePath}`)
          }
        } catch (error) {
          result.errors.push(`检查目录失败: ${filePath} - ${error}`)
        }
      } else if (file.isFile()) {
        // 检查文件是否在数据库中存在
        if (!dbPaths.has(filePath)) {
          try {
            const stats = await fs.stat(filePath)
            result.freedSpace += stats.size
            result.deletedFiles++

            if (!dryRun) {
              await fs.unlink(filePath)
            }
            console.log(`删除孤儿文件: ${filePath}`)
          } catch (error) {
            result.errors.push(`删除文件失败: ${filePath} - ${error}`)
          }
        }
      }
    }
  } catch (error) {
    result.errors.push(`扫描目录失败: ${directory} - ${error}`)
  }
}

// 清理过期文件
export async function cleanupExpiredFiles(
  directory: string,
  options: FileCleanupOptions = {}
): Promise<CleanupResult> {
  const { maxAge = 90, dryRun = false } = options
  const result: CleanupResult = {
    deletedFiles: 0,
    freedSpace: 0,
    errors: []
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - maxAge)

  try {
    // 获取过期的视频记录
    const expiredVideos = await prisma.userVideo.findMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    for (const video of expiredVideos) {
      try {
        // 检查文件是否存在
        await fs.access(video.path)
        
        const stats = await fs.stat(video.path)
        result.freedSpace += stats.size
        result.deletedFiles++

        if (!dryRun) {
          // 删除物理文件
          await fs.unlink(video.path)
          
          // 删除数据库记录
          await prisma.userVideo.delete({
            where: { id: video.id }
          })
        }
        
        console.log(`删除过期文件: ${video.path}`)
      } catch (error) {
        result.errors.push(`删除过期文件失败: ${video.path} - ${error}`)
      }
    }
  } catch (error) {
    result.errors.push(`清理过期文件失败: ${error}`)
  }

  return result
}

// 清理超出大小限制的文件
export async function cleanupOversizedFiles(
  directory: string,
  options: FileCleanupOptions = {}
): Promise<CleanupResult> {
  const { maxSize = 10 * 1024 * 1024 * 1024, dryRun = false } = options // 默认10GB
  const result: CleanupResult = {
    deletedFiles: 0,
    freedSpace: 0,
    errors: []
  }

  try {
    // 获取当前总大小
    const stats = await getFileStats(directory)
    
    if (stats.totalSize <= maxSize) {
      return result // 没有超出限制
    }

    // 获取所有视频，按创建时间排序（最旧的先删除）
    const videos = await prisma.userVideo.findMany({
      orderBy: { createdAt: 'asc' }
    })

    let currentSize = stats.totalSize
    
    for (const video of videos) {
      if (currentSize <= maxSize) {
        break
      }

      try {
        const fileStats = await fs.stat(video.path)
        currentSize -= fileStats.size
        result.freedSpace += fileStats.size
        result.deletedFiles++

        if (!dryRun) {
          await fs.unlink(video.path)
          await prisma.userVideo.delete({
            where: { id: video.id }
          })
        }
        
        console.log(`删除文件以释放空间: ${video.path}`)
      } catch (error) {
        result.errors.push(`删除文件失败: ${video.path} - ${error}`)
      }
    }
  } catch (error) {
    result.errors.push(`清理超大文件失败: ${error}`)
  }

  return result
}

// 优化文件存储结构
export async function optimizeFileStructure(baseDirectory: string): Promise<void> {
  try {
    // 获取所有视频记录
    const videos = await prisma.userVideo.findMany()

    for (const video of videos) {
      const currentPath = video.path
      const fileName = video.filename
      const userId = video.userId
      const createdAt = new Date(video.createdAt)
      
      // 生成新的路径结构：年/月/用户ID/文件名
      const year = createdAt.getFullYear()
      const month = String(createdAt.getMonth() + 1).padStart(2, '0')
      const newDir = join(baseDirectory, 'videos', year.toString(), month, userId)
      const newPath = join(newDir, fileName)
      const newUrl = `/uploads/videos/${year}/${month}/${userId}/${fileName}`

      // 如果路径已经正确，跳过
      if (currentPath === newPath) {
        continue
      }

      try {
        // 创建新目录
        await fs.mkdir(newDir, { recursive: true })
        
        // 移动文件
        await fs.rename(currentPath, newPath)
        
        // 更新数据库记录
        await prisma.userVideo.update({
          where: { id: video.id },
          data: {
            path: newPath,
            url: newUrl
          }
        })
        
        console.log(`文件移动: ${currentPath} -> ${newPath}`)
        
        // 尝试删除空的旧目录
        try {
          const oldDir = dirname(currentPath)
          const dirContents = await fs.readdir(oldDir)
          if (dirContents.length === 0) {
            await fs.rmdir(oldDir)
          }
        } catch (error) {
          // 忽略删除目录的错误
        }
      } catch (error) {
        console.error(`优化文件结构失败: ${currentPath} - ${error}`)
      }
    }
  } catch (error) {
    console.error('优化文件结构失败:', error)
  }
}

// 生成文件管理报告
export async function generateFileManagementReport(): Promise<{
  uploadStats: FileStats
  orphanFiles: number
  expiredFiles: number
  totalUsers: number
  averageFilesPerUser: number
}> {
  try {
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const uploadStats = await getFileStats(uploadDir)
    
    // 检查孤儿文件
    const orphanResult = await cleanupOrphanFiles(uploadDir, { dryRun: true })
    
    // 检查过期文件
    const expiredResult = await cleanupExpiredFiles(uploadDir, { dryRun: true })
    
    // 用户统计
    const totalUsers = await prisma.user.count()
    const totalVideos = await prisma.userVideo.count()
    
    return {
      uploadStats,
      orphanFiles: orphanResult.deletedFiles,
      expiredFiles: expiredResult.deletedFiles,
      totalUsers,
      averageFilesPerUser: totalUsers > 0 ? totalVideos / totalUsers : 0
    }
  } catch (error) {
    console.error('生成文件管理报告失败:', error)
    throw error
  }
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// 验证文件类型
export function isValidVideoFile(filename: string): boolean {
  const validExtensions = ['mp4', 'webm', 'avi', 'mov', 'wmv']
  const extension = getFileExtension(filename)
  return validExtensions.includes(extension)
}

// 生成安全的文件名
export function generateSafeFilename(originalName: string, userId: string): string {
  const extension = getFileExtension(originalName)
  const baseName = originalName.replace(/\.[^/.]+$/, '')
  const safeName = baseName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
  const timestamp = Date.now()
  
  return `${safeName}_${userId}_${timestamp}.${extension}`
}
