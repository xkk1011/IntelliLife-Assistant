import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 创建焕肤部位的验证schema
const createGlowAreaSchema = z.object({
  name: z
    .string()
    .min(1, "部位名称不能为空")
    .max(50, "部位名称不能超过50个字符"),
});

// 获取用户的焕肤部位列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const areas = await prisma.glowArea.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            plans: true,
            historyAreas: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: areas,
    });
  } catch (error) {
    console.error("获取焕肤部位列表错误:", error);
    return NextResponse.json(
      { error: "获取焕肤部位列表失败" },
      { status: 500 }
    );
  }
}

// 创建新的焕肤部位
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createGlowAreaSchema.parse(body);

    // 检查是否已存在相同名称的部位
    const existingArea = await prisma.glowArea.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name,
      },
    });

    if (existingArea) {
      return NextResponse.json({ error: "该部位名称已存在" }, { status: 400 });
    }

    // 创建焕肤部位
    const area = await prisma.glowArea.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: area,
        message: "焕肤部位创建成功",
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

    console.error("创建焕肤部位错误:", error);
    return NextResponse.json({ error: "创建焕肤部位失败" }, { status: 500 });
  }
}
