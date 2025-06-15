import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 获取单个通知详情
export async function GET(
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

    const notification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: "通知不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("获取通知详情错误:", error);
    return NextResponse.json({ error: "获取通知详情失败" }, { status: 500 });
  }
}

// 标记单个通知为已读
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 验证通知是否存在且属于当前用户
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingNotification) {
      return NextResponse.json({ error: "通知不存在" }, { status: 404 });
    }

    // 标记为已读
    const notification = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      data: notification,
      message: "通知已标记为已读",
    });
  } catch (error) {
    console.error("标记通知已读错误:", error);
    return NextResponse.json({ error: "标记通知已读失败" }, { status: 500 });
  }
}

// 删除单个通知
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 验证通知是否存在且属于当前用户
    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: "通知不存在" }, { status: 404 });
    }

    // 删除通知
    await prisma.notification.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "通知删除成功",
    });
  } catch (error) {
    console.error("删除通知错误:", error);
    return NextResponse.json({ error: "删除通知失败" }, { status: 500 });
  }
}
