'use client'

import { ReactNode, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ResponsiveTableColumn {
  key: string
  label: string
  render?: (value: any, row: any) => ReactNode
  className?: string
  sortable?: boolean
  hideOnMobile?: boolean
}

interface ResponsiveTableAction {
  label: string
  onClick: (row: any) => void
  variant?: 'default' | 'destructive'
  icon?: ReactNode
}

interface ResponsiveTableProps {
  data: any[]
  columns: ResponsiveTableColumn[]
  actions?: ResponsiveTableAction[]
  loading?: boolean
  emptyMessage?: string
  mobileCardTitle?: (row: any) => string
  mobileCardSubtitle?: (row: any) => string
  onRowClick?: (row: any) => void
}

export function ResponsiveTable({
  data,
  columns,
  actions,
  loading = false,
  emptyMessage = '暂无数据',
  mobileCardTitle,
  mobileCardSubtitle,
  onRowClick
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId)
    } else {
      newExpanded.add(rowId)
    }
    setExpandedRows(newExpanded)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* 桌面端骨架屏 */}
        <div className="hidden md:block">
          <div className="border rounded-lg">
            <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-t-lg animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 border-t bg-gray-50 dark:bg-gray-900 animate-pulse" />
            ))}
          </div>
        </div>
        
        {/* 移动端骨架屏 */}
        <div className="md:hidden space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  // 桌面端表格视图
  const DesktopTable = () => (
    <div className="hidden md:block border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                  column.className
                )}
              >
                {column.label}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className={cn(
                'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-6 py-4 whitespace-nowrap text-sm',
                    column.className
                  )}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.map((action, actionIndex) => (
                        <DropdownMenuItem
                          key={actionIndex}
                          onClick={(e) => {
                            e.stopPropagation()
                            action.onClick(row)
                          }}
                          className={cn(
                            action.variant === 'destructive' && 'text-red-600 dark:text-red-400'
                          )}
                        >
                          {action.icon && <span className="mr-2">{action.icon}</span>}
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  // 移动端卡片视图
  const MobileCards = () => (
    <div className="md:hidden space-y-4">
      {data.map((row, index) => {
        const rowId = row.id || index.toString()
        const isExpanded = expandedRows.has(rowId)
        const visibleColumns = columns.filter(col => !col.hideOnMobile)
        const hiddenColumns = columns.filter(col => col.hideOnMobile)
        
        return (
          <Card key={rowId} className="overflow-hidden">
            <CardHeader 
              className={cn(
                'pb-3',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(row)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">
                    {mobileCardTitle ? mobileCardTitle(row) : row[columns[0]?.key] || ''}
                  </CardTitle>
                  {mobileCardSubtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {mobileCardSubtitle(row)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {actions && actions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, actionIndex) => (
                          <DropdownMenuItem
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(row)
                            }}
                            className={cn(
                              action.variant === 'destructive' && 'text-red-600 dark:text-red-400'
                            )}
                          >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {hiddenColumns.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleRowExpansion(rowId)
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* 始终显示的字段 */}
              <div className="space-y-2">
                {visibleColumns.slice(1).map((column) => (
                  <div key={column.key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {column.label}:
                    </span>
                    <span className="text-sm font-medium">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* 可展开的隐藏字段 */}
              {isExpanded && hiddenColumns.length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  {hiddenColumns.map((column) => (
                    <div key={column.key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {column.label}:
                      </span>
                      <span className="text-sm font-medium">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div>
      <DesktopTable />
      <MobileCards />
    </div>
  )
}
