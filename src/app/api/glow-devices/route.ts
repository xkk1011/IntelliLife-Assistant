import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 创建焕肤设备的验证schema
const createGlowDeviceSchema = z.object({
  name: z
    .string()
    .min(1, "设备名称不能为空")
    .max(100, "设备名称不能超过100个字符"),
  model: z.string().max(100, "设备型号不能超过100个字符").optional(),
});

// 获取用户的焕肤设备列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const devices = await prisma.glowDevice.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            plans: true,
            historyDevices: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: devices,
    });
  } catch (error) {
    console.error("获取焕肤设备列表错误:", error);
    return NextResponse.json(
      { error: "获取焕肤设备列表失败" },
      { status: 500 }
    );
  }
}

// 创建新的焕肤设备
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createGlowDeviceSchema.parse(body);

    // 检查是否已存在相同名称的设备
    const existingDevice = await prisma.glowDevice.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name,
      },
    });

    if (existingDevice) {
      return NextResponse.json({ error: "该设备名称已存在" }, { status: 400 });
    }

    // 准备创建数据，确保空字符串和undefined转换为null
    const createData = {
      ...validatedData,
      model:
        !validatedData.model || validatedData.model.trim() === ""
          ? null
          : validatedData.model,
      userId: session.user.id,
    };

    // 创建焕肤设备
    const device = await prisma.glowDevice.create({
      data: createData,
    });

    return NextResponse.json(
      {
        success: true,
        data: device,
        message: "焕肤设备创建成功",
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

    console.error("创建焕肤设备错误:", error);
    return NextResponse.json({ error: "创建焕肤设备失败" }, { status: 500 });
  }
}
