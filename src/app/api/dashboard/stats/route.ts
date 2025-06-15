import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// 获取仪表盘统计数据
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const userId = session.user.id;

    // 并行获取各种统计数据
    const [
      glowPlansStats,
      fitnessItemsStats,
      notificationsStats,
      glowRemindersStats,
      fitnessRemindersStats,
    ] = await Promise.all([
      // 焕肤计划统计
      prisma.glowPlan.aggregate({
        where: { userId },
        _count: {
          id: true,
        },
      }),

      // 运动计划统计
      prisma.fitnessItem.aggregate({
        where: { userId },
        _count: {
          id: true,
        },
      }),

      // 通知统计
      prisma.notification.aggregate({
        where: {
          userId,
          isRead: false,
        },
        _count: {
          id: true,
        },
      }),

      // 焕肤提醒统计
      prisma.glowReminder.aggregate({
        where: {
          userId,
          isActive: true,
        },
        _count: {
          id: true,
        },
      }),

      // 运动提醒统计
      prisma.fitnessReminder.aggregate({
        where: {
          userId,
          isActive: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // 获取活跃的焕肤计划数量
    const activeGlowPlans = await prisma.glowPlan.count({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    // 获取活跃的运动计划数量
    const activeFitnessItems = await prisma.fitnessItem.count({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    // 计算总提醒数量
    const totalActiveReminders =
      glowRemindersStats._count.id + fitnessRemindersStats._count.id;

    const stats = {
      glowPlans: {
        total: glowPlansStats._count.id,
        active: activeGlowPlans,
      },
      fitnessItems: {
        total: fitnessItemsStats._count.id,
        active: activeFitnessItems,
      },
      notifications: {
        unread: notificationsStats._count.id,
      },
      reminders: {
        total: totalActiveReminders,
        glow: glowRemindersStats._count.id,
        fitness: fitnessRemindersStats._count.id,
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("获取仪表盘统计数据错误:", error);
    return NextResponse.json(
      { error: "获取仪表盘统计数据失败" },
      { status: 500 }
    );
  }
}
