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
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'

export function ExportButtons() {
  const [exporting, setExporting] = useState<string | null>(null)

  const handleExport = async (type: string, format: 'json' | 'csv') => {
    try {
      setExporting(`${type}-${format}`)
      
      const response = await fetch(`/api/admin/export?type=${type}&format=${format}`)
      
      if (!response.ok) {
        throw new Error('导出失败')
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
      toast.error('导出失败，请重试')
    } finally {
      setExporting(null)
    }
  }

  const exportOptions = [
    { type: 'users', label: '用户数据' },
    { type: 'glow-plans', label: '焕肤计划' },
    { type: 'fitness-items', label: '运动条目' },
    { type: 'notifications', label: '通知数据' },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          导出数据
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>选择导出类型</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {exportOptions.map((option) => (
          <div key={option.type}>
            <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400 font-normal">
              {option.label}
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleExport(option.type, 'csv')}
              disabled={exporting === `${option.type}-csv`}
              className="pl-6"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exporting === `${option.type}-csv` ? '导出中...' : 'CSV格式'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleExport(option.type, 'json')}
              disabled={exporting === `${option.type}-json`}
              className="pl-6"
            >
              <FileText className="h-4 w-4 mr-2" />
              {exporting === `${option.type}-json` ? '导出中...' : 'JSON格式'}
            </DropdownMenuItem>
            {option.type !== exportOptions[exportOptions.length - 1].type && (
              <DropdownMenuSeparator />
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
