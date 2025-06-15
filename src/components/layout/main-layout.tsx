"use client"

import { ReactNode } from "react"
import { useSession } from "next-auth/react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { SimpleFooter } from "./footer"

interface MainLayoutProps {
  children: ReactNode
  showSidebar?: boolean
  showFooter?: boolean
  useContainer?: boolean // 是否使用container包裹内容
}

export function MainLayout({
  children,
  showSidebar = true,
  showFooter = true,
  useContainer = true
}: MainLayoutProps) {
  const { data: session } = useSession()

  // 如果用户未登录且需要显示侧边栏，则不显示侧边栏
  const shouldShowSidebar = showSidebar && session

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className={useContainer ? "flex h-[calc(100vh-4rem)]" : "flex min-h-[calc(100vh-4rem)]"}>
        {shouldShowSidebar && (
          <aside className="hidden md:block">
            <Sidebar />
          </aside>
        )}

        <main className={useContainer ? "flex-1 overflow-auto" : "flex-1"}>
          {useContainer ? (
            <div className="container py-6">
              {children}
            </div>
          ) : (
            children
          )}
          {showFooter && <SimpleFooter />}
        </main>
      </div>
    </div>
  )
}

// 专门用于认证页面的布局
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

// 专门用于仪表盘的布局
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout showSidebar={true} showFooter={true}>
      {children}
    </MainLayout>
  )
}

// 专门用于公共页面的布局（如首页）
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout showSidebar={false} showFooter={true}>
      {children}
    </MainLayout>
  )
}
