import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: "功能特性", href: "/features" },
      { name: "定价", href: "/pricing" },
      { name: "更新日志", href: "/changelog" },
    ],
    support: [
      { name: "帮助中心", href: "/help" },
      { name: "联系我们", href: "/contact" },
      { name: "反馈建议", href: "/feedback" },
    ],
    legal: [
      { name: "隐私政策", href: "/privacy" },
      { name: "服务条款", href: "/terms" },
      { name: "Cookie政策", href: "/cookies" },
    ],
  }

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">智</span>
              </div>
              <span className="font-bold text-lg">智享生活助手</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              个性化的焕肤计划和运动计划管理工具，让您的生活更加规律和健康。
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">产品</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">支持</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">法律</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} 智享生活助手. 保留所有权利.
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              隐私政策
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              服务条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// 简化版Footer，用于仪表盘等页面
export function SimpleFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="container py-4">
        <div className="flex flex-col items-center justify-between space-y-2 text-sm text-muted-foreground md:flex-row md:space-y-0">
          <div>© {currentYear} 智享生活助手. 保留所有权利.</div>
          <div className="flex items-center space-x-4">
            <Link
              href="/help"
              className="hover:text-foreground transition-colors"
            >
              帮助
            </Link>
            <Link
              href="/contact"
              className="hover:text-foreground transition-colors"
            >
              联系我们
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
