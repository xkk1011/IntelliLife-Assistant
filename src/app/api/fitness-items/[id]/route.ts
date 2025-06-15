import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 更新运动条目的验证schema
const updateFitnessItemSchema = z.object({
  name: z
    .string()
    .min(1, "运动名称不能为空")
    .max(100, "运动名称不能超过100个字符")
    .optional(),
  plannedDuration: z
    .number()
    .min(1, "计划时长必须大于0分钟")
    .max(480, "计划时长不能超过8小时")
    .nullable()
    .optional(),
  plannedSets: z
    .number()
    .min(1, "计划组数必须大于0")
    .max(100, "计划组数不能超过100")
    .nullable()
    .optional(),
  plannedReps: z
    .number()
    .min(1, "计划次数必须大于0")
    .max(1000, "计划次数不能超过1000")
    .nullable()
    .optional(),
  videoId: z.string().nullable().optional(), // 保留用于向后兼容
  videoIds: z.array(z.string()).nullable().optional(), // 新的多选视频支持
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
});

// 获取单个运动条目详情
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

    const item = await prisma.fitnessItem.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        video: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            url: true,
            size: true,
            mimeType: true,
          },
        },
        videos: {
          include: {
            video: {
              select: {
                id: true,
                filename: true,
                originalName: true,
                url: true,
                size: true,
                mimeType: true,
              },
            },
          },
        },
        reminders: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        history: {
          orderBy: { completedAt: "desc" },
          take: 10, // 最近10条记录
        },
        _count: {
          select: {
            history: true,
            reminders: true,
            videos: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "运动条目不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("获取运动条目详情错误:", error);
    return NextResponse.json(
      { error: "获取运动条目详情失败" },
      { status: 500 }
    );
  }
}

// 更新运动条目
export async function PUT(
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

    // 验证条目是否存在且属于当前用户
    const existingItem = await prisma.fitnessItem.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "运动条目不存在" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateFitnessItemSchema.parse(body);

    // 验证视频是否属于当前用户
    if (validatedData.videoId) {
      const video = await prisma.userVideo.findFirst({
        where: {
          id: validatedData.videoId,
          userId: session.user.id,
        },
      });
      if (!video) {
        return NextResponse.json(
          { error: "指定的视频不存在" },
          { status: 400 }
        );
      }
    }

    // 验证多选视频是否属于当前用户
    if (validatedData.videoIds && validatedData.videoIds.length > 0) {
      const videos = await prisma.userVideo.findMany({
        where: {
          id: { in: validatedData.videoIds },
          userId: session.user.id,
        },
      });
      if (videos.length !== validatedData.videoIds.length) {
        return NextResponse.json(
          { error: "部分视频不存在或不属于当前用户" },
          { status: 400 }
        );
      }
    }

    // 更新运动条目
    const { videoIds, ...updateData } = validatedData;

    // 如果有多选视频更新，先删除现有关联，再创建新关联
    if (videoIds !== undefined) {
      await prisma.fitnessItemVideo.deleteMany({
        where: { fitnessItemId: id },
      });

      if (videoIds && videoIds.length > 0) {
        await prisma.fitnessItemVideo.createMany({
          data: videoIds.map((videoId) => ({
            fitnessItemId: id,
            videoId: videoId,
          })),
        });
      }
    }

    const updatedItem = await prisma.fitnessItem.update({
      where: { id: id },
      data: updateData,
      include: {
        video: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            url: true,
            size: true,
            mimeType: true,
          },
        },
        videos: {
          include: {
            video: {
              select: {
                id: true,
                filename: true,
                originalName: true,
                url: true,
                size: true,
                mimeType: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "运动条目更新成功",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("更新运动条目错误:", error);
    return NextResponse.json({ error: "更新运动条目失败" }, { status: 500 });
  }
}

// 删除运动条目
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

    // 验证条目是否存在且属于当前用户
    const existingItem = await prisma.fitnessItem.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "运动条目不存在" }, { status: 404 });
    }

    // 删除运动条目（级联删除相关的提醒和历史记录）
    await prisma.fitnessItem.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "运动条目删除成功",
    });
  } catch (error) {
    console.error("删除运动条目错误:", error);
    return NextResponse.json({ error: "删除运动条目失败" }, { status: 500 });
  }
}
