import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBeijingTime } from "@/lib/utils";
import { z } from "zod";

// 创建运动提醒的验证schema
const createFitnessReminderSchema = z.object({
  itemId: z.string().min(1, "运动条目ID不能为空"),
  frequency: z.enum(["DAILY", "WEEKLY", "CUSTOM"], {
    errorMap: () => ({ message: "提醒频率必须是 DAILY、WEEKLY 或 CUSTOM" }),
  }),
  interval: z.number().min(1, "间隔必须大于0"),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "时间格式必须是 HH:mm"),
  weekdays: z.array(z.number().min(1).max(7)).optional(),
});

// 获取用户的运动提醒列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: {
      userId: string;
      itemId?: string;
    } = {
      userId: session.user.id,
    };

    if (itemId) {
      where.itemId = itemId;
    }

    // 获取提醒列表
    const [reminders, total] = await Promise.all([
      prisma.fitnessReminder.findMany({
        where,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.fitnessReminder.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reminders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("获取运动提醒列表错误:", error);
    return NextResponse.json(
      { error: "获取运动提醒列表失败" },
      { status: 500 }
    );
  }
}

// 创建新的运动提醒
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createFitnessReminderSchema.parse(body);

    // 验证运动条目是否存在且属于当前用户
    const item = await prisma.fitnessItem.findFirst({
      where: {
        id: validatedData.itemId,
        userId: session.user.id,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "运动条目不存在" }, { status: 404 });
    }

    // 计算下次提醒时间
    const nextReminder = calculateNextReminder(
      validatedData.frequency,
      validatedData.interval,
      validatedData.time,
      validatedData.weekdays
    );

    // 创建提醒
    const reminder = await prisma.fitnessReminder.create({
      data: {
        itemId: validatedData.itemId,
        userId: session.user.id,
        frequency: validatedData.frequency,
        interval: validatedData.interval,
        time: validatedData.time,
        weekdays: validatedData.weekdays
          ? JSON.stringify(validatedData.weekdays)
          : null,
        nextReminder,
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: reminder,
        message: "运动提醒创建成功",
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

    console.error("创建运动提醒错误:", error);
    return NextResponse.json({ error: "创建运动提醒失败" }, { status: 500 });
  }
}

// 计算下次提醒时间的辅助函数
function calculateNextReminder(
  frequency: "DAILY" | "WEEKLY" | "CUSTOM",
  interval: number,
  time: string,
  weekdays?: number[]
): Date {
  const now = getBeijingTime();
  const [hours, minutes] = time.split(":").map(Number);

  const nextReminder = getBeijingTime();
  nextReminder.setHours(hours, minutes, 0, 0);

  switch (frequency) {
    case "DAILY":
      // 如果今天的时间已过，设置为明天
      if (nextReminder <= now) {
        nextReminder.setDate(nextReminder.getDate() + interval);
      }
      break;

    case "WEEKLY":
      // 设置为下周的同一天
      nextReminder.setDate(nextReminder.getDate() + interval * 7);
      if (nextReminder <= now) {
        nextReminder.setDate(nextReminder.getDate() + 7);
      }
      break;

    case "CUSTOM":
      if (weekdays && weekdays.length > 0) {
        // 找到下一个指定的星期几
        const currentDay = now.getDay() || 7; // 将周日从0改为7
        const sortedWeekdays = weekdays.sort((a, b) => a - b);

        let nextWeekday = sortedWeekdays.find((day) => day > currentDay);
        if (!nextWeekday) {
          // 如果本周没有更多的提醒日，使用下周的第一个
          nextWeekday = sortedWeekdays[0] + 7;
        }

        const daysToAdd = nextWeekday - currentDay;
        nextReminder.setDate(nextReminder.getDate() + daysToAdd);

        // 如果是今天但时间已过，移到下一个提醒日
        if (daysToAdd === 0 && nextReminder <= now) {
          const nextIndex = sortedWeekdays.indexOf(nextWeekday) + 1;
          if (nextIndex < sortedWeekdays.length) {
            nextReminder.setDate(
              nextReminder.getDate() + (sortedWeekdays[nextIndex] - nextWeekday)
            );
          } else {
            nextReminder.setDate(
              nextReminder.getDate() + (7 - nextWeekday + sortedWeekdays[0])
            );
          }
        }
      } else {
        // 如果没有指定星期几，默认为每天
        if (nextReminder <= now) {
          nextReminder.setDate(nextReminder.getDate() + 1);
        }
      }
      break;
  }

  return nextReminder;
}
