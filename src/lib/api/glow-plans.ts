// 焕肤计划相关的API客户端函数

import {
  GlowPlansResponse,
  GlowPlanResponse,
  GlowAreasResponse,
  GlowAreaResponse,
  GlowDevicesResponse,
  GlowDeviceResponse,
  GlowHistoryResponse,
  CreateGlowPlanData,
  UpdateGlowPlanData,
  CreateGlowAreaData,
  UpdateGlowAreaData,
  CreateGlowDeviceData,
  UpdateGlowDeviceData,
  CompleteGlowPlanData,
} from "@/types/glow-plan";

// 焕肤计划相关API
export const glowPlansApi = {
  // 获取焕肤计划列表
  async getPlans(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<GlowPlansResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);

    const response = await fetch(`/api/glow-plans?${searchParams}`);
    if (!response.ok) {
      throw new Error("获取焕肤计划列表失败");
    }
    return response.json();
  },

  // 获取单个焕肤计划
  async getPlan(id: string): Promise<GlowPlanResponse> {
    const response = await fetch(`/api/glow-plans/${id}`);
    if (!response.ok) {
      throw new Error("获取焕肤计划详情失败");
    }
    return response.json();
  },

  // 创建焕肤计划
  async createPlan(data: CreateGlowPlanData): Promise<GlowPlanResponse> {
    const response = await fetch("/api/glow-plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "创建焕肤计划失败");
    }
    return response.json();
  },

  // 更新焕肤计划
  async updatePlan(
    id: string,
    data: UpdateGlowPlanData
  ): Promise<GlowPlanResponse> {
    const response = await fetch(`/api/glow-plans/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "更新焕肤计划失败");
    }
    return response.json();
  },

  // 删除焕肤计划
  async deletePlan(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/glow-plans/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "删除焕肤计划失败");
    }
    return response.json();
  },

  // 标记焕肤计划完成
  async completePlan(
    id: string,
    data: CompleteGlowPlanData
  ): Promise<{ success: boolean; message: string; data?: unknown }> {
    const response = await fetch(`/api/glow-plans/${id}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "标记完成失败");
    }
    return response.json();
  },

  // 获取焕肤计划历史记录
  async getPlanHistory(
    id: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<GlowHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);

    const response = await fetch(
      `/api/glow-plans/${id}/history?${searchParams}`
    );
    if (!response.ok) {
      throw new Error("获取历史记录失败");
    }
    return response.json();
  },

  // 删除焕肤历史记录
  async deleteHistory(
    historyId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/glow-history/${historyId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "删除历史记录失败");
    }
    return response.json();
  },
};

// 焕肤部位相关API
export const glowAreasApi = {
  // 获取焕肤部位列表
  async getAreas(): Promise<GlowAreasResponse> {
    const response = await fetch("/api/glow-areas");
    if (!response.ok) {
      throw new Error("获取焕肤部位列表失败");
    }
    return response.json();
  },

  // 获取单个焕肤部位
  async getArea(id: string): Promise<GlowAreaResponse> {
    const response = await fetch(`/api/glow-areas/${id}`);
    if (!response.ok) {
      throw new Error("获取焕肤部位详情失败");
    }
    return response.json();
  },

  // 创建焕肤部位
  async createArea(data: CreateGlowAreaData): Promise<GlowAreaResponse> {
    const response = await fetch("/api/glow-areas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "创建焕肤部位失败");
    }
    return response.json();
  },

  // 更新焕肤部位
  async updateArea(
    id: string,
    data: UpdateGlowAreaData
  ): Promise<GlowAreaResponse> {
    const response = await fetch(`/api/glow-areas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "更新焕肤部位失败");
    }
    return response.json();
  },

  // 删除焕肤部位
  async deleteArea(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/glow-areas/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "删除焕肤部位失败");
    }
    return response.json();
  },
};

// 焕肤设备相关API
export const glowDevicesApi = {
  // 获取焕肤设备列表
  async getDevices(): Promise<GlowDevicesResponse> {
    const response = await fetch("/api/glow-devices");
    if (!response.ok) {
      throw new Error("获取焕肤设备列表失败");
    }
    return response.json();
  },

  // 获取单个焕肤设备
  async getDevice(id: string): Promise<GlowDeviceResponse> {
    const response = await fetch(`/api/glow-devices/${id}`);
    if (!response.ok) {
      throw new Error("获取焕肤设备详情失败");
    }
    return response.json();
  },

  // 创建焕肤设备
  async createDevice(data: CreateGlowDeviceData): Promise<GlowDeviceResponse> {
    const response = await fetch("/api/glow-devices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "创建焕肤设备失败");
    }
    return response.json();
  },

  // 更新焕肤设备
  async updateDevice(
    id: string,
    data: UpdateGlowDeviceData
  ): Promise<GlowDeviceResponse> {
    const response = await fetch(`/api/glow-devices/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "更新焕肤设备失败");
    }
    return response.json();
  },

  // 删除焕肤设备
  async deleteDevice(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/glow-devices/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "删除焕肤设备失败");
    }
    return response.json();
  },
};
