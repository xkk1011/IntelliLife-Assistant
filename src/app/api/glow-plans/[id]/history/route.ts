import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 获取焕肤计划的历史记录
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

    // 验证计划是否存在且属于当前用户
    const plan = await prisma.glowPlan.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "焕肤计划不存在" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: {
      planId: string;
      userId: string;
      completedAt?: {
        gte: Date;
        lte: Date;
      };
    } = {
      planId: id,
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
      prisma.glowHistory.findMany({
        where,
        include: {
          plan: {
            select: {
              name: true,
            },
          },
          areas: {
            include: {
              area: {
                select: {
                  name: true,
                },
              },
            },
          },
          devices: {
            include: {
              device: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          completedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.glowHistory.count({ where }),
    ]);

    // 计算统计数据
    const stats = await prisma.glowHistory.aggregate({
      where: {
        planId: id,
        userId: session.user.id,
      },
      _count: {
        id: true,
      },
      _sum: {
        duration: true,
      },
      _avg: {
        duration: true,
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
        },
      },
    });
  } catch (error) {
    console.error("获取焕肤计划历史记录错误:", error);
    return NextResponse.json(
      { error: "获取焕肤计划历史记录失败" },
      { status: 500 }
    );
  }
}
