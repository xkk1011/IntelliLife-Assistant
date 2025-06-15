import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { join } from 'path'
import {
  getFileStats,
  cleanupOrphanFiles,
  cleanupExpiredFiles,
  cleanupOversizedFiles,
  optimizeFileStructure,
  generateFileManagementReport,
  formatFileSize
} from '@/utils/file-management'

// 获取文件管理信息
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'report'

    const uploadDir = join(process.cwd(), 'public', 'uploads')

    switch (action) {
      case 'report':
        // 生成文件管理报告
        const report = await generateFileManagementReport()
        return NextResponse.json({
          success: true,
          data: {
            ...report,
            uploadStats: {
              ...report.uploadStats,
              totalSizeFormatted: formatFileSize(report.uploadStats.totalSize),
              averageSizeFormatted: formatFileSize(report.uploadStats.averageSize)
            }
          }
        })

      case 'stats':
        // 获取文件统计信息
        const stats = await getFileStats(uploadDir)
        return NextResponse.json({
          success: true,
          data: {
            ...stats,
            totalSizeFormatted: formatFileSize(stats.totalSize),
            averageSizeFormatted: formatFileSize(stats.averageSize)
          }
        })

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('文件管理操作失败:', error)
    return NextResponse.json(
      { error: '文件管理操作失败' },
      { status: 500 }
    )
  }
}

// 执行文件管理操作
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, options = {} } = body

    const uploadDir = join(process.cwd(), 'public', 'uploads')

    switch (action) {
      case 'cleanup-orphans':
        // 清理孤儿文件
        const orphanResult = await cleanupOrphanFiles(uploadDir, {
          dryRun: options.dryRun || false
        })
        return NextResponse.json({
          success: true,
          data: {
            ...orphanResult,
            freedSpaceFormatted: formatFileSize(orphanResult.freedSpace)
          },
          message: `清理完成：删除 ${orphanResult.deletedFiles} 个孤儿文件，释放 ${formatFileSize(orphanResult.freedSpace)} 空间`
        })

      case 'cleanup-expired':
        // 清理过期文件
        const expiredResult = await cleanupExpiredFiles(uploadDir, {
          maxAge: options.maxAge || 90,
          dryRun: options.dryRun || false
        })
        return NextResponse.json({
          success: true,
          data: {
            ...expiredResult,
            freedSpaceFormatted: formatFileSize(expiredResult.freedSpace)
          },
          message: `清理完成：删除 ${expiredResult.deletedFiles} 个过期文件，释放 ${formatFileSize(expiredResult.freedSpace)} 空间`
        })

      case 'cleanup-oversized':
        // 清理超大文件
        const oversizedResult = await cleanupOversizedFiles(uploadDir, {
          maxSize: options.maxSize || 10 * 1024 * 1024 * 1024, // 默认10GB
          dryRun: options.dryRun || false
        })
        return NextResponse.json({
          success: true,
          data: {
            ...oversizedResult,
            freedSpaceFormatted: formatFileSize(oversizedResult.freedSpace)
          },
          message: `清理完成：删除 ${oversizedResult.deletedFiles} 个文件，释放 ${formatFileSize(oversizedResult.freedSpace)} 空间`
        })

      case 'optimize-structure':
        // 优化文件结构
        await optimizeFileStructure(join(process.cwd(), 'public', 'uploads'))
        return NextResponse.json({
          success: true,
          message: '文件结构优化完成'
        })

      case 'full-cleanup':
        // 执行完整清理
        const results = {
          orphans: await cleanupOrphanFiles(uploadDir, { dryRun: options.dryRun || false }),
          expired: await cleanupExpiredFiles(uploadDir, { 
            maxAge: options.maxAge || 90,
            dryRun: options.dryRun || false 
          }),
          oversized: await cleanupOversizedFiles(uploadDir, { 
            maxSize: options.maxSize || 10 * 1024 * 1024 * 1024,
            dryRun: options.dryRun || false 
          })
        }

        const totalDeleted = results.orphans.deletedFiles + results.expired.deletedFiles + results.oversized.deletedFiles
        const totalFreed = results.orphans.freedSpace + results.expired.freedSpace + results.oversized.freedSpace
        const totalErrors = [...results.orphans.errors, ...results.expired.errors, ...results.oversized.errors]

        return NextResponse.json({
          success: true,
          data: {
            results,
            summary: {
              totalDeleted,
              totalFreed,
              totalFreedFormatted: formatFileSize(totalFreed),
              totalErrors: totalErrors.length,
              errors: totalErrors
            }
          },
          message: `完整清理完成：删除 ${totalDeleted} 个文件，释放 ${formatFileSize(totalFreed)} 空间`
        })

      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('文件管理操作失败:', error)
    return NextResponse.json(
      { error: '文件管理操作失败' },
      { status: 500 }
    )
  }
}

// 删除特定文件
export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json(
        { error: '缺少文件路径' },
        { status: 400 }
      )
    }

    // 安全检查：确保文件路径在上传目录内
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const fullPath = join(process.cwd(), filePath)
    
    if (!fullPath.startsWith(uploadDir)) {
      return NextResponse.json(
        { error: '无效的文件路径' },
        { status: 400 }
      )
    }

    try {
      const fs = require('fs').promises
      await fs.unlink(fullPath)
      
      return NextResponse.json({
        success: true,
        message: '文件删除成功'
      })
    } catch (error) {
      return NextResponse.json(
        { error: '文件删除失败' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('删除文件失败:', error)
    return NextResponse.json(
      { error: '删除文件失败' },
      { status: 500 }
    )
  }
}
