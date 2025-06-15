import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 更新焕肤部位的验证schema
const updateGlowAreaSchema = z.object({
  name: z
    .string()
    .min(1, "部位名称不能为空")
    .max(50, "部位名称不能超过50个字符"),
});

// 获取单个焕肤部位详情
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

    const area = await prisma.glowArea.findFirst({
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

    if (!area) {
      return NextResponse.json({ error: "焕肤部位不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: area,
    });
  } catch (error) {
    console.error("获取焕肤部位详情错误:", error);
    return NextResponse.json(
      { error: "获取焕肤部位详情失败" },
      { status: 500 }
    );
  }
}

// 更新焕肤部位
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

    // 验证部位是否存在且属于当前用户
    const existingArea = await prisma.glowArea.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!existingArea) {
      return NextResponse.json({ error: "焕肤部位不存在" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateGlowAreaSchema.parse(body);

    // 检查是否已存在相同名称的部位（排除当前部位）
    const duplicateArea = await prisma.glowArea.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name,
        id: {
          not: id,
        },
      },
    });

    if (duplicateArea) {
      return NextResponse.json({ error: "该部位名称已存在" }, { status: 400 });
    }

    // 更新焕肤部位
    const updatedArea = await prisma.glowArea.update({
      where: { id: id },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      data: updatedArea,
      message: "焕肤部位更新成功",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.errors },
        { status: 400 }
      );
    }

    console.error("更新焕肤部位错误:", error);
    return NextResponse.json({ error: "更新焕肤部位失败" }, { status: 500 });
  }
}

// 删除焕肤部位
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

    // 验证部位是否存在且属于当前用户
    const existingArea = await prisma.glowArea.findFirst({
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

    if (!existingArea) {
      return NextResponse.json({ error: "焕肤部位不存在" }, { status: 404 });
    }

    // 检查是否有关联的计划
    if (existingArea._count.plans > 0) {
      return NextResponse.json(
        { error: "该部位下还有关联的焕肤计划，无法删除" },
        { status: 400 }
      );
    }

    // 删除焕肤部位
    await prisma.glowArea.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "焕肤部位删除成功",
    });
  } catch (error) {
    console.error("删除焕肤部位错误:", error);
    return NextResponse.json({ error: "删除焕肤部位失败" }, { status: 500 });
  }
}
