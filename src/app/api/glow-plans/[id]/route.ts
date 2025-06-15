import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 更新焕肤计划的验证schema
const updateGlowPlanSchema = z.object({
  name: z
    .string()
    .min(1, "计划名称不能为空")
    .max(100, "计划名称不能超过100个字符")
    .optional(),
  areaIds: z.array(z.string()).optional(),
  deviceIds: z.array(z.string()).optional(),
  startDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
});

// 获取单个焕肤计划详情
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
        reminders: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        history: {
          orderBy: { completedAt: "desc" },
          take: 10, // 最近10条记录
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
        },
        _count: {
          select: {
            history: true,
            reminders: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "焕肤计划不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error("获取焕肤计划详情错误:", error);
    return NextResponse.json(
      { error: "获取焕肤计划详情失败" },
      { status: 500 }
    );
  }
}

// 更新焕肤计划
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

    // 验证计划是否存在且属于当前用户
    const existingPlan = await prisma.glowPlan.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "焕肤计划不存在" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateGlowPlanSchema.parse(body);

    // 验证部位和设备是否属于当前用户
    if (validatedData.areaIds && validatedData.areaIds.length > 0) {
      const areas = await prisma.glowArea.findMany({
        where: {
          id: { in: validatedData.areaIds },
          userId: session.user.id,
        },
      });
      if (areas.length !== validatedData.areaIds.length) {
        return NextResponse.json(
          { error: "部分指定的焕肤部位不存在" },
          { status: 400 }
        );
      }
    }

    if (validatedData.deviceIds && validatedData.deviceIds.length > 0) {
      const devices = await prisma.glowDevice.findMany({
        where: {
          id: { in: validatedData.deviceIds },
          userId: session.user.id,
        },
      });
      if (devices.length !== validatedData.deviceIds.length) {
        return NextResponse.json(
          { error: "部分指定的焕肤设备不存在" },
          { status: 400 }
        );
      }
    }

    // 更新焕肤计划
    const updatedPlan = await prisma.$transaction(async (tx) => {
      // 更新基本信息
      await tx.glowPlan.update({
        where: { id: id },
        data: {
          name: validatedData.name,
          startDate: validatedData.startDate,
          status: validatedData.status,
        },
      });

      // 更新部位关联
      if (validatedData.areaIds !== undefined) {
        // 删除现有关联
        await tx.glowPlanArea.deleteMany({
          where: { planId: id },
        });
        // 创建新关联
        if (validatedData.areaIds.length > 0) {
          await tx.glowPlanArea.createMany({
            data: validatedData.areaIds.map((areaId) => ({
              planId: id,
              areaId,
            })),
          });
        }
      }

      // 更新设备关联
      if (validatedData.deviceIds !== undefined) {
        // 删除现有关联
        await tx.glowPlanDevice.deleteMany({
          where: { planId: id },
        });
        // 创建新关联
        if (validatedData.deviceIds.length > 0) {
          await tx.glowPlanDevice.createMany({
            data: validatedData.deviceIds.map((deviceId) => ({
              planId: id,
              deviceId,
            })),
          });
        }
      }

      // 返回更新后的计划
      return await tx.glowPlan.findFirst({
        where: { id: id },
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
    });

    return NextResponse.json({
      success: true,
      data: updatedPlan,
      message: "焕肤计划更新成功",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("更新焕肤计划错误:", error);
    return NextResponse.json({ error: "更新焕肤计划失败" }, { status: 500 });
  }
}

// 删除焕肤计划
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

    // 验证计划是否存在且属于当前用户
    const existingPlan = await prisma.glowPlan.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "焕肤计划不存在" }, { status: 404 });
    }

    // 删除焕肤计划（级联删除相关的提醒和历史记录）
    await prisma.glowPlan.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "焕肤计划删除成功",
    });
  } catch (error) {
    console.error("删除焕肤计划错误:", error);
    return NextResponse.json({ error: "删除焕肤计划失败" }, { status: 500 });
  }
}
