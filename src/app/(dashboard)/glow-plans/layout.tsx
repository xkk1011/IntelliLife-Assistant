'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Sparkles, MapPin, Smartphone } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'

const glowPlansTabs = [
  {
    title: '我的计划',
    href: '/glow-plans',
    icon: Sparkles,
  },
  {
    title: '部位管理',
    href: '/glow-plans/areas',
    icon: MapPin,
  },
  {
    title: '设备管理',
    href: '/glow-plans/devices',
    icon: Smartphone,
  },
]

export default function GlowPlansLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* 面包屑导航 - 只在布局中显示一次 */}
      <Breadcrumb />

      {/* 子导航 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {glowPlansTabs.map((tab) => {
            const isActive = pathname === tab.href || 
              (tab.href !== '/glow-plans' && pathname.startsWith(tab.href))
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )}
              >
                <tab.icon
                  className={cn(
                    'mr-2 h-4 w-4',
                    isActive
                      ? 'text-primary'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  )}
                />
                {tab.title}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* 页面内容 */}
      {children}
    </div>
  )
}
