import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 删除运动历史记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 等待params
    const { id } = await params;

    // 验证历史记录是否存在且属于当前用户
    const existingHistory = await prisma.fitnessHistory.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingHistory) {
      return NextResponse.json({ error: "运动历史记录不存在" }, { status: 404 });
    }

    // 删除运动历史记录
    await prisma.fitnessHistory.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "运动历史记录删除成功",
    });
  } catch (error) {
    console.error("删除运动历史记录错误:", error);
    return NextResponse.json(
      { error: "删除运动历史记录失败" },
      { status: 500 }
    );
  }
}
