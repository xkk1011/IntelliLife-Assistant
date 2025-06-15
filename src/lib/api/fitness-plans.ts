// 运动计划相关的API客户端函数

import {
  FitnessItemsResponse,
  FitnessItemResponse,
  UserVideosResponse,
  UserVideoResponse,
  FitnessHistoryResponse,
  CreateFitnessItemData,
  UpdateFitnessItemData,
  CompleteFitnessItemData,
} from "@/types/fitness-plan";

// 运动条目相关API
export const fitnessItemsApi = {
  // 获取运动条目列表
  async getItems(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<FitnessItemsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);

    const response = await fetch(`/api/fitness-items?${searchParams}`);
    if (!response.ok) {
      throw new Error("获取运动条目列表失败");
    }
    return response.json();
  },

  // 获取单个运动条目
  async getItem(id: string): Promise<FitnessItemResponse> {
    const response = await fetch(`/api/fitness-items/${id}`);
    if (!response.ok) {
      throw new Error("获取运动条目详情失败");
    }
    return response.json();
  },

  // 创建运动条目
  async createItem(data: CreateFitnessItemData): Promise<FitnessItemResponse> {
    const response = await fetch("/api/fitness-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "创建运动条目失败");
    }
    return response.json();
  },

  // 更新运动条目
  async updateItem(
    id: string,
    data: UpdateFitnessItemData
  ): Promise<FitnessItemResponse> {
    const response = await fetch(`/api/fitness-items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "更新运动条目失败");
    }
    return response.json();
  },

  // 删除运动条目
  async deleteItem(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/fitness-items/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "删除运动条目失败");
    }
    return response.json();
  },

  // 标记运动条目完成
  async completeItem(
    id: string,
    data: CompleteFitnessItemData
  ): Promise<{ success: boolean; message: string; data?: unknown }> {
    const response = await fetch(`/api/fitness-items/${id}/complete`, {
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

  // 获取运动条目历史记录
  async getItemHistory(
    id: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<FitnessHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);

    const response = await fetch(
      `/api/fitness-items/${id}/history?${searchParams}`
    );
    if (!response.ok) {
      throw new Error("获取历史记录失败");
    }
    return response.json();
  },

  // 删除运动历史记录
  async deleteHistory(
    historyId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/fitness-history/${historyId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "删除历史记录失败");
    }
    return response.json();
  },
};

// 视频相关API
export const videosApi = {
  // 上传视频
  async uploadVideo(file: File): Promise<UserVideoResponse> {
    const formData = new FormData();
    formData.append("video", file);

    const response = await fetch("/api/upload/video", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "视频上传失败");
    }
    return response.json();
  },

  // 获取视频列表
  async getVideos(params?: {
    page?: number;
    limit?: number;
  }): Promise<UserVideosResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const response = await fetch(`/api/upload/video?${searchParams}`);
    if (!response.ok) {
      throw new Error("获取视频列表失败");
    }
    return response.json();
  },

  // 获取单个视频
  async getVideo(id: string): Promise<UserVideoResponse> {
    const response = await fetch(`/api/videos/${id}`);
    if (!response.ok) {
      throw new Error("获取视频详情失败");
    }
    return response.json();
  },

  // 删除视频
  async deleteVideo(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`/api/videos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "删除视频失败");
    }
    return response.json();
  },
};
