import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 创建运动条目的验证schema
const createFitnessItemSchema = z.object({
  name: z
    .string()
    .min(1, "运动名称不能为空")
    .max(100, "运动名称不能超过100个字符"),
  plannedDuration: z
    .number()
    .min(1, "计划时长必须大于0分钟")
    .max(480, "计划时长不能超过8小时")
    .optional(),
  plannedSets: z
    .number()
    .min(1, "计划组数必须大于0")
    .max(100, "计划组数不能超过100")
    .optional(),
  plannedReps: z
    .number()
    .min(1, "计划次数必须大于0")
    .max(1000, "计划次数不能超过1000")
    .optional(),
  videoId: z.string().optional(), // 保留用于向后兼容
  videoIds: z.array(z.string()).optional(), // 新的多选视频支持
});

// 获取用户的运动条目列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: {
      userId: string;
      status?: string;
    } = {
      userId: session.user.id,
    };

    if (
      status &&
      ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"].includes(status)
    ) {
      where.status = status;
    }

    // 获取运动条目列表
    const [items, total] = await Promise.all([
      prisma.fitnessItem.findMany({
        where,
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
          _count: {
            select: {
              history: true,
              reminders: true,
              videos: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.fitnessItem.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("获取运动条目列表错误:", error);
    return NextResponse.json(
      { error: "获取运动条目列表失败" },
      { status: 500 }
    );
  }
}

// 创建新的运动条目
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createFitnessItemSchema.parse(body);

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

    // 创建运动条目
    const { videoIds, ...itemData } = validatedData;
    const item = await prisma.fitnessItem.create({
      data: {
        ...itemData,
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
      },
    });

    // 如果有多选视频，创建关联关系
    if (videoIds && videoIds.length > 0) {
      await prisma.fitnessItemVideo.createMany({
        data: videoIds.map((videoId) => ({
          fitnessItemId: item.id,
          videoId: videoId,
        })),
      });

      // 重新查询包含视频关联的数据
      const itemWithVideos = await prisma.fitnessItem.findUnique({
        where: { id: item.id },
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

      return NextResponse.json(
        {
          success: true,
          data: itemWithVideos,
          message: "运动条目创建成功",
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: item,
        message: "运动条目创建成功",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("创建运动条目错误:", error);
    return NextResponse.json({ error: "创建运动条目失败" }, { status: 500 });
  }
}
