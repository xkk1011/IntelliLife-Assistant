"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Sparkles, 
  Dumbbell, 
  Bell, 
  User, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface SidebarProps {
  className?: string
}

const navigationItems = [
  {
    title: "仪表盘",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "焕肤计划",
    href: "/glow-plans",
    icon: Sparkles,
  },
  {
    title: "运动计划", 
    href: "/fitness-plans",
    icon: Dumbbell,
  },
  {
    title: "消息中心",
    href: "/notifications",
    icon: Bell,
  },
]

const secondaryItems = [
  {
    title: "个人资料",
    href: "/profile",
    icon: User,
  },
  {
    title: "设置",
    href: "/settings", 
    icon: Settings,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Toggle Button */}
      <div className="absolute -right-3 top-6 z-10">
        <Button
          variant="outline"
          size="sm"
          className="h-6 w-6 rounded-full p-0 bg-background"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">智</span>
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg">智享生活助手</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </div>

        <Separator />

        <div className="space-y-1">
          {secondaryItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-4 w-4", isCollapsed && "h-5 w-5")} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            <p>智享生活助手 v1.0</p>
            <p>© 2024 All rights reserved</p>
          </div>
        </div>
      )}
    </div>
  )
}

// 移动端侧边栏组件
export function MobileSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">智</span>
          </div>
          <span className="font-bold text-lg">智享生活助手</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>

        <Separator />

        <div className="space-y-1">
          {secondaryItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
