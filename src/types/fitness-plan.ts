// 运动计划相关类型定义

export interface UserVideo {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  createdAt: Date;
  _count?: {
    fitnessItems: number;
  };
}

export interface FitnessItemVideo {
  id: string;
  fitnessItemId: string;
  videoId: string;
  createdAt: Date;
  video: UserVideo;
}

export interface FitnessItem {
  id: string;
  userId: string;
  name: string;
  plannedDuration?: number; // 分钟
  plannedSets?: number;
  plannedReps?: number;
  videoId?: string; // 保留用于向后兼容
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
  video?: UserVideo; // 保留用于向后兼容
  videos?: FitnessItemVideo[]; // 新的多对多关系
  reminders?: FitnessReminder[];
  history?: FitnessHistory[];
  _count?: {
    history: number;
    reminders: number;
    videos?: number;
  };
}

export interface FitnessReminder {
  id: string;
  itemId: string;
  userId: string;
  frequency: "DAILY" | "WEEKLY" | "CUSTOM";
  interval: number;
  time: string;
  weekdays?: string;
  nextReminder: Date;
  isActive: boolean;
  createdAt: Date;
  item?: FitnessItem;
}

export interface FitnessHistory {
  id: string;
  itemId: string;
  userId: string;
  duration?: number; // 分钟
  sets?: number;
  reps?: number;
  completedAt: Date;
  notes?: string;
  createdAt: Date;
  item?: {
    name: string;
  };
}

// API 响应类型
export interface FitnessItemsResponse {
  success: boolean;
  data: {
    items: FitnessItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface FitnessItemResponse {
  success: boolean;
  data: FitnessItem;
  message?: string;
}

export interface UserVideosResponse {
  success: boolean;
  data: UserVideo[];
}

export interface UserVideoResponse {
  success: boolean;
  data: UserVideo;
  message?: string;
}

export interface FitnessHistoryResponse {
  success: boolean;
  data: {
    history: FitnessHistory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: {
      totalSessions: number;
      totalDuration: number;
      averageDuration: number;
      totalSets: number;
      totalReps: number;
    };
  };
}

// 表单数据类型
export interface CreateFitnessItemData {
  name: string;
  plannedDuration?: number;
  plannedSets?: number;
  plannedReps?: number;
  videoId?: string; // 保留用于向后兼容
  videoIds?: string[]; // 新的多选视频支持
}

export interface UpdateFitnessItemData {
  name?: string;
  plannedDuration?: number | null;
  plannedSets?: number | null;
  plannedReps?: number | null;
  videoId?: string | null; // 保留用于向后兼容
  videoIds?: string[] | null; // 新的多选视频支持
  status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
}

export interface CompleteFitnessItemData {
  duration?: number;
  sets?: number;
  reps?: number;
  notes?: string;
  completedAt?: string;
}

// 状态选项
export const FITNESS_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "活跃", color: "green" },
  { value: "PAUSED", label: "暂停", color: "yellow" },
  { value: "COMPLETED", label: "已完成", color: "blue" },
  { value: "ARCHIVED", label: "已归档", color: "gray" },
] as const;

// 工具函数
export function getFitnessStatusLabel(status: string): string {
  const option = FITNESS_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label || status;
}

export function getFitnessStatusColor(status: string): string {
  const option = FITNESS_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || "gray";
}

// 格式化时长
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}小时${remainingMinutes}分钟`
    : `${hours}小时`;
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 视频文件类型验证
export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/avi",
  "video/mov",
  "video/wmv",
] as const;

export const MAX_VIDEO_SIZE = 300 * 1024 * 1024; // 300MB

export function isValidVideoType(mimeType: string): boolean {
  return ALLOWED_VIDEO_TYPES.includes(
    mimeType as (typeof ALLOWED_VIDEO_TYPES)[number]
  );
}

export function isValidVideoSize(size: number): boolean {
  return size <= MAX_VIDEO_SIZE;
}
