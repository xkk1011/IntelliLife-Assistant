import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 更新焕肤设备的验证schema
const updateGlowDeviceSchema = z.object({
  name: z
    .string()
    .min(1, "设备名称不能为空")
    .max(100, "设备名称不能超过100个字符")
    .optional(),
  model: z.string().max(100, "设备型号不能超过100个字符").optional(),
});

// 获取单个焕肤设备详情
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

    const device = await prisma.glowDevice.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        plans: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            plans: true,
            history: true,
          },
        },
      },
    });

    if (!device) {
      return NextResponse.json({ error: "焕肤设备不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: device,
    });
  } catch (error) {
    console.error("获取焕肤设备详情错误:", error);
    return NextResponse.json(
      { error: "获取焕肤设备详情失败" },
      { status: 500 }
    );
  }
}

// 更新焕肤设备
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

    // 验证设备是否存在且属于当前用户
    const existingDevice = await prisma.glowDevice.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingDevice) {
      return NextResponse.json({ error: "焕肤设备不存在" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateGlowDeviceSchema.parse(body);

    // 如果更新名称，检查是否已存在相同名称的设备（排除当前设备）
    if (validatedData.name) {
      const duplicateDevice = await prisma.glowDevice.findFirst({
        where: {
          userId: session.user.id,
          name: validatedData.name,
          id: {
            not: id,
          },
        },
      });

      if (duplicateDevice) {
        return NextResponse.json(
          { error: "该设备名称已存在" },
          { status: 400 }
        );
      }
    }

    // 准备更新数据，确保空字符串和undefined转换为null
    const updateData = {
      ...validatedData,
      model:
        !validatedData.model || validatedData.model.trim() === ""
          ? null
          : validatedData.model,
    };

    // 更新焕肤设备
    const updatedDevice = await prisma.glowDevice.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedDevice,
      message: "焕肤设备更新成功",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("更新焕肤设备错误:", error);
    return NextResponse.json({ error: "更新焕肤设备失败" }, { status: 500 });
  }
}

// 删除焕肤设备
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

    // 验证设备是否存在且属于当前用户
    const existingDevice = await prisma.glowDevice.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            plans: true,
          },
        },
      },
    });

    if (!existingDevice) {
      return NextResponse.json({ error: "焕肤设备不存在" }, { status: 404 });
    }

    // 检查是否有关联的计划
    if (existingDevice._count.plans > 0) {
      return NextResponse.json(
        { error: "该设备下还有关联的焕肤计划，无法删除" },
        { status: 400 }
      );
    }

    // 删除焕肤设备
    await prisma.glowDevice.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "焕肤设备删除成功",
    });
  } catch (error) {
    console.error("删除焕肤设备错误:", error);
    return NextResponse.json({ error: "删除焕肤设备失败" }, { status: 500 });
  }
}
