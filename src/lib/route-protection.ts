import { Session } from "next-auth";
import { redirect } from "next/navigation";

/**
 * 路由权限配置
 */
export const ROUTE_PERMISSIONS = {
  // 公开路由 - 无需认证
  PUBLIC: ["/", "/auth/login", "/auth/register", "/auth/forgot-password"],

  // 需要登录的路由
  AUTHENTICATED: [
    "/dashboard",
    "/glow-plans",
    "/fitness-plans",
    "/notifications",
    "/profile",
  ],

  // 管理员专用路由
  ADMIN_ONLY: ["/admin", "/admin/users", "/admin/statistics"],
} as const;

/**
 * 检查用户是否有权限访问指定路由
 */
export function hasRoutePermission(
  pathname: string,
  session: Session | null
): boolean {
  // 检查是否为公开路由
  if (ROUTE_PERMISSIONS.PUBLIC.includes(pathname)) {
    return true;
  }

  // 检查是否为管理员路由
  if (
    ROUTE_PERMISSIONS.ADMIN_ONLY.some((route) => pathname.startsWith(route))
  ) {
    return session?.user?.role === "ADMIN";
  }

  // 检查是否为需要认证的路由
  if (
    ROUTE_PERMISSIONS.AUTHENTICATED.some((route) => pathname.startsWith(route))
  ) {
    return !!session;
  }

  // 默认需要认证
  return !!session;
}

/**
 * 服务端路由保护 - 用于页面组件
 */
export function requireAuth(session: Session | null, pathname: string) {
  if (!hasRoutePermission(pathname, session)) {
    if (!session) {
      redirect("/auth/login");
    } else if (
      session.user.role !== "ADMIN" &&
      ROUTE_PERMISSIONS.ADMIN_ONLY.some((route) => pathname.startsWith(route))
    ) {
      redirect("/dashboard");
    }
  }
}

/**
 * 管理员权限检查
 */
export function requireAdmin(session: Session | null) {
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
}

/**
 * 获取用户默认重定向路径
 */
export function getDefaultRedirectPath(session: Session | null): string {
  if (!session) {
    return "/auth/login";
  }

  if (session.user.role === "ADMIN") {
    return "/admin";
  }

  return "/dashboard";
}

/**
 * 路由元数据类型
 */
export interface RouteMetadata {
  title: string;
  description?: string;
  requiresAuth: boolean;
  requiresAdmin: boolean;
  breadcrumbs: Array<{
    label: string;
    href: string;
  }>;
}

/**
 * 路由元数据配置
 */
export const ROUTE_METADATA: Record<string, RouteMetadata> = {
  "/": {
    title: "智享生活助手",
    description: "个性化的焕肤计划和运动计划管理工具",
    requiresAuth: false,
    requiresAdmin: false,
    breadcrumbs: [],
  },
  "/dashboard": {
    title: "仪表盘",
    description: "查看您的计划概览和最新动态",
    requiresAuth: true,
    requiresAdmin: false,
    breadcrumbs: [
      { label: "首页", href: "/" },
      { label: "仪表盘", href: "/dashboard" },
    ],
  },
  "/glow-plans": {
    title: "焕肤计划",
    description: "管理您的个性化焕肤计划",
    requiresAuth: true,
    requiresAdmin: false,
    breadcrumbs: [
      { label: "首页", href: "/" },
      { label: "仪表盘", href: "/dashboard" },
      { label: "焕肤计划", href: "/glow-plans" },
    ],
  },
  "/glow-plans/areas": {
    title: "焕肤部位管理",
    description: "管理您的焕肤部位，用于创建焕肤计划时选择",
    requiresAuth: true,
    requiresAdmin: false,
    breadcrumbs: [
      { label: "首页", href: "/" },
      { label: "仪表盘", href: "/dashboard" },
      { label: "焕肤计划", href: "/glow-plans" },
      { label: "部位管理", href: "/glow-plans/areas" },
    ],
  },
  "/glow-plans/devices": {
    title: "焕肤设备管理",
    description: "管理您的焕肤设备，用于创建焕肤计划时选择",
    requiresAuth: true,
    requiresAdmin: false,
    breadcrumbs: [
      { label: "首页", href: "/" },
      { label: "仪表盘", href: "/dashboard" },
      { label: "焕肤计划", href: "/glow-plans" },
      { label: "设备管理", href: "/glow-plans/devices" },
    ],
  },
  "/fitness-plans": {
    title: "运动计划",
    description: "管理您的个性化运动计划",
    requiresAuth: true,
    requiresAdmin: false,
    breadcrumbs: [
      { label: "首页", href: "/" },
      { label: "仪表盘", href: "/dashboard" },
      { label: "运动计划", href: "/fitness-plans" },
    ],
  },
  "/fitness-plans/videos": {
    title: "视频管理",
    description: "管理您的运动视频，用于创建运动计划时选择",
    requiresAuth: true,
    requiresAdmin: false,
    breadcrumbs: [
      { label: "首页", href: "/" },
      { label: "仪表盘", href: "/dashboard" },
      { label: "运动计划", href: "/fitness-plans" },
      { label: "视频管理", href: "/fitness-plans/videos" },
    ],
  },
  "/notifications": {
    title: "站内信",
    description: "查看您的通知和提醒消息",
    requiresAuth: true,
    requiresAdmin: false,
    breadcrumbs: [
      { label: "首页", href: "/" },
      { label: "仪表盘", href: "/dashboard" },
      { label: "站内信", href: "/notifications" },
    ],
  },
  "/profile": {
    title: "个人设置",
    description: "管理您的个人资料和账户设置",
    requiresAuth: true,
    requiresAdmin: false,
    breadcrumbs: [
      { label: "首页", href: "/" },
      { label: "仪表盘", href: "/dashboard" },
      { label: "个人设置", href: "/profile" },
    ],
  },
  "/admin": {
    title: "管理后台",
    description: "系统管理和数据统计",
    requiresAuth: true,
    requiresAdmin: true,
    breadcrumbs: [
      { label: "首页", href: "/" },
      { label: "管理后台", href: "/admin" },
    ],
  },
};
