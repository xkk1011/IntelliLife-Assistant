"use client"

import React from "react"
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ErrorProps {
  title?: string
  message?: string
  showRetry?: boolean
  onRetry?: () => void
  showHome?: boolean
  showBack?: boolean
  className?: string
  variant?: "default" | "destructive" | "warning"
}

export function ErrorDisplay({
  title = "出错了",
  message = "抱歉，发生了一个错误。请稍后重试。",
  showRetry = true,
  onRetry,
  showHome = false,
  showBack = false,
  className,
  variant = "default"
}: ErrorProps) {
  const variantStyles = {
    default: "border-border",
    destructive: "border-destructive/50 bg-destructive/5",
    warning: "border-yellow-500/50 bg-yellow-500/5"
  }

  const iconStyles = {
    default: "text-muted-foreground",
    destructive: "text-destructive",
    warning: "text-yellow-500"
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <AlertTriangle className={cn("h-12 w-12", iconStyles[variant])} />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{message}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
        {showRetry && onRetry && (
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
        )}
        {showBack && (
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        )}
        {showHome && (
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            <Home className="h-4 w-4 mr-2" />
            回到首页
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// 页面级错误组件
export function PageError({
  title = "页面加载失败",
  message = "无法加载此页面，请检查网络连接或稍后重试。",
  onRetry
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <ErrorDisplay
        title={title}
        message={message}
        onRetry={onRetry}
        showHome
        showBack
        className="max-w-md"
      />
    </div>
  )
}

// 404错误组件
export function NotFoundError() {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <ErrorDisplay
        title="页面未找到"
        message="抱歉，您访问的页面不存在。"
        showRetry={false}
        showHome
        showBack
        className="max-w-md"
      />
    </div>
  )
}

// 网络错误组件
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorDisplay
      title="网络连接失败"
      message="无法连接到服务器，请检查网络连接。"
      onRetry={onRetry}
      variant="warning"
    />
  )
}

// 权限错误组件
export function PermissionError() {
  return (
    <ErrorDisplay
      title="权限不足"
      message="您没有权限访问此内容。"
      showRetry={false}
      showHome
      variant="destructive"
    />
  )
}

// 内联错误组件（用于表单等）
export function InlineError({ 
  message, 
  className 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-destructive", className)}>
      <AlertTriangle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}

// 错误边界组件
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<object>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <PageError
          title="应用程序错误"
          message="应用程序遇到了一个错误。请刷新页面重试。"
          onRetry={() => window.location.reload()}
        />
      )
    }

    return this.props.children
  }
}
