import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unlink } from "fs/promises";

// 获取单个视频详情
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

    const video = await prisma.userVideo.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        fitnessItems: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            fitnessItems: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "视频不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error("获取视频详情错误:", error);
    return NextResponse.json({ error: "获取视频详情失败" }, { status: 500 });
  }
}

// 删除视频
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

    // 验证视频是否存在且属于当前用户
    const video = await prisma.userVideo.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            fitnessItems: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "视频不存在" }, { status: 404 });
    }

    // 检查是否有关联的运动条目
    if (video._count.fitnessItems > 0) {
      return NextResponse.json(
        { error: "该视频正在被运动条目使用，无法删除" },
        { status: 400 }
      );
    }

    try {
      // 删除物理文件
      await unlink(video.path);
    } catch (fileError) {
      console.warn("删除物理文件失败:", fileError);
      // 继续删除数据库记录，即使物理文件删除失败
    }

    // 删除数据库记录
    await prisma.userVideo.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "视频删除成功",
    });
  } catch (error) {
    console.error("删除视频错误:", error);
    return NextResponse.json({ error: "删除视频失败" }, { status: 500 });
  }
}
