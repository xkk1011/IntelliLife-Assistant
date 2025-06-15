'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, Database, History, Bell } from 'lucide-react'
import { toast } from 'sonner'

export function ExportButtons() {
  const [exporting, setExporting] = useState<string | null>(null)

  const handleExport = async (type: string, format: 'json' | 'csv') => {
    try {
      setExporting(`${type}-${format}`)
      
      const response = await fetch(`/api/dashboard/export?type=${type}&format=${format}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '导出失败')
      }

      if (format === 'csv') {
        // 下载CSV文件
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('CSV文件下载成功')
      } else {
        // 下载JSON文件
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('JSON文件下载成功')
      }
    } catch (error) {
      console.error('导出失败:', error)
      toast.error(error instanceof Error ? error.message : '导出失败')
    } finally {
      setExporting(null)
    }
  }

  const exportOptions = [
    {
      type: 'personal',
      label: '个人数据汇总',
      icon: Database,
      description: '导出个人账户和统计信息'
    },
    {
      type: 'glow-plans',
      label: '焕肤计划',
      icon: FileText,
      description: '导出所有焕肤计划数据'
    },
    {
      type: 'fitness-items',
      label: '运动计划',
      icon: FileText,
      description: '导出所有运动计划数据'
    },
    {
      type: 'glow-history',
      label: '焕肤历史记录',
      icon: History,
      description: '导出焕肤执行历史'
    },
    {
      type: 'fitness-history',
      label: '运动历史记录',
      icon: History,
      description: '导出运动执行历史'
    },
    {
      type: 'notifications',
      label: '通知记录',
      icon: Bell,
      description: '导出所有通知消息'
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          导出数据
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>选择导出内容</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {exportOptions.map((option) => {
          const Icon = option.icon
          return (
            <div key={option.type} className="px-2 py-1">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4" />
                <span className="font-medium text-sm">{option.label}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 ml-6">
                {option.description}
              </p>
              <div className="flex gap-1 ml-6">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleExport(option.type, 'json')}
                  disabled={exporting === `${option.type}-json`}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  JSON
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleExport(option.type, 'csv')}
                  disabled={exporting === `${option.type}-csv`}
                >
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  CSV
                </Button>
              </div>
            </div>
          )
        })}
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            数据将以文件形式下载到您的设备
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
