import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 完成焕肤计划的验证schema
const completeGlowPlanSchema = z.object({
  duration: z
    .number()
    .min(1, "时长必须大于0分钟")
    .max(480, "时长不能超过8小时")
    .optional(),
  notes: z.string().max(500, "备注不能超过500个字符").optional(),
  completedAt: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  areaIds: z.array(z.string()).optional(),
  deviceIds: z.array(z.string()).optional(),
});

// 标记焕肤计划完成
export async function POST(
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
      include: {
        areas: {
          include: {
            area: true,
          },
        },
        devices: {
          include: {
            device: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "焕肤计划不存在" }, { status: 404 });
    }

    if (plan.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "只能完成活跃状态的计划" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = completeGlowPlanSchema.parse(body);

    // 验证选择的部位和设备
    const selectedAreaIds = validatedData.areaIds || [];
    const selectedDeviceIds = validatedData.deviceIds || [];

    if (selectedAreaIds.length > 0) {
      const areas = await prisma.glowArea.findMany({
        where: {
          id: { in: selectedAreaIds },
          userId: session.user.id,
        },
      });
      if (areas.length !== selectedAreaIds.length) {
        return NextResponse.json(
          { error: "部分指定的焕肤部位不存在" },
          { status: 400 }
        );
      }
    }

    if (selectedDeviceIds.length > 0) {
      const devices = await prisma.glowDevice.findMany({
        where: {
          id: { in: selectedDeviceIds },
          userId: session.user.id,
        },
      });
      if (devices.length !== selectedDeviceIds.length) {
        return NextResponse.json(
          { error: "部分指定的焕肤设备不存在" },
          { status: 400 }
        );
      }
    }

    // 创建完成记录
    const history = await prisma.glowHistory.create({
      data: {
        planId: plan.id,
        userId: session.user.id,
        duration: validatedData.duration,
        notes: validatedData.notes,
        completedAt: validatedData.completedAt || new Date(),
        areas:
          selectedAreaIds.length > 0
            ? {
                create: selectedAreaIds.map((areaId) => ({ areaId })),
              }
            : undefined,
        devices:
          selectedDeviceIds.length > 0
            ? {
                create: selectedDeviceIds.map((deviceId) => ({ deviceId })),
              }
            : undefined,
      },
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
    });

    // 创建站内信通知
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "ACHIEVEMENT",
        title: "焕肤计划完成",
        content: `您已完成焕肤计划"${plan.name}"`,
        relatedId: plan.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: history,
        message: "焕肤计划完成记录已保存",
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

    console.error("标记焕肤计划完成错误:", error);
    return NextResponse.json(
      { error: "标记焕肤计划完成失败" },
      { status: 500 }
    );
  }
}
