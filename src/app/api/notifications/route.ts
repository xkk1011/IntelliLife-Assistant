import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// 创建通知的验证schema
const createNotificationSchema = z.object({
  type: z.enum(["GLOW_REMINDER", "FITNESS_REMINDER", "SYSTEM", "ACHIEVEMENT"], {
    errorMap: () => ({
      message:
        "通知类型必须是 GLOW_REMINDER、FITNESS_REMINDER、SYSTEM 或 ACHIEVEMENT",
    }),
  }),
  title: z.string().min(1, "标题不能为空").max(100, "标题不能超过100个字符"),
  content: z.string().min(1, "内容不能为空").max(500, "内容不能超过500个字符"),
  relatedId: z.string().optional(),
});

// 获取用户的通知列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const isRead = searchParams.get("isRead");

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: {
      userId: string;
      type?: "GLOW_REMINDER" | "FITNESS_REMINDER" | "SYSTEM" | "ACHIEVEMENT";
      isRead?: boolean;
    } = {
      userId: session.user.id,
    };

    if (
      type &&
      ["GLOW_REMINDER", "FITNESS_REMINDER", "SYSTEM", "ACHIEVEMENT"].includes(
        type
      )
    ) {
      where.type = type;
    }

    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === "true";
    }

    // 获取通知列表
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: session.user.id,
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      },
    });
  } catch (error) {
    console.error("获取通知列表错误:", error);
    return NextResponse.json({ error: "获取通知列表失败" }, { status: 500 });
  }
}

// 创建新通知（主要用于系统内部调用）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createNotificationSchema.parse(body);

    // 创建通知
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: validatedData.type,
        title: validatedData.title,
        content: validatedData.content,
        relatedId: validatedData.relatedId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: notification,
        message: "通知创建成功",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("创建通知错误:", error);
    return NextResponse.json({ error: "创建通知失败" }, { status: 500 });
  }
}

// 批量标记通知为已读
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // 标记所有未读通知为已读
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "所有通知已标记为已读",
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // 标记指定通知为已读
      await prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds,
          },
          userId: session.user.id,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "指定通知已标记为已读",
      });
    } else {
      return NextResponse.json(
        { error: "请提供有效的通知ID列表或设置markAllAsRead为true" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("标记通知已读错误:", error);
    return NextResponse.json({ error: "标记通知已读失败" }, { status: 500 });
  }
}

// 批量删除通知
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notificationIds = searchParams.get("ids")?.split(",");
    const deleteAll = searchParams.get("deleteAll") === "true";
    const deleteRead = searchParams.get("deleteRead") === "true";

    if (deleteAll) {
      // 删除所有通知
      await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "所有通知已删除",
      });
    } else if (deleteRead) {
      // 删除所有已读通知
      await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
          isRead: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "所有已读通知已删除",
      });
    } else if (notificationIds && notificationIds.length > 0) {
      // 删除指定通知
      await prisma.notification.deleteMany({
        where: {
          id: {
            in: notificationIds,
          },
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "指定通知已删除",
      });
    } else {
      return NextResponse.json(
        { error: "请提供有效的删除参数" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("删除通知错误:", error);
    return NextResponse.json({ error: "删除通知失败" }, { status: 500 });
  }
}
