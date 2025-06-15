'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  Menu, 
  BarChart3, 
  Users, 
  Settings,
  Home,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    name: '概览',
    href: '/admin',
    icon: BarChart3,
  },
  {
    name: '用户管理',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: '数据统计',
    href: '/admin/statistics',
    icon: Settings,
  },
]

export function AdminNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:py-6">
          {/* 左侧 - 标题和移动端菜单 */}
          <div className="flex items-center space-x-4">
            {/* 返回按钮 */}
            <Link
              href="/dashboard"
              className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">返回仪表盘</span>
            </Link>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block" />
            
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              管理后台
            </h1>
          </div>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* 移动端菜单按钮 */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                aria-label="打开菜单"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                {/* 标题 */}
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <Settings className="h-6 w-6" />
                  <h2 className="text-lg font-semibold">管理后台</h2>
                </div>

                {/* 导航菜单 */}
                <nav className="flex-1 pt-6">
                  <div className="space-y-2">
                    {navigationItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>

                  {/* 分隔线 */}
                  <div className="my-6 border-t" />

                  {/* 返回仪表盘 */}
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground w-full"
                  >
                    <Home className="h-4 w-4" />
                    <span>返回仪表盘</span>
                  </Link>
                </nav>

                {/* 底部信息 */}
                <div className="border-t pt-4">
                  <div className="text-xs text-muted-foreground">
                    <p>管理后台 v1.0</p>
                    <p>系统管理和数据统计</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
