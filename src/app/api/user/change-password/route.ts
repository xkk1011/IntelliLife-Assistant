import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import bcrypt from "bcryptjs"

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string()
    .min(8, "密码至少需要8个字符")
    .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
    .regex(/[a-z]/, "密码必须包含至少一个小写字母")
    .regex(/\d/, "密码必须包含至少一个数字")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "密码必须包含至少一个特殊字符"),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    // 获取当前用户
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      )
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "当前密码不正确" },
        { status: 400 }
      )
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return NextResponse.json(
        { error: "新密码不能与当前密码相同" },
        { status: 400 }
      )
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // 更新密码
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json({
      success: true,
      message: "密码修改成功"
    })
  } catch (error) {
    console.error("修改密码错误:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "密码修改失败" },
      { status: 500 }
    )
  }
}
