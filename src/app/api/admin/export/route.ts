import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const type = searchParams.get('type') || 'users'
    const format = searchParams.get('format') || 'json'

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'users':
        data = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                glowPlans: true,
                fitnessItems: true,
                notifications: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        filename = `users_export_${new Date().toISOString().split('T')[0]}`
        break

      case 'glow-plans':
        data = await prisma.glowPlan.findMany({
          include: {
            user: {
              select: {
                email: true,
                name: true,
              }
            },
            areas: {
              include: {
                area: true
              }
            },
            devices: {
              include: {
                device: true
              }
            },
            _count: {
              select: {
                history: true,
                reminders: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        filename = `glow_plans_export_${new Date().toISOString().split('T')[0]}`
        break

      case 'fitness-items':
        data = await prisma.fitnessItem.findMany({
          include: {
            user: {
              select: {
                email: true,
                name: true,
              }
            },
            videos: {
              include: {
                video: true
              }
            },
            _count: {
              select: {
                history: true,
                reminders: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        filename = `fitness_items_export_${new Date().toISOString().split('T')[0]}`
        break

      case 'notifications':
        data = await prisma.notification.findMany({
          include: {
            user: {
              select: {
                email: true,
                name: true,
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        filename = `notifications_export_${new Date().toISOString().split('T')[0]}`
        break

      default:
        return NextResponse.json(
          { error: '不支持的导出类型' },
          { status: 400 }
        )
    }

    if (format === 'csv') {
      // 生成CSV格式
      const csv = convertToCSV(data, type)
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      })
    } else {
      // 返回JSON格式
      return NextResponse.json({
        success: true,
        data,
        total: data.length,
        exportedAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('数据导出失败:', error)
    return NextResponse.json(
      { error: '数据导出失败' },
      { status: 500 }
    )
  }
}

function convertToCSV(data: any[], type: string): string {
  if (data.length === 0) return ''

  let headers: string[] = []
  let rows: string[][] = []

  switch (type) {
    case 'users':
      headers = ['ID', '邮箱', '姓名', '角色', '状态', '焕肤计划数', '运动条目数', '通知数', '创建时间']
      rows = data.map(user => [
        user.id,
        user.email,
        user.name || '',
        user.role,
        user.status,
        user._count.glowPlans.toString(),
        user._count.fitnessItems.toString(),
        user._count.notifications.toString(),
        new Date(user.createdAt).toLocaleString('zh-CN')
      ])
      break

    case 'glow-plans':
      headers = ['ID', '计划名称', '用户邮箱', '用户姓名', '开始日期', '结束日期', '状态', '部位', '设备', '历史记录数', '创建时间']
      rows = data.map(plan => [
        plan.id,
        plan.name,
        plan.user.email,
        plan.user.name || '',
        plan.startDate ? new Date(plan.startDate).toLocaleDateString('zh-CN') : '',
        plan.endDate ? new Date(plan.endDate).toLocaleDateString('zh-CN') : '',
        plan.status,
        plan.areas.map((a: any) => a.area.name).join(', '),
        plan.devices.map((d: any) => d.device.name).join(', '),
        plan._count.history.toString(),
        new Date(plan.createdAt).toLocaleString('zh-CN')
      ])
      break

    case 'fitness-items':
      headers = ['ID', '运动名称', '用户邮箱', '用户姓名', '计划时长', '计划组数', '计划次数', '状态', '视频数', '历史记录数', '创建时间']
      rows = data.map(item => [
        item.id,
        item.name,
        item.user.email,
        item.user.name || '',
        item.plannedDuration?.toString() || '',
        item.plannedSets?.toString() || '',
        item.plannedReps?.toString() || '',
        item.status,
        item.videos.length.toString(),
        item._count.history.toString(),
        new Date(item.createdAt).toLocaleString('zh-CN')
      ])
      break

    case 'notifications':
      headers = ['ID', '类型', '标题', '内容', '用户邮箱', '是否已读', '创建时间']
      rows = data.map(notification => [
        notification.id,
        notification.type,
        notification.title,
        notification.content,
        notification.user.email,
        notification.isRead ? '是' : '否',
        new Date(notification.createdAt).toLocaleString('zh-CN')
      ])
      break
  }

  // 构建CSV内容
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  // 添加BOM以支持中文
  return '\uFEFF' + csvContent
}
