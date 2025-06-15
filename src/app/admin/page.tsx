import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Activity, Bell } from 'lucide-react'

export const metadata: Metadata = {
  title: '管理后台 - 智享生活助手',
  description: '系统管理和数据统计',
}

async function getSystemStats() {
  try {
    const [
      totalUsers,
      activeUsers,
      totalGlowPlans,
      totalFitnessItems,
      totalNotifications,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.glowPlan.count(),
      prisma.fitnessItem.count(),
      prisma.notification.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        }
      })
    ])

    return {
      totalUsers,
      activeUsers,
      totalGlowPlans,
      totalFitnessItems,
      totalNotifications,
      recentUsers
    }
  } catch (error) {
    console.error('获取系统统计数据失败:', error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalGlowPlans: 0,
      totalFitnessItems: 0,
      totalNotifications: 0,
      recentUsers: []
    }
  }
}

export default async function AdminPage() {
  const stats = await getSystemStats()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          系统概览
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          查看系统运行状态和关键指标
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* 总用户数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              活跃用户: {stats.activeUsers}
            </p>
          </CardContent>
        </Card>

        {/* 焕肤计划数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">焕肤计划</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGlowPlans}</div>
            <p className="text-xs text-muted-foreground">
              用户创建的焕肤计划总数
            </p>
          </CardContent>
        </Card>

        {/* 运动条目数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运动条目</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFitnessItems}</div>
            <p className="text-xs text-muted-foreground">
              用户创建的运动条目总数
            </p>
          </CardContent>
        </Card>

        {/* 站内信数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">站内信</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotifications}</div>
            <p className="text-xs text-muted-foreground">
              系统发送的通知总数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 最近注册用户 */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>最近注册用户</CardTitle>
            <CardDescription>查看最新注册的用户</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role === 'ADMIN' ? '管理员' : '用户'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">暂无用户数据</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 系统状态 */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
            <CardDescription>查看系统运行状态和健康指标</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">数据库</p>
                <p className="text-xs text-green-600 dark:text-green-400">正常运行</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">文件存储</p>
                <p className="text-xs text-green-600 dark:text-green-400">正常运行</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">邮件服务</p>
                <p className="text-xs text-green-600 dark:text-green-400">正常运行</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
