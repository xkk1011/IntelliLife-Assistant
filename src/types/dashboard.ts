// 仪表盘相关类型定义

export interface DashboardStats {
  glowPlans: {
    total: number;
    active: number;
  };
  fitnessItems: {
    total: number;
    active: number;
  };
  notifications: {
    unread: number;
  };
  reminders: {
    total: number;
    glow: number;
    fitness: number;
  };
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
  error?: string;
}
