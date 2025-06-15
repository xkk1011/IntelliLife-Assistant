import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 创建焕肤计划的验证schema
const createGlowPlanSchema = z.object({
  name: z
    .string()
    .min(1, "计划名称不能为空")
    .max(100, "计划名称不能超过100个字符"),
  areaIds: z.array(z.string()).optional(),
  deviceIds: z.array(z.string()).optional(),
  startDate: z.string().transform((str) => new Date(str)),
});

// 获取用户的焕肤计划列表
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
      status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
    } = {
      userId: session.user.id,
    };

    if (
      status &&
      ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"].includes(status)
    ) {
      where.status = status;
    }

    // 获取计划列表
    const [plans, total] = await Promise.all([
      prisma.glowPlan.findMany({
        where,
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
          _count: {
            select: {
              history: true,
              reminders: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.glowPlan.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        plans,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("获取焕肤计划列表错误:", error);
    return NextResponse.json(
      { error: "获取焕肤计划列表失败" },
      { status: 500 }
    );
  }
}

// 创建新的焕肤计划
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createGlowPlanSchema.parse(body);

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

    // 创建焕肤计划
    const plan = await prisma.glowPlan.create({
      data: {
        name: validatedData.name,
        startDate: validatedData.startDate,
        userId: session.user.id,
        areas:
          validatedData.areaIds && validatedData.areaIds.length > 0
            ? {
                create: validatedData.areaIds.map((areaId) => ({ areaId })),
              }
            : undefined,
        devices:
          validatedData.deviceIds && validatedData.deviceIds.length > 0
            ? {
                create: validatedData.deviceIds.map((deviceId) => ({
                  deviceId,
                })),
              }
            : undefined,
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

    return NextResponse.json(
      {
        success: true,
        data: plan,
        message: "焕肤计划创建成功",
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

    console.error("创建焕肤计划错误:", error);
    return NextResponse.json({ error: "创建焕肤计划失败" }, { status: 500 });
  }
}
