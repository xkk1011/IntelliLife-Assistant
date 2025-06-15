import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // 管理员路由保护
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 已登录用户访问认证页面时重定向到仪表盘
    if (pathname.startsWith("/auth/") && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // 公开路由
        const publicRoutes = [
          "/",
          "/auth/login",
          "/auth/register",
          "/auth/forgot-password",
        ];
        if (publicRoutes.includes(pathname)) {
          return true;
        }

        // 静态资源和上传文件
        if (
          pathname.startsWith("/uploads/") ||
          pathname.startsWith("/_next/")
        ) {
          return true;
        }

        // API路由中的认证相关路由
        if (pathname.startsWith("/api/auth/")) {
          return true;
        }

        // 其他受保护的路由需要token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api/auth/* (NextAuth.js API路由)
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - public文件夹中的文件
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
