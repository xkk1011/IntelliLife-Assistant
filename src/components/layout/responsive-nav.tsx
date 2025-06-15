"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Sparkles, 
  Dumbbell, 
  Bell,
  User,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requireAuth?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    title: "仪表盘",
    href: "/dashboard",
    icon: LayoutDashboard,
    requireAuth: true,
  },
  {
    title: "焕肤计划",
    href: "/glow-plans",
    icon: Sparkles,
    requireAuth: true,
  },
  {
    title: "运动计划", 
    href: "/fitness-plans",
    icon: Dumbbell,
    requireAuth: true,
  },
  {
    title: "消息中心",
    href: "/notifications",
    icon: Bell,
    requireAuth: true,
  },
]

const secondaryItems: NavigationItem[] = [
  {
    title: "个人资料",
    href: "/profile",
    icon: User,
    requireAuth: true,
  },
  {
    title: "设置",
    href: "/settings", 
    icon: Settings,
    requireAuth: true,
  },
]

interface ResponsiveNavProps {
  className?: string
}

export function ResponsiveNav({ className }: ResponsiveNavProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // 过滤需要认证的导航项
  const filteredNavigationItems = navigationItems.filter(item => 
    !item.requireAuth || session
  )
  
  const filteredSecondaryItems = secondaryItems.filter(item => 
    !item.requireAuth || session
  )

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // 桌面端导航
  const DesktopNav = () => (
    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
      {filteredNavigationItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 transition-colors hover:text-foreground/80",
              isActive ? "text-foreground" : "text-foreground/60"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )

  // 移动端导航
  const MobileNav = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden h-9 w-9 p-0"
          aria-label="打开菜单"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">智</span>
              </div>
              <span className="font-bold text-lg">智享生活助手</span>
            </Link>
            <SheetClose asChild>
              <Button variant="ghost" className="h-9 w-9 p-0">
                <X className="h-5 w-5" />
              </Button>
            </SheetClose>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {/* 主要导航 */}
            <div className="space-y-1">
              {filteredNavigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SheetClose>
                )
              })}
            </div>

            {filteredSecondaryItems.length > 0 && (
              <>
                <Separator className="my-4" />
                
                {/* 次要导航 */}
                <div className="space-y-1">
                  {filteredSecondaryItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SheetClose>
                    )
                  })}
                </div>
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              <p>智享生活助手 v1.0</p>
              <p>© 2024 All rights reserved</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className={cn("flex items-center", className)}>
      <DesktopNav />
      <MobileNav />
    </div>
  )
}

// 底部导航栏（移动端）
export function BottomNav() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const bottomNavItems = navigationItems.slice(0, 4) // 只显示前4个主要导航项

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around py-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center space-y-1 px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-xs">{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
