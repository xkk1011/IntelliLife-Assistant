"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { User, LogOut, Settings, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SimpleThemeToggle } from "@/components/ui/theme-toggle"
import { ResponsiveNav } from "./responsive-nav"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({}: HeaderProps) {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U"
    return name.charAt(0).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">智</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              智享生活助手
            </span>
          </Link>
        </div>

        {/* Responsive Navigation */}
        <ResponsiveNav className="mr-4" />

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Mobile Logo */}
          <div className="flex md:hidden">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">智</span>
              </div>
              <span className="font-bold text-sm">智享生活助手</span>
            </Link>
          </div>

          {/* User Menu */}
          {session ? (
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <SimpleThemeToggle />

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Bell className="h-4 w-4" />
                <span className="sr-only">通知</span>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>{getUserInitials(session.user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>个人资料</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>设置</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Theme Toggle for non-authenticated users */}
              <SimpleThemeToggle />

              <Button variant="ghost" asChild>
                <Link href="/auth/login">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">注册</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
