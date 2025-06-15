import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, UserPlus, Filter } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '用户管理 - 管理后台',
  description: '管理系统用户账户',
}

interface SearchParams {
  search?: string
  role?: string
  status?: string
  page?: string
}

async function getUsers(searchParams: SearchParams) {
  try {
    const { search, role, status, page = '1' } = searchParams
    const pageSize = 20
    const skip = (parseInt(page) - 1) * pageSize

    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (role && role !== 'all') {
      where.role = role
    }
    
    if (status && status !== 'all') {
      where.status = status
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              glowPlans: true,
              fitnessItems: true,
              notifications: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where })
    ])

    return {
      users,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: parseInt(page),
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return {
      users: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
    }
  }
}

function getUserStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">活跃</Badge>
    case 'INACTIVE':
      return <Badge variant="secondary">未激活</Badge>
    case 'SUSPENDED':
      return <Badge variant="destructive">已暂停</Badge>
    default:
      return <Badge variant="outline">未知</Badge>
  }
}

function getUserRoleBadge(role: string) {
  switch (role) {
    case 'ADMIN':
      return <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">管理员</Badge>
    case 'USER':
      return <Badge variant="outline">用户</Badge>
    default:
      return <Badge variant="outline">未知</Badge>
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { users, totalCount, totalPages, currentPage } = await getUsers(searchParams)

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              用户管理
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              管理系统用户账户和权限
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/users/new">
              <UserPlus className="h-4 w-4 mr-2" />
              添加用户
            </Link>
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">搜索和筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索用户邮箱或姓名..."
                  className="pl-10"
                  defaultValue={searchParams.search}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>
            共 {totalCount} 个用户
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 桌面端表格视图 */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>数据统计</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name || '未设置'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getUserRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      {getUserStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>焕肤计划: {user._count.glowPlans}</p>
                        <p>运动条目: {user._count.fitnessItems}</p>
                        <p>通知: {user._count.notifications}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(user.createdAt).toLocaleDateString('zh-CN')}</p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleTimeString('zh-CN')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">打开菜单</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}`}>
                              查看详情
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/users/${user.id}/edit`}>
                              编辑用户
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            禁用用户
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 移动端卡片视图 */}
          <div className="md:hidden space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.name || '未设置'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getUserRoleBadge(user.role)}
                        {getUserStatusBadge(user.status)}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">打开菜单</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>操作</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}`}>
                          查看详情
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}/edit`}>
                          编辑用户
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        禁用用户
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user._count.glowPlans}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">焕肤计划</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user._count.fitnessItems}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">运动条目</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user._count.notifications}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">通知</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    注册于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">暂无用户数据</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              asChild
            >
              <Link href={`/admin/users?page=${currentPage - 1}`}>
                上一页
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              asChild
            >
              <Link href={`/admin/users?page=${currentPage + 1}`}>
                下一页
              </Link>
            </Button>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
            第 {currentPage} 页，共 {totalPages} 页 (总计 {totalCount} 个用户)
          </span>
        </div>
      )}
    </div>
  )
}
