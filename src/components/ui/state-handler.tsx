"use client"

import { ReactNode } from "react"
import { Loading, PageLoading } from "./loading"
import { ErrorDisplay, PageError } from "./error"

interface StateHandlerProps {
  loading?: boolean
  error?: string | Error | null
  children: ReactNode
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
  loadingText?: string
  errorTitle?: string
  onRetry?: () => void
  showRetry?: boolean
  fullPage?: boolean
}

export function StateHandler({
  loading = false,
  error = null,
  children,
  loadingComponent,
  errorComponent,
  loadingText,
  errorTitle,
  onRetry,
  showRetry = true,
  fullPage = false
}: StateHandlerProps) {
  // 显示加载状态
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }
    
    if (fullPage) {
      return <PageLoading text={loadingText} />
    }
    
    return <Loading text={loadingText} />
  }

  // 显示错误状态
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>
    }

    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (fullPage) {
      return (
        <PageError
          title={errorTitle}
          message={errorMessage}
          onRetry={showRetry ? onRetry : undefined}
        />
      )
    }

    return (
      <ErrorDisplay
        title={errorTitle}
        message={errorMessage}
        onRetry={showRetry ? onRetry : undefined}
      />
    )
  }

  // 显示正常内容
  return <>{children}</>
}

// 数据获取状态处理器
interface DataStateProps<T> {
  data: T | null | undefined
  loading: boolean
  error: string | Error | null
  children: (data: T) => ReactNode
  loadingComponent?: ReactNode
  errorComponent?: ReactNode
  emptyComponent?: ReactNode
  emptyMessage?: string
  onRetry?: () => void
}

export function DataState<T>({
  data,
  loading,
  error,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  emptyMessage = "暂无数据",
  onRetry
}: DataStateProps<T>) {
  // 加载状态
  if (loading) {
    return <>{loadingComponent || <Loading />}</>
  }

  // 错误状态
  if (error) {
    return <>{errorComponent || <ErrorDisplay message={String(error)} onRetry={onRetry} />}</>
  }

  // 空数据状态
  if (!data || (Array.isArray(data) && data.length === 0)) {
    if (emptyComponent) {
      return <>{emptyComponent}</>
    }
    
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  // 有数据时渲染内容
  return <>{children(data)}</>
}

// 异步操作状态处理器
interface AsyncStateProps {
  loading: boolean
  error: string | Error | null
  success?: boolean
  children: ReactNode
  loadingText?: string
  successMessage?: string
  onRetry?: () => void
  onSuccess?: () => void
}

export function AsyncState({
  loading,
  error,
  success,
  children,
  loadingText = "处理中...",
  successMessage,
  onRetry,
  onSuccess
}: AsyncStateProps) {
  if (loading) {
    return <Loading text={loadingText} />
  }

  if (error) {
    return <ErrorDisplay message={String(error)} onRetry={onRetry} />
  }

  if (success && successMessage) {
    return (
      <div className="text-center py-4">
        <p className="text-green-600 font-medium">{successMessage}</p>
        {onSuccess && (
          <button 
            onClick={onSuccess}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            继续
          </button>
        )}
      </div>
    )
  }

  return <>{children}</>
}
