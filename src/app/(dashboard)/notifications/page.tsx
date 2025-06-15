'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Bell,
  BellRing,
  Trash2,
  CheckCheck,
  Filter,
  Sparkles,
  Dumbbell,
  Settings,
  Trophy
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatRelativeTime } from '@/lib/utils'

interface Notification {
  id: string
  type: 'GLOW_REMINDER' | 'FITNESS_REMINDER' | 'SYSTEM' | 'ACHIEVEMENT'
  title: string
  content: string
  relatedId?: string
  isRead: boolean
  createdAt: string
}

const notificationTypeConfig = {
  GLOW_REMINDER: {
    icon: Sparkles,
    label: '焕肤提醒',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  FITNESS_REMINDER: {
    icon: Dumbbell,
    label: '运动提醒',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  SYSTEM: {
    icon: Settings,
    label: '系统通知',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  ACHIEVEMENT: {
    icon: Trophy,
    label: '成就通知',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [unreadCount, setUnreadCount] = useState(0)

  // 加载通知列表
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') {
        if (filter === 'unread') {
          params.append('isRead', 'false')
        } else {
          params.append('type', filter)
        }
      }

      const response = await fetch(`/api/notifications?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setNotifications(result.data.notifications)
        setUnreadCount(result.data.unreadCount)
      } else {
        toast.error(result.error || '加载通知失败')
      }
    } catch (error) {
      console.error('加载通知错误:', error)
      toast.error('加载通知失败')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // 标记为已读
  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('已标记为已读')
        loadNotifications()
        setSelectedIds([])
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      console.error('标记已读错误:', error)
      toast.error('操作失败')
    }
  }

  // 全部标记为已读
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('所有通知已标记为已读')
        loadNotifications()
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      console.error('标记全部已读错误:', error)
      toast.error('操作失败')
    }
  }

  // 删除通知
  const deleteNotifications = async (notificationIds: string[]) => {
    if (!confirm('确定要删除选中的通知吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/notifications?ids=${notificationIds.join(',')}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('通知删除成功')
        loadNotifications()
        setSelectedIds([])
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除通知错误:', error)
      toast.error('删除失败')
    }
  }

  // 处理选择
  const handleSelect = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, notificationId])
    } else {
      setSelectedIds(selectedIds.filter(id => id !== notificationId))
    }
  }

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(notifications.map(n => n.id))
    } else {
      setSelectedIds([])
    }
  }

  // 单击通知标记为已读
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead([notification.id])
    }
  }

  const formatTime = (dateString: string) => {
    return formatRelativeTime(dateString)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">加载通知中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="站内信"
        description={`管理您的通知消息 ${unreadCount > 0 ? `(${unreadCount}条未读)` : ''}`}
        action={
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                全部已读
              </Button>
            )}
          </div>
        }
      />

      {/* 过滤器 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <div className="flex items-center space-x-2">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'unread', label: '未读' },
                  { key: 'GLOW_REMINDER', label: '焕肤提醒' },
                  { key: 'FITNESS_REMINDER', label: '运动提醒' },
                  { key: 'SYSTEM', label: '系统通知' },
                  { key: 'ACHIEVEMENT', label: '成就通知' },
                ].map((item) => (
                  <Button
                    key={item.key}
                    variant={filter === item.key ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(item.key)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 批量操作 */}
            {selectedIds.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  已选择 {selectedIds.length} 项
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAsRead(selectedIds)}
                >
                  标记已读
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteNotifications(selectedIds)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* 通知列表 */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Bell className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无通知</h3>
            <p className="text-gray-500 text-center">
              {filter === 'unread' ? '您没有未读通知' : '您还没有收到任何通知'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedIds.length === notifications.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-500">全选</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {notifications.map((notification) => {
                const config = notificationTypeConfig[notification.type]
                const Icon = config.icon

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                      !notification.isRead && "bg-blue-50/50"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(notification.id)}
                      onCheckedChange={(checked) => handleSelect(notification.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className={cn("p-2 rounded-lg", config.bgColor, config.borderColor, "border")}>
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={cn(
                            "text-sm font-medium",
                            !notification.isRead && "text-gray-900",
                            notification.isRead && "text-gray-600"
                          )}>
                            {notification.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {config.label}
                          </Badge>
                          {!notification.isRead && (
                            <BellRing className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className={cn(
                        "text-sm",
                        !notification.isRead && "text-gray-700",
                        notification.isRead && "text-gray-500"
                      )}>
                        {notification.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
