import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 确保数据库连接使用正确的时区
prisma
  .$connect()
  .then(() => {
    console.log("数据库连接成功，时区设置为 Asia/Shanghai");
  })
  .catch((error) => {
    console.error("数据库连接失败:", error);
  });
