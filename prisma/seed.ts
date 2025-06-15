import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("开始创建种子数据...");

  // 创建管理员用户
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@intellilife.com" },
    update: {},
    create: {
      email: "admin@intellilife.com",
      name: "系统管理员",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("管理员用户创建完成:", admin.email);

  // 创建测试用户
  const userPassword = await bcrypt.hash("user123", 12);
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "测试用户",
      password: userPassword,
      role: "USER",
    },
  });

  console.log("测试用户创建完成:", testUser.email);

  // 为测试用户创建一些示例数据
  // 创建焕肤部位
  const glowArea = await prisma.glowArea.create({
    data: {
      userId: testUser.id,
      name: "面部",
    },
  });

  // 创建焕肤设备
  const glowDevice = await prisma.glowDevice.create({
    data: {
      userId: testUser.id,
      name: "美容仪",
      model: "Model X1",
    },
  });

  // 创建焕肤计划
  const glowPlan = await prisma.glowPlan.create({
    data: {
      userId: testUser.id,
      name: "夏季面部护理计划",
      startDate: new Date(),
      areas: {
        create: {
          areaId: glowArea.id,
        },
      },
      devices: {
        create: {
          deviceId: glowDevice.id,
        },
      },
    },
  });

  // 创建运动条目
  const fitnessItem = await prisma.fitnessItem.create({
    data: {
      userId: testUser.id,
      name: "晨练瑜伽",
      plannedDuration: 30,
      plannedSets: 1,
      plannedReps: 1,
    },
  });

  console.log("示例数据创建完成");
  console.log("种子数据创建完成!");
}

main()
  .catch((e) => {
    console.error("种子数据创建失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
