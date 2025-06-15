'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRightIcon, HomeIcon } from 'lucide-react'
import { ROUTE_METADATA } from '@/lib/route-protection'

interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

interface BreadcrumbProps {
  className?: string
}

export function Breadcrumb({ className = '' }: BreadcrumbProps) {
  const pathname = usePathname()

  // 获取当前路由的面包屑配置
  let routeMetadata = ROUTE_METADATA[pathname]

  // 如果没有精确匹配，尝试匹配动态路由
  if (!routeMetadata) {
    // 处理动态路由，如 /glow-plans/[id]
    if (pathname.startsWith('/glow-plans/') && pathname !== '/glow-plans' &&
        !pathname.startsWith('/glow-plans/areas') && !pathname.startsWith('/glow-plans/devices')) {
      // 这是焕肤计划详情页面
      routeMetadata = {
        title: "焕肤计划详情",
        description: "查看焕肤计划的详细信息和历史记录",
        requiresAuth: true,
        requiresAdmin: false,
        breadcrumbs: [
          { label: "首页", href: "/" },
          { label: "仪表盘", href: "/dashboard" },
          { label: "焕肤计划", href: "/glow-plans" },
          { label: "计划详情", href: pathname },
        ],
      }
    }
    // 处理运动计划详情页面，如 /fitness-plans/[id]
    else if (pathname.startsWith('/fitness-plans/') && pathname !== '/fitness-plans' &&
             !pathname.startsWith('/fitness-plans/videos')) {
      // 这是运动计划详情页面
      routeMetadata = {
        title: "运动计划详情",
        description: "查看运动条目的详细信息和历史记录",
        requiresAuth: true,
        requiresAdmin: false,
        breadcrumbs: [
          { label: "首页", href: "/" },
          { label: "仪表盘", href: "/dashboard" },
          { label: "运动计划", href: "/fitness-plans" },
          { label: "条目详情", href: pathname },
        ],
      }
    }
  }

  // 如果没有配置或者是首页，不显示面包屑
  if (!routeMetadata || pathname === '/') {
    return null
  }

  const breadcrumbs = routeMetadata.breadcrumbs.map((item, index) => ({
    ...item,
    current: index === routeMetadata.breadcrumbs.length - 1,
  }))

  return (
    <nav className={`flex ${className}`} aria-label="面包屑导航">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon 
                className="h-4 w-4 text-gray-400 mx-2" 
                aria-hidden="true" 
              />
            )}
            
            {item.current ? (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {index === 0 && item.href === '/' ? (
                  <div className="flex items-center">
                    <HomeIcon className="h-4 w-4 mr-1" />
                    {item.label}
                  </div>
                ) : (
                  item.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * 简化版面包屑组件 - 用于特定场景
 */
interface SimpleBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function SimpleBreadcrumb({ items, className = '' }: SimpleBreadcrumbProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav className={`flex ${className}`} aria-label="面包屑导航">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon 
                className="h-4 w-4 text-gray-400 mx-2" 
                aria-hidden="true" 
              />
            )}
            
            {item.current ? (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {index === 0 && item.href === '/' ? (
                  <div className="flex items-center">
                    <HomeIcon className="h-4 w-4 mr-1" />
                    {item.label}
                  </div>
                ) : (
                  item.label
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * 页面标题和面包屑组合组件
 */
interface PageHeaderProps {
  title: string
  description?: string
  showBreadcrumb?: boolean
  className?: string
  children?: React.ReactNode
  action?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  showBreadcrumb = true,
  className = '',
  children,
  action
}: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      {showBreadcrumb && <Breadcrumb className="mb-4" />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {(children || action) && (
          <div className="flex items-center space-x-4">
            {action || children}
          </div>
        )}
      </div>
    </div>
  )
}
