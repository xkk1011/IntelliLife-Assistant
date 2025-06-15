import { z } from "zod";

/**
 * 环境变量验证Schema
 */
const envSchema = z.object({
  // 应用基础配置
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXTAUTH_URL: z.string().url(),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(65535))
    .optional(),

  // 数据库配置
  DATABASE_URL: z.string().min(1),

  // NextAuth.js 配置
  NEXTAUTH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("86400"),
  SESSION_MAX_AGE: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("2592000"),

  // 邮件配置
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  FROM_NAME: z.string().optional(),

  // 文件存储配置
  UPLOAD_DIR: z.string().default("./public/uploads"),
  VIDEO_UPLOAD_DIR: z.string().default("./public/uploads/videos"),
  AVATAR_UPLOAD_DIR: z.string().default("./public/uploads/avatars"),
  MAX_FILE_SIZE: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("104857600"),
  ALLOWED_VIDEO_TYPES: z.string().default("video/mp4,video/webm,video/avi"),
  ALLOWED_IMAGE_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/gif,image/webp"),

  // 安全配置
  RATE_LIMIT_PER_MINUTE: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("100"),
  PASSWORD_MIN_LENGTH: z
    .string()
    .transform(Number)
    .pipe(z.number().min(6))
    .default("8"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // 日志配置
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  ENABLE_CONSOLE_LOG: z
    .string()
    .transform((val) => val === "true")
    .default("true"),

  // 开发环境配置
  DEBUG: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  SHOW_ERROR_DETAILS: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
  SKIP_EMAIL_SENDING: z
    .string()
    .transform((val) => val === "true")
    .default("false"),

  // 可选的第三方服务配置
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // 时区配置
  TZ: z.string().default("Asia/Shanghai"),
});

/**
 * 验证并解析环境变量
 */
function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      throw new Error(`环境变量验证失败:\n${missingVars}`);
    }
    throw error;
  }
}

/**
 * 类型安全的环境变量
 */
export const env = validateEnv();

/**
 * 环境变量类型定义
 */
export type Env = z.infer<typeof envSchema>;

/**
 * 检查是否为开发环境
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * 检查是否为生产环境
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * 检查是否为测试环境
 */
export const isTest = env.NODE_ENV === "test";

/**
 * 获取应用基础URL
 */
export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // 客户端
    return window.location.origin;
  }

  // 服务端
  return env.NEXTAUTH_URL;
};

/**
 * 文件上传配置
 */
export const fileUploadConfig = {
  maxSize: env.MAX_FILE_SIZE,
  allowedVideoTypes: env.ALLOWED_VIDEO_TYPES.split(",").map((type) =>
    type.trim()
  ),
  allowedImageTypes: env.ALLOWED_IMAGE_TYPES.split(",").map((type) =>
    type.trim()
  ),
  uploadDir: env.UPLOAD_DIR,
  videoDir: env.VIDEO_UPLOAD_DIR,
  avatarDir: env.AVATAR_UPLOAD_DIR,
};

/**
 * 邮件配置
 */
export const emailConfig = {
  apiKey: env.RESEND_API_KEY,
  fromEmail: env.FROM_EMAIL || "noreply@localhost",
  fromName: env.FROM_NAME || "智享生活助手",
  skipSending: env.SKIP_EMAIL_SENDING,
};

/**
 * 安全配置
 */
export const securityConfig = {
  rateLimitPerMinute: env.RATE_LIMIT_PER_MINUTE,
  passwordMinLength: env.PASSWORD_MIN_LENGTH,
  corsOrigin: env.CORS_ORIGIN,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  sessionMaxAge: env.SESSION_MAX_AGE,
};

/**
 * 日志配置
 */
export const logConfig = {
  level: env.LOG_LEVEL,
  enableConsole: env.ENABLE_CONSOLE_LOG,
};

/**
 * 开发配置
 */
export const devConfig = {
  debug: env.DEBUG,
  showErrorDetails: env.SHOW_ERROR_DETAILS,
};

/**
 * 时区配置
 */
export const timezoneConfig = {
  timezone: env.TZ,
};

/**
 * 验证必需的环境变量是否已设置
 */
export function validateRequiredEnvVars() {
  const requiredVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `缺少必需的环境变量: ${missingVars.join(", ")}\n` +
        "请检查 .env 文件或环境变量配置"
    );
  }
}

/**
 * 生产环境安全检查
 */
export function validateProductionSecurity() {
  if (!isProduction) return;

  const warnings: string[] = [];

  // 检查密钥强度
  if (env.NEXTAUTH_SECRET.length < 32) {
    warnings.push("NEXTAUTH_SECRET 长度不足，建议至少32个字符");
  }

  if (
    env.NEXTAUTH_SECRET.includes("your-secret-key") ||
    env.NEXTAUTH_SECRET.includes("dev-secret")
  ) {
    warnings.push("NEXTAUTH_SECRET 使用了默认值，请更换为安全的密钥");
  }

  // 检查邮件配置
  if (!env.RESEND_API_KEY) {
    warnings.push("生产环境建议配置 RESEND_API_KEY 以启用邮件功能");
  }

  if (warnings.length > 0) {
    console.warn("生产环境安全警告:");
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }
}

/**
 * 打印环境配置信息 (开发环境)
 */
export function printEnvInfo() {
  if (!isDevelopment) return;

  console.log("🚀 应用启动配置:");
  console.log(`   环境: ${env.NODE_ENV}`);
  console.log(`   URL: ${env.NEXTAUTH_URL}`);
  console.log(`   数据库: ${env.DATABASE_URL.replace(/:[^:]*@/, ":***@")}`);
  console.log(`   调试模式: ${env.DEBUG ? "开启" : "关闭"}`);
  console.log(`   邮件发送: ${env.SKIP_EMAIL_SENDING ? "跳过" : "启用"}`);
}
