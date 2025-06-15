"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession } from "next-auth/react"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: {
    id: string
    email: string
    name?: string | null
    role: string
  } | null
  checkPermission: (permission: string) => boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(status === "loading")
  }, [status])

  const checkPermission = (permission: string): boolean => {
    if (!session?.user) return false
    
    // 管理员拥有所有权限
    if (session.user.role === "ADMIN") return true
    
    // 这里可以根据需要扩展权限检查逻辑
    switch (permission) {
      case "read:own_data":
        return true // 所有认证用户都可以读取自己的数据
      case "write:own_data":
        return true // 所有认证用户都可以修改自己的数据
      case "admin:users":
        return session.user.role === "ADMIN"
      case "admin:system":
        return session.user.role === "ADMIN"
      default:
        return false
    }
  }

  const value: AuthContextType = {
    isAuthenticated: status === "authenticated",
    isLoading,
    user: session?.user || null,
    checkPermission,
    isAdmin: session?.user?.role === "ADMIN",
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
