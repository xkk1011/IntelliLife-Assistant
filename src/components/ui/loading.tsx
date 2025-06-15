"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
  fullScreen?: boolean
}

export function Loading({ 
  size = "md", 
  text, 
  className,
  fullScreen = false 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  const containerClasses = fullScreen 
    ? "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    : "flex items-center justify-center"

  return (
    <div className={cn(containerClasses, className)}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={cn("animate-spin", sizeClasses[size])} />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  )
}

// 页面级加载组件
export function PageLoading({ text = "加载中..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" text={text} />
    </div>
  )
}

// 全屏加载组件
export function FullScreenLoading({ text = "加载中..." }: { text?: string }) {
  return <Loading size="lg" text={text} fullScreen />
}

// 按钮内加载组件
export function ButtonLoading({ size = "sm" }: { size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5"
  }

  return <Loader2 className={cn("animate-spin", sizeClasses[size])} />
}

// 卡片加载骨架
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
    </div>
  )
}

// 表格加载骨架
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-muted/50 rounded animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// 列表加载骨架
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted/50 rounded animate-pulse w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
