"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FormContainerProps {
  children: ReactNode
  title?: string
  description?: string
  onSubmit?: (e: React.FormEvent) => void
  submitText?: string
  cancelText?: string
  onCancel?: () => void
  isLoading?: boolean
  className?: string
  showCard?: boolean
  submitDisabled?: boolean
}

export function FormContainer({
  children,
  title,
  description,
  onSubmit,
  submitText = "提交",
  cancelText = "取消",
  onCancel,
  isLoading = false,
  className,
  showCard = true,
  submitDisabled = false,
}: FormContainerProps) {
  const formContent = (
    <form onSubmit={onSubmit} className={cn("space-y-6", !showCard && className)}>
      {children}
      
      <div className="flex items-center justify-end space-x-4 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || submitDisabled}
          className="min-w-[100px]"
        >
          {isLoading ? "提交中..." : submitText}
        </Button>
      </div>
    </form>
  )

  if (!showCard) {
    return formContent
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  )
}

// 简化版表单容器，不包含卡片样式
export function SimpleFormContainer({
  children,
  onSubmit,
  submitText = "提交",
  cancelText = "取消",
  onCancel,
  isLoading = false,
  className,
  submitDisabled = false,
}: Omit<FormContainerProps, 'showCard' | 'title' | 'description'>) {
  return (
    <FormContainer
      showCard={false}
      onSubmit={onSubmit}
      submitText={submitText}
      cancelText={cancelText}
      onCancel={onCancel}
      isLoading={isLoading}
      className={className}
      submitDisabled={submitDisabled}
    >
      {children}
    </FormContainer>
  )
}
