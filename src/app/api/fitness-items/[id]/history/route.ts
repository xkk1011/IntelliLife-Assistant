import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 获取运动条目的历史记录
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

    // 验证条目是否存在且属于当前用户
    const item = await prisma.fitnessItem.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "运动条目不存在" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: {
      itemId: string;
      userId: string;
      completedAt?: {
        gte: Date;
        lte: Date;
      };
    } = {
      itemId: id,
      userId: session.user.id,
    };

    if (startDate && endDate) {
      where.completedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // 获取历史记录
    const [history, total] = await Promise.all([
      prisma.fitnessHistory.findMany({
        where,
        include: {
          item: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          completedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.fitnessHistory.count({ where }),
    ]);

    // 计算统计数据
    const stats = await prisma.fitnessHistory.aggregate({
      where: {
        itemId: id,
        userId: session.user.id,
      },
      _count: {
        id: true,
      },
      _sum: {
        duration: true,
        sets: true,
        reps: true,
      },
      _avg: {
        duration: true,
        sets: true,
        reps: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalSessions: stats._count.id || 0,
          totalDuration: stats._sum.duration || 0,
          averageDuration: Math.round(stats._avg.duration || 0),
          totalSets: stats._sum.sets || 0,
          totalReps: stats._sum.reps || 0,
        },
      },
    });
  } catch (error) {
    console.error("获取运动条目历史记录错误:", error);
    return NextResponse.json(
      { error: "获取运动条目历史记录失败" },
      { status: 500 }
    );
  }
}
