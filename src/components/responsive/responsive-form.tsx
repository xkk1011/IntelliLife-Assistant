'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveGrid, ResponsiveStack } from './responsive-container'

interface ResponsiveFormProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  onSubmit?: (e: React.FormEvent) => void
  actions?: ReactNode
  variant?: 'default' | 'card' | 'inline'
  layout?: 'vertical' | 'horizontal' | 'grid'
  spacing?: 'sm' | 'md' | 'lg'
}

export function ResponsiveForm({
  children,
  className,
  title,
  description,
  onSubmit,
  actions,
  variant = 'default',
  layout = 'vertical',
  spacing = 'md'
}: ResponsiveFormProps) {
  const formContent = (
    <form onSubmit={onSubmit} className={cn('w-full', className)}>
      {(title || description) && (
        <div className={cn(
          'mb-6',
          variant === 'card' && 'mb-0'
        )}>
          {title && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={cn(
        'space-y-4',
        layout === 'grid' && 'space-y-0',
        spacing === 'sm' && 'space-y-2',
        spacing === 'lg' && 'space-y-6'
      )}>
        {layout === 'grid' ? (
          <ResponsiveGrid cols={{ default: 1, md: 2 }} gap={spacing}>
            {children}
          </ResponsiveGrid>
        ) : layout === 'horizontal' ? (
          <ResponsiveStack direction="responsive" spacing={spacing}>
            {children}
          </ResponsiveStack>
        ) : (
          children
        )}
      </div>
      
      {actions && (
        <div className={cn(
          'mt-6 pt-4',
          variant !== 'inline' && 'border-t'
        )}>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            {actions}
          </div>
        </div>
      )}
    </form>
  )

  if (variant === 'card') {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </CardHeader>
        )}
        <CardContent>
          <form onSubmit={onSubmit} className="w-full">
            <div className={cn(
              'space-y-4',
              layout === 'grid' && 'space-y-0',
              spacing === 'sm' && 'space-y-2',
              spacing === 'lg' && 'space-y-6'
            )}>
              {layout === 'grid' ? (
                <ResponsiveGrid cols={{ default: 1, md: 2 }} gap={spacing}>
                  {children}
                </ResponsiveGrid>
              ) : layout === 'horizontal' ? (
                <ResponsiveStack direction="responsive" spacing={spacing}>
                  {children}
                </ResponsiveStack>
              ) : (
                children
              )}
            </div>
            
            {actions && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  {actions}
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    )
  }

  return formContent
}

interface ResponsiveFormFieldProps {
  children: ReactNode
  label?: string
  description?: string
  error?: string
  required?: boolean
  className?: string
  layout?: 'vertical' | 'horizontal'
  labelWidth?: 'auto' | 'sm' | 'md' | 'lg'
}

export function ResponsiveFormField({
  children,
  label,
  description,
  error,
  required = false,
  className,
  layout = 'vertical',
  labelWidth = 'auto'
}: ResponsiveFormFieldProps) {
  const labelClasses = cn(
    'block text-sm font-medium text-gray-700 dark:text-gray-300',
    layout === 'horizontal' && 'sm:text-right sm:self-start sm:pt-2',
    {
      'sm:w-24': labelWidth === 'sm' && layout === 'horizontal',
      'sm:w-32': labelWidth === 'md' && layout === 'horizontal',
      'sm:w-40': labelWidth === 'lg' && layout === 'horizontal',
    }
  )

  const fieldClasses = cn(
    'w-full',
    layout === 'horizontal' && 'sm:flex-1'
  )

  const containerClasses = cn(
    'space-y-1',
    layout === 'horizontal' && 'sm:flex sm:items-start sm:space-y-0 sm:space-x-4',
    className
  )

  return (
    <div className={containerClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={fieldClasses}>
        {children}
        
        {description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
        
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

interface ResponsiveFormActionsProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
  stack?: boolean
}

export function ResponsiveFormActions({
  children,
  className,
  align = 'right',
  stack = false
}: ResponsiveFormActionsProps) {
  const actionsClasses = cn(
    'flex gap-3',
    stack ? 'flex-col' : 'flex-col sm:flex-row',
    {
      'sm:justify-start': align === 'left',
      'sm:justify-center': align === 'center',
      'sm:justify-end': align === 'right',
    },
    className
  )

  return (
    <div className={actionsClasses}>
      {children}
    </div>
  )
}

// 预设的表单按钮组合
interface FormButtonGroupProps {
  onSubmit?: () => void
  onCancel?: () => void
  onReset?: () => void
  submitLabel?: string
  cancelLabel?: string
  resetLabel?: string
  submitDisabled?: boolean
  loading?: boolean
  variant?: 'default' | 'destructive'
}

export function FormButtonGroup({
  onSubmit,
  onCancel,
  onReset,
  submitLabel = '保存',
  cancelLabel = '取消',
  resetLabel = '重置',
  submitDisabled = false,
  loading = false,
  variant = 'default'
}: FormButtonGroupProps) {
  return (
    <ResponsiveFormActions>
      {onReset && (
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={loading}
        >
          {resetLabel}
        </Button>
      )}
      
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
      )}
      
      <Button
        type="submit"
        variant={variant === 'destructive' ? 'destructive' : 'default'}
        disabled={submitDisabled || loading}
        onClick={onSubmit}
      >
        {loading ? '处理中...' : submitLabel}
      </Button>
    </ResponsiveFormActions>
  )
}
