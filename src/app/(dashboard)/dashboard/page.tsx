import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from '@/components/layout/breadcrumb'

export const metadata: Metadata = {
  title: '仪表盘 - 智享生活助手',
  description: '查看您的计划概览和最新动态',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div>
      <PageHeader
        title={`欢迎回来，${session?.user.name || session?.user.email}！`}
        description="这是您的智享生活助手仪表盘"
        showBreadcrumb={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>焕肤计划</CardTitle>
            <CardDescription>管理您的焕肤护理计划</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">个活跃计划</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>运动计划</CardTitle>
            <CardDescription>管理您的运动健身计划</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">个运动条目</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>提醒</CardTitle>
            <CardDescription>查看您的提醒通知</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">条未读通知</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>邮箱:</strong> {session?.user.email}</p>
            <p><strong>姓名:</strong> {session?.user.name || "未设置"}</p>
            <p><strong>角色:</strong> {session?.user.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
