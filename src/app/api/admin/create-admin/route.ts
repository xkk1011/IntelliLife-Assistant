import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // 检查是否已经存在管理员用户
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: '管理员用户已存在' },
        { status: 400 }
      )
    }

    // 创建管理员用户
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@intellilife.com',
        name: '系统管理员',
        password: adminPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: '管理员用户创建成功',
        admin 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('创建管理员用户失败:', error)
    return NextResponse.json(
      { error: '创建管理员用户失败' },
      { status: 500 }
    )
  }
}
