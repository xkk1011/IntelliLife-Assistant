import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBeijingTime } from "@/lib/utils";
import { z } from "zod";

// 更新焕肤提醒的验证schema
const updateGlowReminderSchema = z.object({
  frequency: z.enum(["DAILY", "WEEKLY", "CUSTOM"]).optional(),
  interval: z.number().min(1).optional(),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  weekdays: z.array(z.number().min(1).max(7)).optional(),
  isActive: z.boolean().optional(),
});

// 获取单个焕肤提醒详情
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

    const reminder = await prisma.glowReminder.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            status: true,
            area: {
              select: {
                name: true,
              },
            },
            device: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!reminder) {
      return NextResponse.json({ error: "焕肤提醒不存在" }, { status: 404 });
    }

    // 解析weekdays JSON字符串
    const reminderData = {
      ...reminder,
      weekdays: reminder.weekdays ? JSON.parse(reminder.weekdays) : null,
    };

    return NextResponse.json({
      success: true,
      data: reminderData,
    });
  } catch (error) {
    console.error("获取焕肤提醒详情错误:", error);
    return NextResponse.json(
      { error: "获取焕肤提醒详情失败" },
      { status: 500 }
    );
  }
}

// 更新焕肤提醒
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 验证提醒是否存在且属于当前用户
    const existingReminder = await prisma.glowReminder.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingReminder) {
      return NextResponse.json({ error: "焕肤提醒不存在" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateGlowReminderSchema.parse(body);

    // 准备更新数据
    const updateData: {
      frequency?: "DAILY" | "WEEKLY" | "CUSTOM";
      interval?: number;
      time?: string;
      weekdays?: string | null;
      isActive?: boolean;
      nextReminder?: Date;
    } = {};

    if (validatedData.frequency !== undefined) {
      updateData.frequency = validatedData.frequency;
    }
    if (validatedData.interval !== undefined) {
      updateData.interval = validatedData.interval;
    }
    if (validatedData.time !== undefined) {
      updateData.time = validatedData.time;
    }
    if (validatedData.weekdays !== undefined) {
      updateData.weekdays = validatedData.weekdays
        ? JSON.stringify(validatedData.weekdays)
        : null;
    }
    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive;
    }

    // 如果更新了时间相关设置，重新计算下次提醒时间
    if (
      validatedData.frequency ||
      validatedData.interval ||
      validatedData.time ||
      validatedData.weekdays
    ) {
      const frequency = validatedData.frequency || existingReminder.frequency;
      const interval = validatedData.interval || existingReminder.interval;
      const time = validatedData.time || existingReminder.time;
      const weekdays =
        validatedData.weekdays ||
        (existingReminder.weekdays
          ? JSON.parse(existingReminder.weekdays)
          : null);

      updateData.nextReminder = calculateNextReminder(
        frequency,
        interval,
        time,
        weekdays
      );
    }

    // 更新提醒
    const reminder = await prisma.glowReminder.update({
      where: { id: params.id },
      data: updateData,
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            status: true,
            area: {
              select: {
                name: true,
              },
            },
            device: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // 解析weekdays JSON字符串
    const reminderData = {
      ...reminder,
      weekdays: reminder.weekdays ? JSON.parse(reminder.weekdays) : null,
    };

    return NextResponse.json({
      success: true,
      data: reminderData,
      message: "焕肤提醒更新成功",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("更新焕肤提醒错误:", error);
    return NextResponse.json({ error: "更新焕肤提醒失败" }, { status: 500 });
  }
}

// 删除焕肤提醒
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    // 验证提醒是否存在且属于当前用户
    const reminder = await prisma.glowReminder.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!reminder) {
      return NextResponse.json({ error: "焕肤提醒不存在" }, { status: 404 });
    }

    // 删除提醒
    await prisma.glowReminder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "焕肤提醒删除成功",
    });
  } catch (error) {
    console.error("删除焕肤提醒错误:", error);
    return NextResponse.json({ error: "删除焕肤提醒失败" }, { status: 500 });
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
      if (nextReminder <= now) {
        nextReminder.setDate(nextReminder.getDate() + interval);
      }
      break;

    case "WEEKLY":
      nextReminder.setDate(nextReminder.getDate() + interval * 7);
      if (nextReminder <= now) {
        nextReminder.setDate(nextReminder.getDate() + 7);
      }
      break;

    case "CUSTOM":
      if (weekdays && weekdays.length > 0) {
        const currentDay = now.getDay() || 7;
        const sortedWeekdays = weekdays.sort((a, b) => a - b);

        let nextWeekday = sortedWeekdays.find((day) => day > currentDay);
        if (!nextWeekday) {
          nextWeekday = sortedWeekdays[0] + 7;
        }

        const daysToAdd = nextWeekday - currentDay;
        nextReminder.setDate(nextReminder.getDate() + daysToAdd);

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
        if (nextReminder <= now) {
          nextReminder.setDate(nextReminder.getDate() + 1);
        }
      }
      break;
  }

  return nextReminder;
}
