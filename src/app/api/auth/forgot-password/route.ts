import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // 为了安全起见，即使用户不存在也返回成功
      return NextResponse.json({
        success: true,
        message: "如果该邮箱存在，重置密码邮件已发送",
      });
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString("hex");
    // const resetTokenExpiry = new Date(Date.now() + 3600000) // 1小时后过期

    // 这里应该将重置令牌保存到数据库
    // 由于当前schema没有重置令牌字段，我们先模拟发送邮件

    // TODO: 发送重置密码邮件
    console.log(
      `重置密码链接: http://localhost:3000/auth/reset-password?token=${resetToken}&email=${email}`
    );

    return NextResponse.json({
      success: true,
      message: "重置密码邮件已发送",
    });
  } catch (error) {
    console.error("忘记密码错误:", error);
    return NextResponse.json({ error: "发送重置邮件失败" }, { status: 500 });
  }
}
