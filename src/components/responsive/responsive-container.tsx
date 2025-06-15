'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'wide' | 'narrow' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveContainer({
  children,
  className,
  variant = 'default',
  padding = 'md'
}: ResponsiveContainerProps) {
  const containerClasses = cn(
    // 基础样式
    'w-full mx-auto',
    
    // 变体样式
    {
      'max-w-7xl': variant === 'default',
      'max-w-full': variant === 'wide',
      'max-w-4xl': variant === 'narrow',
      'max-w-none': variant === 'full',
    },
    
    // 内边距样式
    {
      'p-0': padding === 'none',
      'p-2 sm:p-4': padding === 'sm',
      'p-4 sm:p-6 lg:p-8': padding === 'md',
      'p-6 sm:p-8 lg:p-12': padding === 'lg',
    },
    
    className
  )

  return (
    <div className={containerClasses}>
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gridClasses = cn(
    'grid w-full',
    
    // 列数响应式
    {
      'grid-cols-1': cols.default === 1,
      'grid-cols-2': cols.default === 2,
      'grid-cols-3': cols.default === 3,
      'grid-cols-4': cols.default === 4,
    },
    {
      'sm:grid-cols-1': cols.sm === 1,
      'sm:grid-cols-2': cols.sm === 2,
      'sm:grid-cols-3': cols.sm === 3,
      'sm:grid-cols-4': cols.sm === 4,
    },
    {
      'md:grid-cols-1': cols.md === 1,
      'md:grid-cols-2': cols.md === 2,
      'md:grid-cols-3': cols.md === 3,
      'md:grid-cols-4': cols.md === 4,
    },
    {
      'lg:grid-cols-1': cols.lg === 1,
      'lg:grid-cols-2': cols.lg === 2,
      'lg:grid-cols-3': cols.lg === 3,
      'lg:grid-cols-4': cols.lg === 4,
      'lg:grid-cols-5': cols.lg === 5,
      'lg:grid-cols-6': cols.lg === 6,
    },
    {
      'xl:grid-cols-1': cols.xl === 1,
      'xl:grid-cols-2': cols.xl === 2,
      'xl:grid-cols-3': cols.xl === 3,
      'xl:grid-cols-4': cols.xl === 4,
      'xl:grid-cols-5': cols.xl === 5,
      'xl:grid-cols-6': cols.xl === 6,
    },
    
    // 间距
    {
      'gap-0': gap === 'none',
      'gap-2': gap === 'sm',
      'gap-4': gap === 'md',
      'gap-6': gap === 'lg',
      'gap-8': gap === 'xl',
    },
    
    className
  )

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

interface ResponsiveStackProps {
  children: ReactNode
  className?: string
  direction?: 'vertical' | 'horizontal' | 'responsive'
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export function ResponsiveStack({
  children,
  className,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start'
}: ResponsiveStackProps) {
  const stackClasses = cn(
    'flex w-full',
    
    // 方向
    {
      'flex-col': direction === 'vertical',
      'flex-row': direction === 'horizontal',
      'flex-col md:flex-row': direction === 'responsive',
    },
    
    // 间距
    {
      'gap-0': spacing === 'none',
      'gap-2': spacing === 'sm',
      'gap-4': spacing === 'md',
      'gap-6': spacing === 'lg',
      'gap-8': spacing === 'xl',
    },
    
    // 对齐
    {
      'items-start': align === 'start',
      'items-center': align === 'center',
      'items-end': align === 'end',
      'items-stretch': align === 'stretch',
    },
    
    // 分布
    {
      'justify-start': justify === 'start',
      'justify-center': justify === 'center',
      'justify-end': justify === 'end',
      'justify-between': justify === 'between',
      'justify-around': justify === 'around',
      'justify-evenly': justify === 'evenly',
    },
    
    className
  )

  return (
    <div className={stackClasses}>
      {children}
    </div>
  )
}

// 响应式文本组件
interface ResponsiveTextProps {
  children: ReactNode
  className?: string
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  responsive?: boolean
}

export function ResponsiveText({
  children,
  className,
  size = 'base',
  weight = 'normal',
  responsive = false
}: ResponsiveTextProps) {
  const textClasses = cn(
    // 基础大小
    {
      'text-xs': size === 'xs',
      'text-sm': size === 'sm',
      'text-base': size === 'base',
      'text-lg': size === 'lg',
      'text-xl': size === 'xl',
      'text-2xl': size === '2xl',
      'text-3xl': size === '3xl',
      'text-4xl': size === '4xl',
    },
    
    // 响应式大小调整
    responsive && {
      'sm:text-sm': size === 'xs',
      'sm:text-base': size === 'sm',
      'sm:text-lg': size === 'base',
      'sm:text-xl': size === 'lg',
      'sm:text-2xl': size === 'xl',
      'sm:text-3xl': size === '2xl',
      'sm:text-4xl': size === '3xl',
      'sm:text-5xl': size === '4xl',
    },
    
    // 字重
    {
      'font-normal': weight === 'normal',
      'font-medium': weight === 'medium',
      'font-semibold': weight === 'semibold',
      'font-bold': weight === 'bold',
    },
    
    className
  )

  return (
    <span className={textClasses}>
      {children}
    </span>
  )
}

// 响应式间距组件
interface ResponsiveSpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  direction?: 'vertical' | 'horizontal'
  responsive?: boolean
}

export function ResponsiveSpacer({
  size = 'md',
  direction = 'vertical',
  responsive = false
}: ResponsiveSpacerProps) {
  const spacerClasses = cn(
    // 基础间距
    direction === 'vertical' && {
      'h-2': size === 'xs',
      'h-4': size === 'sm',
      'h-6': size === 'md',
      'h-8': size === 'lg',
      'h-12': size === 'xl',
      'h-16': size === '2xl',
    },
    direction === 'horizontal' && {
      'w-2': size === 'xs',
      'w-4': size === 'sm',
      'w-6': size === 'md',
      'w-8': size === 'lg',
      'w-12': size === 'xl',
      'w-16': size === '2xl',
    },
    
    // 响应式间距
    responsive && direction === 'vertical' && {
      'sm:h-4': size === 'xs',
      'sm:h-6': size === 'sm',
      'sm:h-8': size === 'md',
      'sm:h-12': size === 'lg',
      'sm:h-16': size === 'xl',
      'sm:h-20': size === '2xl',
    },
    responsive && direction === 'horizontal' && {
      'sm:w-4': size === 'xs',
      'sm:w-6': size === 'sm',
      'sm:w-8': size === 'md',
      'sm:w-12': size === 'lg',
      'sm:w-16': size === 'xl',
      'sm:w-20': size === '2xl',
    }
  )

  return <div className={spacerClasses} />
}
