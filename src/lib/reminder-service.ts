import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getBeijingTime } from "@/lib/utils";
import cron from "node-cron";

// 类型定义
interface GlowReminderWithRelations {
  id: string;
  frequency: "DAILY" | "WEEKLY" | "CUSTOM";
  interval: number;
  time: string;
  weekdays: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  plan: {
    id: string;
    name: string;
    areas?: Array<{
      area: {
        name: string;
      };
    }>;
    devices?: Array<{
      device: {
        name: string;
      };
    }>;
  };
}

interface FitnessReminderWithRelations {
  id: string;
  frequency: "DAILY" | "WEEKLY" | "CUSTOM";
  interval: number;
  time: string;
  weekdays: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  item: {
    id: string;
    name: string;
    plannedDuration?: number | null;
    plannedSets?: number | null;
    plannedReps?: number | null;
  };
}

// 提醒服务类
export class ReminderService {
  private static instance: ReminderService;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  // 启动提醒调度器
  public start() {
    if (this.isRunning) {
      console.log("提醒调度器已在运行");
      return;
    }

    console.log("启动提醒调度器...");

    // 每分钟检查一次提醒
    cron.schedule("* * * * *", async () => {
      await this.processReminders();
    });

    // 每天凌晨2点清理过期提醒
    cron.schedule("0 2 * * *", async () => {
      await this.cleanupExpiredReminders();
    });

    this.isRunning = true;
    console.log("提醒调度器启动成功");
  }

  // 停止提醒调度器
  public stop() {
    this.isRunning = false;
    console.log("提醒调度器已停止");
  }

  // 处理所有到期的提醒
  private async processReminders() {
    try {
      const now = getBeijingTime();

      // 处理焕肤提醒
      await this.processGlowReminders(now);

      // 处理运动提醒
      await this.processFitnessReminders(now);
    } catch (error) {
      console.error("处理提醒时发生错误:", error);
    }
  }

  // 处理焕肤提醒
  private async processGlowReminders(now: Date) {
    const dueReminders = await prisma.glowReminder.findMany({
      where: {
        isActive: true,
        nextReminder: {
          lte: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            areas: {
              select: {
                area: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            devices: {
              select: {
                device: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const reminder of dueReminders) {
      await this.sendGlowReminder(reminder);
      await this.updateNextGlowReminder(reminder);
    }
  }

  // 处理运动提醒
  private async processFitnessReminders(now: Date) {
    const dueReminders = await prisma.fitnessReminder.findMany({
      where: {
        isActive: true,
        nextReminder: {
          lte: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        item: {
          select: {
            id: true,
            name: true,
            plannedDuration: true,
            plannedSets: true,
            plannedReps: true,
          },
        },
      },
    });

    for (const reminder of dueReminders) {
      await this.sendFitnessReminder(reminder);
      await this.updateNextFitnessReminder(reminder);
    }
  }

  // 发送焕肤提醒
  private async sendGlowReminder(reminder: GlowReminderWithRelations) {
    try {
      const { user, plan } = reminder;

      // 获取部位和设备名称
      const areaNames = plan.areas?.map((pa) => pa.area.name).join("、") || "";
      const deviceNames =
        plan.devices?.map((pd) => pd.device.name).join("、") || "";

      // 创建站内信
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "GLOW_REMINDER",
          title: "焕肤提醒",
          content: `是时候进行您的焕肤计划"${plan.name}"了！${areaNames ? `部位：${areaNames}` : ""}${deviceNames ? `，设备：${deviceNames}` : ""}`,
          relatedId: plan.id,
        },
      });

      // 发送邮件提醒
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: "焕肤提醒 - 智享生活助手",
          html: this.generateGlowReminderEmailHtml(user.name || "用户", plan),
        });
      }

      console.log(`焕肤提醒已发送给用户 ${user.email}`);
    } catch (error) {
      console.error("发送焕肤提醒失败:", error);
    }
  }

  // 发送运动提醒
  private async sendFitnessReminder(reminder: FitnessReminderWithRelations) {
    try {
      const { user, item } = reminder;

      // 创建站内信
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "FITNESS_REMINDER",
          title: "运动提醒",
          content: `是时候进行您的运动"${item.name}"了！${item.plannedDuration ? `计划时长：${item.plannedDuration}分钟` : ""}${item.plannedSets ? `，组数：${item.plannedSets}` : ""}${item.plannedReps ? `，次数：${item.plannedReps}` : ""}`,
          relatedId: item.id,
        },
      });

      // 发送邮件提醒
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: "运动提醒 - 智享生活助手",
          html: this.generateFitnessReminderEmailHtml(
            user.name || "用户",
            item
          ),
        });
      }

      console.log(`运动提醒已发送给用户 ${user.email}`);
    } catch (error) {
      console.error("发送运动提醒失败:", error);
    }
  }

  // 更新下次焕肤提醒时间
  private async updateNextGlowReminder(
    reminder: Pick<
      GlowReminderWithRelations,
      "id" | "frequency" | "interval" | "time" | "weekdays"
    >
  ) {
    const nextReminder = this.calculateNextReminder(
      reminder.frequency,
      reminder.interval,
      reminder.time,
      reminder.weekdays ? JSON.parse(reminder.weekdays) : null
    );

    await prisma.glowReminder.update({
      where: { id: reminder.id },
      data: { nextReminder },
    });
  }

  // 更新下次运动提醒时间
  private async updateNextFitnessReminder(
    reminder: Pick<
      FitnessReminderWithRelations,
      "id" | "frequency" | "interval" | "time" | "weekdays"
    >
  ) {
    const nextReminder = this.calculateNextReminder(
      reminder.frequency,
      reminder.interval,
      reminder.time,
      reminder.weekdays ? JSON.parse(reminder.weekdays) : null
    );

    await prisma.fitnessReminder.update({
      where: { id: reminder.id },
      data: { nextReminder },
    });
  }

  // 计算下次提醒时间
  private calculateNextReminder(
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
        nextReminder.setDate(nextReminder.getDate() + interval);
        break;

      case "WEEKLY":
        nextReminder.setDate(nextReminder.getDate() + interval * 7);
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
        } else {
          nextReminder.setDate(nextReminder.getDate() + 1);
        }
        break;
    }

    return nextReminder;
  }

  // 清理过期提醒
  private async cleanupExpiredReminders() {
    try {
      const thirtyDaysAgo = getBeijingTime();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // 清理过期的站内信
      await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
          isRead: true,
        },
      });

      console.log("过期提醒清理完成");
    } catch (error) {
      console.error("清理过期提醒失败:", error);
    }
  }

  // 生成焕肤提醒邮件HTML
  private generateGlowReminderEmailHtml(
    userName: string,
    plan: GlowReminderWithRelations["plan"]
  ): string {
    const areaNames = plan.areas?.map((pa) => pa.area.name).join("、") || "";
    const deviceNames =
      plan.devices?.map((pd) => pd.device.name).join("、") || "";

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">焕肤提醒</h2>
        <p>亲爱的 ${userName}，</p>
        <p>是时候进行您的焕肤计划了！</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">计划详情</h3>
          <p><strong>计划名称：</strong>${plan.name}</p>
          ${areaNames ? `<p><strong>部位：</strong>${areaNames}</p>` : ""}
          ${deviceNames ? `<p><strong>设备：</strong>${deviceNames}</p>` : ""}
        </div>
        <p>请按时完成您的焕肤计划，保持美丽肌肤！</p>
        <p style="color: #6b7280; font-size: 14px;">
          此邮件由智享生活助手自动发送，请勿回复。
        </p>
      </div>
    `;
  }

  // 生成运动提醒邮件HTML
  private generateFitnessReminderEmailHtml(
    userName: string,
    item: FitnessReminderWithRelations["item"]
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">运动提醒</h2>
        <p>亲爱的 ${userName}，</p>
        <p>是时候进行您的运动了！</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #374151;">运动详情</h3>
          <p><strong>运动名称：</strong>${item.name}</p>
          ${item.plannedDuration ? `<p><strong>计划时长：</strong>${item.plannedDuration}分钟</p>` : ""}
          ${item.plannedSets ? `<p><strong>组数：</strong>${item.plannedSets}</p>` : ""}
          ${item.plannedReps ? `<p><strong>次数：</strong>${item.plannedReps}</p>` : ""}
        </div>
        <p>坚持运动，保持健康的生活方式！</p>
        <p style="color: #6b7280; font-size: 14px;">
          此邮件由智享生活助手自动发送，请勿回复。
        </p>
      </div>
    `;
  }
}

// 导出单例实例
export const reminderService = ReminderService.getInstance();
