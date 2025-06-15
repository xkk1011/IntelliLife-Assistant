import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'personal'
    const format = searchParams.get('format') || 'json'
    const userId = session.user.id

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'personal':
        // 导出个人数据汇总
        const personalData = await getPersonalData(userId)
        data = [personalData]
        filename = `personal_data_${new Date().toISOString().split('T')[0]}`
        break

      case 'glow-plans':
        // 导出焕肤计划
        data = await prisma.glowPlan.findMany({
          where: { userId },
          include: {
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
            reminders: true,
            _count: {
              select: {
                history: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        filename = `glow_plans_${new Date().toISOString().split('T')[0]}`
        break

      case 'fitness-items':
        // 导出运动计划
        data = await prisma.fitnessItem.findMany({
          where: { userId },
          include: {
            reminders: true,
            videos: true,
            _count: {
              select: {
                history: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        filename = `fitness_items_${new Date().toISOString().split('T')[0]}`
        break

      case 'glow-history':
        // 导出焕肤历史记录
        data = await prisma.glowHistory.findMany({
          where: { userId },
          include: {
            plan: {
              select: {
                name: true
              }
            },
            area: {
              select: {
                name: true
              }
            },
            device: {
              select: {
                name: true,
                model: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        filename = `glow_history_${new Date().toISOString().split('T')[0]}`
        break

      case 'fitness-history':
        // 导出运动历史记录
        data = await prisma.fitnessHistory.findMany({
          where: { userId },
          include: {
            item: {
              select: {
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        filename = `fitness_history_${new Date().toISOString().split('T')[0]}`
        break

      case 'notifications':
        // 导出通知记录
        data = await prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })
        filename = `notifications_${new Date().toISOString().split('T')[0]}`
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
        type,
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

async function getPersonalData(userId: string) {
  const [
    user,
    glowPlansCount,
    fitnessItemsCount,
    glowHistoryCount,
    fitnessHistoryCount,
    notificationsCount,
    remindersCount
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        status: true
      }
    }),
    prisma.glowPlan.count({ where: { userId } }),
    prisma.fitnessItem.count({ where: { userId } }),
    prisma.glowHistory.count({ where: { userId } }),
    prisma.fitnessHistory.count({ where: { userId } }),
    prisma.notification.count({ where: { userId } }),
    prisma.glowReminder.count({ where: { userId, isActive: true } }) +
    prisma.fitnessReminder.count({ where: { userId, isActive: true } })
  ])

  return {
    user,
    statistics: {
      glowPlans: glowPlansCount,
      fitnessItems: fitnessItemsCount,
      glowHistory: glowHistoryCount,
      fitnessHistory: fitnessHistoryCount,
      notifications: notificationsCount,
      activeReminders: remindersCount
    },
    exportedAt: new Date().toISOString()
  }
}

function convertToCSV(data: any[], type: string): string {
  if (data.length === 0) return ''

  let headers: string[] = []
  let rows: string[][] = []

  switch (type) {
    case 'personal':
      headers = ['用户ID', '邮箱', '姓名', '注册时间', '状态', '焕肤计划数', '运动计划数', '焕肤记录数', '运动记录数', '通知数', '活跃提醒数']
      rows = data.map(item => [
        item.user.id,
        item.user.email,
        item.user.name || '',
        item.user.createdAt,
        item.user.status,
        item.statistics.glowPlans.toString(),
        item.statistics.fitnessItems.toString(),
        item.statistics.glowHistory.toString(),
        item.statistics.fitnessHistory.toString(),
        item.statistics.notifications.toString(),
        item.statistics.activeReminders.toString()
      ])
      break

    case 'glow-plans':
      headers = ['ID', '计划名称', '开始日期', '状态', '创建时间', '更新时间', '历史记录数']
      rows = data.map(item => [
        item.id,
        item.name,
        item.startDate,
        item.status,
        item.createdAt,
        item.updatedAt,
        item._count?.history?.toString() || '0'
      ])
      break

    case 'fitness-items':
      headers = ['ID', '运动名称', '描述', '状态', '创建时间', '更新时间', '历史记录数']
      rows = data.map(item => [
        item.id,
        item.name,
        item.description || '',
        item.status,
        item.createdAt,
        item.updatedAt,
        item._count?.history?.toString() || '0'
      ])
      break

    case 'glow-history':
      headers = ['ID', '计划名称', '部位', '设备', '执行时间', '备注', '创建时间']
      rows = data.map(item => [
        item.id,
        item.plan?.name || '',
        item.area?.name || '',
        item.device ? `${item.device.name} ${item.device.model || ''}`.trim() : '',
        item.executedAt,
        item.notes || '',
        item.createdAt
      ])
      break

    case 'fitness-history':
      headers = ['ID', '运动名称', '执行时间', '持续时间(分钟)', '备注', '创建时间']
      rows = data.map(item => [
        item.id,
        item.item?.name || '',
        item.executedAt,
        item.duration?.toString() || '',
        item.notes || '',
        item.createdAt
      ])
      break

    case 'notifications':
      headers = ['ID', '标题', '内容', '类型', '是否已读', '创建时间']
      rows = data.map(item => [
        item.id,
        item.title,
        item.content,
        item.type,
        item.isRead ? '是' : '否',
        item.createdAt
      ])
      break

    default:
      return ''
  }

  // 构建CSV内容
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return '\uFEFF' + csvContent // 添加BOM以支持中文
}
