import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化文件大小的工具函数
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// 时间工具函数
/**
 * 获取当前北京时间
 */
export function getBeijingTime(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
  );
}

/**
 * 将任意时间转换为北京时间
 */
export function toBeijingTime(date: Date | string): Date {
  const inputDate = typeof date === "string" ? new Date(date) : date;
  return new Date(
    inputDate.toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
  );
}

/**
 * 格式化北京时间为字符串
 */
export function formatBeijingTime(
  date: Date | string,
  format: "date" | "time" | "datetime" | "relative" = "datetime"
): string {
  const beijingTime = toBeijingTime(date);

  switch (format) {
    case "date":
      return beijingTime.toLocaleDateString("zh-CN", {
        timeZone: "Asia/Shanghai",
      });
    case "time":
      return beijingTime.toLocaleTimeString("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour12: false,
      });
    case "datetime":
      return beijingTime.toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour12: false,
      });
    case "relative":
      return formatRelativeTime(beijingTime);
    default:
      return beijingTime.toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour12: false,
      });
  }
}

/**
 * 格式化相对时间（几小时前、几天前等）
 */
export function formatRelativeTime(date: Date | string): string {
  const targetDate = toBeijingTime(date);
  const now = getBeijingTime();
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return "刚刚";
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`;
  } else {
    return formatBeijingTime(targetDate, "date");
  }
}

/**
 * 创建北京时间的Date对象
 */
export function createBeijingDate(
  year?: number,
  month?: number,
  day?: number,
  hour?: number,
  minute?: number,
  second?: number
): Date {
  const now = getBeijingTime();
  return new Date(
    year ?? now.getFullYear(),
    month ?? now.getMonth(),
    day ?? now.getDate(),
    hour ?? now.getHours(),
    minute ?? now.getMinutes(),
    second ?? now.getSeconds()
  );
}
