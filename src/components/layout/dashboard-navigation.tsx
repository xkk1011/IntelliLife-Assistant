'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { 
  HomeIcon, 
  SparklesIcon, 
  HeartIcon, 
  BellIcon, 
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon,
  XIcon
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current?: boolean
}

interface DashboardNavigationProps {
  session: Session
}

export function DashboardNavigation({ session }: DashboardNavigationProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation: NavigationItem[] = [
    { name: '仪表盘', href: '/dashboard', icon: HomeIcon },
    { name: '焕肤计划', href: '/glow-plans', icon: SparklesIcon },
    { name: '运动计划', href: '/fitness-plans', icon: HeartIcon },
    { name: '站内信', href: '/notifications', icon: BellIcon },
    { name: '个人设置', href: '/profile', icon: UserIcon },
  ]

  // 如果是管理员，添加管理后台链接
  if (session.user.role === 'ADMIN') {
    navigation.push({
      name: '管理后台',
      href: '/admin',
      icon: SettingsIcon,
    })
  }

  // 设置当前页面状态
  const navigationWithCurrent = navigation.map(item => ({
    ...item,
    current: pathname === item.href || pathname.startsWith(item.href + '/'),
  }))

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 左侧 - Logo 和导航 */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                智享生活助手
              </Link>
            </div>
            
            {/* 桌面端导航 */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationWithCurrent.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'border-blue-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 右侧 - 用户菜单和主题切换 */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <ThemeToggle />
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <LogOutIcon className="h-4 w-4 mr-1" />
                退出
              </button>
            </div>
          </div>

          {/* 移动端菜单按钮 */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationWithCurrent.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                  {session.user.name || session.user.email}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {session.user.email}
                </div>
              </div>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleSignOut}
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 w-full text-left transition-colors"
              >
                <div className="flex items-center">
                  <LogOutIcon className="h-5 w-5 mr-3" />
                  退出登录
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
