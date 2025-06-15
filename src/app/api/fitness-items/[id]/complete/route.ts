import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 完成运动条目的验证schema
const completeFitnessItemSchema = z.object({
  duration: z.number().min(1, '时长必须大于0分钟').max(480, '时长不能超过8小时').optional(),
  sets: z.number().min(1, '组数必须大于0').max(100, '组数不能超过100').optional(),
  reps: z.number().min(1, '次数必须大于0').max(1000, '次数不能超过1000').optional(),
  notes: z.string().max(500, '备注不能超过500个字符').optional(),
  completedAt: z.string().transform((str) => new Date(str)).optional(),
})

// 标记运动条目完成
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 验证条目是否存在且属于当前用户
    const item = await prisma.fitnessItem.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!item) {
      return NextResponse.json({ error: '运动条目不存在' }, { status: 404 })
    }

    if (item.status !== 'ACTIVE') {
      return NextResponse.json({ error: '只能完成活跃状态的运动条目' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = completeFitnessItemSchema.parse(body)

    // 创建完成记录
    const history = await prisma.fitnessHistory.create({
      data: {
        itemId: item.id,
        userId: session.user.id,
        duration: validatedData.duration,
        sets: validatedData.sets,
        reps: validatedData.reps,
        notes: validatedData.notes,
        completedAt: validatedData.completedAt || new Date(),
      },
      include: {
        item: {
          select: {
            name: true,
          },
        },
      },
    })

    // 创建站内信通知
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'ACHIEVEMENT',
        title: '运动完成',
        content: `您已完成运动"${item.name}"`,
        relatedId: item.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: history,
      message: '运动完成记录已保存',
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('标记运动条目完成错误:', error)
    return NextResponse.json(
      { error: '标记运动条目完成失败' },
      { status: 500 }
    )
  }
}
