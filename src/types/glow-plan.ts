// 焕肤计划相关类型定义

export interface GlowArea {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  _count?: {
    plans: number;
    history: number;
  };
  plans?: GlowPlan[];
}

export interface GlowDevice {
  id: string;
  userId: string;
  name: string;
  model?: string;
  createdAt: Date;
  _count?: {
    plans: number;
    history: number;
  };
  plans?: GlowPlan[];
}

export interface GlowPlan {
  id: string;
  userId: string;
  name: string;
  startDate: Date;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
  areas?: GlowPlanArea[];
  devices?: GlowPlanDevice[];
  reminders?: GlowReminder[];
  history?: GlowHistory[];
  _count?: {
    history: number;
    reminders: number;
  };
}

export interface GlowPlanArea {
  id: string;
  planId: string;
  areaId: string;
  plan?: GlowPlan;
  area?: GlowArea;
}

export interface GlowPlanDevice {
  id: string;
  planId: string;
  deviceId: string;
  plan?: GlowPlan;
  device?: GlowDevice;
}

export interface GlowReminder {
  id: string;
  planId: string;
  userId: string;
  frequency: "DAILY" | "WEEKLY" | "CUSTOM";
  interval: number;
  time: string;
  weekdays?: string;
  nextReminder: Date;
  isActive: boolean;
  createdAt: Date;
  plan?: GlowPlan;
}

export interface GlowHistory {
  id: string;
  planId: string;
  userId: string;
  duration?: number;
  completedAt: Date;
  notes?: string;
  createdAt: Date;
  plan?: {
    name: string;
  };
  areas?: GlowHistoryArea[];
  devices?: GlowHistoryDevice[];
}

export interface GlowHistoryArea {
  id: string;
  historyId: string;
  areaId: string;
  history?: GlowHistory;
  area?: GlowArea;
}

export interface GlowHistoryDevice {
  id: string;
  historyId: string;
  deviceId: string;
  history?: GlowHistory;
  device?: GlowDevice;
}

// API 响应类型
export interface GlowPlansResponse {
  success: boolean;
  data: {
    plans: GlowPlan[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GlowPlanResponse {
  success: boolean;
  data: GlowPlan;
  message?: string;
}

export interface GlowAreasResponse {
  success: boolean;
  data: GlowArea[];
}

export interface GlowAreaResponse {
  success: boolean;
  data: GlowArea;
  message?: string;
}

export interface GlowDevicesResponse {
  success: boolean;
  data: GlowDevice[];
}

export interface GlowDeviceResponse {
  success: boolean;
  data: GlowDevice;
  message?: string;
}

export interface GlowHistoryResponse {
  success: boolean;
  data: {
    history: GlowHistory[];
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
    };
  };
}

// 表单数据类型
export interface CreateGlowPlanData {
  name: string;
  areaIds?: string[];
  deviceIds?: string[];
  startDate: string;
}

export interface UpdateGlowPlanData {
  name?: string;
  areaIds?: string[];
  deviceIds?: string[];
  startDate?: string;
  status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
}

export interface CreateGlowAreaData {
  name: string;
}

export interface UpdateGlowAreaData {
  name: string;
}

export interface CreateGlowDeviceData {
  name: string;
  model?: string;
}

export interface UpdateGlowDeviceData {
  name?: string;
  model?: string;
}

export interface CompleteGlowPlanData {
  duration?: number;
  notes?: string;
  completedAt?: string;
  areaIds?: string[];
  deviceIds?: string[];
}

// 状态选项
export const PLAN_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "活跃", color: "green" },
  { value: "PAUSED", label: "暂停", color: "yellow" },
  { value: "COMPLETED", label: "已完成", color: "blue" },
  { value: "ARCHIVED", label: "已归档", color: "gray" },
] as const;

// 工具函数
export function getPlanStatusLabel(status: string): string {
  const option = PLAN_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.label || status;
}

export function getPlanStatusColor(status: string): string {
  const option = PLAN_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || "gray";
}
