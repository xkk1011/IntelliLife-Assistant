import { UserVideo } from '@/types/fitness-plan'

export interface GetVideosResponse {
  success: boolean
  data: {
    videos: UserVideo[]
    total: number
    page: number
    limit: number
  }
}

export interface VideoResponse {
  success: boolean
  data: UserVideo
  message?: string
}

export interface DeleteVideoResponse {
  success: boolean
  message: string
}

class VideosApi {
  private baseUrl = '/api'

  async getVideos(params?: {
    page?: number
    limit?: number
  }): Promise<GetVideosResponse> {
    const searchParams = new URLSearchParams()
    
    if (params?.page) {
      searchParams.append('page', params.page.toString())
    }
    if (params?.limit) {
      searchParams.append('limit', params.limit.toString())
    }

    const url = `${this.baseUrl}/upload/video${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '获取视频列表失败')
    }

    return response.json()
  }

  async getVideo(id: string): Promise<VideoResponse> {
    const response = await fetch(`${this.baseUrl}/videos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '获取视频详情失败')
    }

    return response.json()
  }

  async deleteVideo(id: string): Promise<DeleteVideoResponse> {
    const response = await fetch(`${this.baseUrl}/videos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '删除视频失败')
    }

    return response.json()
  }

  async uploadVideo(file: File): Promise<VideoResponse> {
    const formData = new FormData()
    formData.append('video', file)

    const response = await fetch(`${this.baseUrl}/upload/video`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '上传视频失败')
    }

    return response.json()
  }
}

export const videosApi = new VideosApi()
