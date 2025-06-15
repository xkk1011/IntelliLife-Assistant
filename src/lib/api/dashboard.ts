// 仪表盘相关的API客户端函数

import { DashboardStatsResponse } from "@/types/dashboard";

export const dashboardApi = {
  // 获取仪表盘统计数据
  async getStats(): Promise<DashboardStatsResponse> {
    const response = await fetch("/api/dashboard/stats");
    if (!response.ok) {
      throw new Error("获取仪表盘统计数据失败");
    }
    return response.json();
  },
};
