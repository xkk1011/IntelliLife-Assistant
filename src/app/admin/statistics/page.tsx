import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Calendar,
  Activity,
  Bell,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react'
import { ExportButtons } from '@/components/admin/export-buttons'

export const metadata: Metadata = {
  title: '数据统计 - 管理后台',
  description: '查看系统数据统计和分析',
}

async function getStatistics() {
  try {
    const [
      // 基础统计
      totalUsers,
      activeUsers,
      adminUsers,
      totalGlowPlans,
      totalFitnessItems,
      totalNotifications,
      
      // 时间统计
      usersThisMonth,
      usersLastMonth,
      glowPlansThisMonth,
      fitnessItemsThisMonth,
      
      // 用户活跃度统计
      usersWithGlowPlans,
      usersWithFitnessItems,
      
      // 最近7天的用户注册数据
      recentRegistrations,
      
      // 设备和部位统计
      glowDevicesCount,
      glowAreasCount,
      
      // 通知统计
      unreadNotifications,
      
    ] = await Promise.all([
      // 基础统计
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.glowPlan.count(),
      prisma.fitnessItem.count(),
      prisma.notification.count(),
      
      // 时间统计
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.glowPlan.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.fitnessItem.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // 用户活跃度统计
      prisma.user.count({
        where: {
          glowPlans: {
            some: {}
          }
        }
      }),
      prisma.user.count({
        where: {
          fitnessItems: {
            some: {}
          }
        }
      }),
      
      // 最近7天注册用户
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        _count: {
          id: true
        }
      }),
      
      // 设备和部位统计
      prisma.glowDevice.count(),
      prisma.glowArea.count(),
      
      // 通知统计
      prisma.notification.count({ where: { isRead: false } }),
    ])

    // 计算增长率
    const userGrowthRate = usersLastMonth > 0 
      ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100)
      : 0

    // 计算用户活跃度
    const glowPlanActiveRate = totalUsers > 0 ? (usersWithGlowPlans / totalUsers * 100) : 0
    const fitnessActiveRate = totalUsers > 0 ? (usersWithFitnessItems / totalUsers * 100) : 0

    return {
      basic: {
        totalUsers,
        activeUsers,
        adminUsers,
        totalGlowPlans,
        totalFitnessItems,
        totalNotifications,
      },
      growth: {
        usersThisMonth,
        usersLastMonth,
        userGrowthRate,
        glowPlansThisMonth,
        fitnessItemsThisMonth,
      },
      activity: {
        glowPlanActiveRate,
        fitnessActiveRate,
        usersWithGlowPlans,
        usersWithFitnessItems,
      },
      resources: {
        glowDevicesCount,
        glowAreasCount,
        unreadNotifications,
      },
      recentRegistrations,
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return {
      basic: {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        totalGlowPlans: 0,
        totalFitnessItems: 0,
        totalNotifications: 0,
      },
      growth: {
        usersThisMonth: 0,
        usersLastMonth: 0,
        userGrowthRate: 0,
        glowPlansThisMonth: 0,
        fitnessItemsThisMonth: 0,
      },
      activity: {
        glowPlanActiveRate: 0,
        fitnessActiveRate: 0,
        usersWithGlowPlans: 0,
        usersWithFitnessItems: 0,
      },
      resources: {
        glowDevicesCount: 0,
        glowAreasCount: 0,
        unreadNotifications: 0,
      },
      recentRegistrations: [],
    }
  }
}

export default async function StatisticsPage() {
  const stats = await getStatistics()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              数据统计
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              查看系统数据统计和分析报告
            </p>
          </div>
          <ExportButtons />
        </div>
      </div>

      {/* 基础统计 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.basic.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              活跃: {stats.basic.activeUsers} | 管理员: {stats.basic.adminUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">焕肤计划</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.basic.totalGlowPlans}</div>
            <p className="text-xs text-muted-foreground">
              本月新增: {stats.growth.glowPlansThisMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运动条目</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.basic.totalFitnessItems}</div>
            <p className="text-xs text-muted-foreground">
              本月新增: {stats.growth.fitnessItemsThisMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">站内信</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.basic.totalNotifications}</div>
            <p className="text-xs text-muted-foreground">
              未读: {stats.resources.unreadNotifications}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 增长趋势 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              用户增长
            </CardTitle>
            <CardDescription>用户注册趋势分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">本月新用户</span>
                <span className="text-2xl font-bold">{stats.growth.usersThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">上月新用户</span>
                <span className="text-lg">{stats.growth.usersLastMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">增长率</span>
                <div className="flex items-center">
                  {stats.growth.userGrowthRate >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stats.growth.userGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(stats.growth.userGrowthRate).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              用户活跃度
            </CardTitle>
            <CardDescription>用户使用功能的活跃程度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">焕肤计划使用率</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.activity.usersWithGlowPlans}/{stats.basic.totalUsers}
                  </span>
                </div>
                <Progress value={stats.activity.glowPlanActiveRate} className="h-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {stats.activity.glowPlanActiveRate.toFixed(1)}% 的用户创建了焕肤计划
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">运动计划使用率</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.activity.usersWithFitnessItems}/{stats.basic.totalUsers}
                  </span>
                </div>
                <Progress value={stats.activity.fitnessActiveRate} className="h-2" />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {stats.activity.fitnessActiveRate.toFixed(1)}% 的用户创建了运动条目
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 资源统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            系统资源统计
          </CardTitle>
          <CardDescription>系统中各类资源的数量统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.resources.glowDevicesCount}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">焕肤设备类型</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.resources.glowAreasCount}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">焕肤部位类型</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.resources.unreadNotifications}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">未读通知</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
