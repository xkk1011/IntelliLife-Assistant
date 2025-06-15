import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"

/**
 * 获取当前用户会话（服务端）
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

/**
 * 要求用户已登录，否则重定向到登录页
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

/**
 * 要求管理员权限
 */
export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== "ADMIN") {
    redirect("/dashboard")
  }
  return user
}

/**
 * 获取完整的用户信息
 */
export async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    }
  })
}

/**
 * 检查用户是否有权限访问资源
 */
export async function checkUserPermission(userId: string, resourceUserId: string) {
  const user = await getCurrentUser()
  
  // 管理员可以访问所有资源
  if (user?.role === "ADMIN") {
    return true
  }
  
  // 用户只能访问自己的资源
  return user?.id === resourceUserId
}
