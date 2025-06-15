'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'
import { 
  BrowserInfo, 
  detectBrowser, 
  getCompatibilityWarnings, 
  applyCompatibilityFixes,
  getUpgradeRecommendation,
  recommendedBrowsers
} from '@/utils/browser-compatibility'

interface BrowserCompatibilityCheckProps {
  showDetails?: boolean
  autoFix?: boolean
  onCompatibilityChecked?: (browserInfo: BrowserInfo) => void
}

export function BrowserCompatibilityCheck({
  showDetails = false,
  autoFix = true,
  onCompatibilityChecked
}: BrowserCompatibilityCheckProps) {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [showDetailedInfo, setShowDetailedInfo] = useState(showDetails)

  useEffect(() => {
    const info = detectBrowser()
    setBrowserInfo(info)
    setWarnings(getCompatibilityWarnings(info))
    
    if (autoFix) {
      applyCompatibilityFixes(info)
    }
    
    onCompatibilityChecked?.(info)
  }, [autoFix, onCompatibilityChecked])

  if (!browserInfo) {
    return null
  }

  const upgradeRecommendation = getUpgradeRecommendation(browserInfo)

  // 如果浏览器完全兼容且不需要显示详情，则不渲染
  if (browserInfo.isSupported && warnings.length === 0 && !showDetails) {
    return null
  }

  const getDeviceIcon = () => {
    if (browserInfo.isMobile) {
      return browserInfo.platform.includes('iPad') ? <Tablet className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const getStatusIcon = () => {
    if (browserInfo.isSupported && warnings.length === 0) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (warnings.length > 0) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusText = () => {
    if (browserInfo.isSupported && warnings.length === 0) {
      return '完全兼容'
    } else if (warnings.length > 0) {
      return '部分兼容'
    } else {
      return '不兼容'
    }
  }

  const getStatusVariant = (): 'default' | 'secondary' | 'destructive' => {
    if (browserInfo.isSupported && warnings.length === 0) {
      return 'default'
    } else if (warnings.length > 0) {
      return 'secondary'
    } else {
      return 'destructive'
    }
  }

  return (
    <div className="space-y-4">
      {/* 警告提示 */}
      {warnings.length > 0 && (
        <Alert variant={browserInfo.isSupported ? 'default' : 'destructive'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>浏览器兼容性提醒</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm">• {warning}</li>
              ))}
            </ul>
            {upgradeRecommendation && (
              <p className="mt-2 text-sm font-medium">{upgradeRecommendation}</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 浏览器信息卡片 */}
      {showDetailedInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getDeviceIcon()}
              浏览器兼容性信息
              <Badge variant={getStatusVariant()} className="ml-auto">
                {getStatusIcon()}
                {getStatusText()}
              </Badge>
            </CardTitle>
            <CardDescription>
              当前浏览器的详细信息和功能支持情况
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">浏览器</p>
                <p className="text-sm">{browserInfo.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">版本</p>
                <p className="text-sm">{browserInfo.version}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">引擎</p>
                <p className="text-sm">{browserInfo.engine}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">平台</p>
                <p className="text-sm">{browserInfo.platform}</p>
              </div>
            </div>

            {/* 功能支持 */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">功能支持情况</h4>
              
              {/* CSS 功能 */}
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">CSS 功能</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <FeatureStatus label="Grid 布局" supported={browserInfo.features.css.grid} />
                  <FeatureStatus label="Flexbox" supported={browserInfo.features.css.flexbox} />
                  <FeatureStatus label="CSS 变量" supported={browserInfo.features.css.customProperties} />
                  <FeatureStatus label="背景滤镜" supported={browserInfo.features.css.backdrop} />
                </div>
              </div>

              {/* JavaScript 功能 */}
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">JavaScript 功能</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <FeatureStatus label="ES6" supported={browserInfo.features.js.es6} />
                  <FeatureStatus label="模块" supported={browserInfo.features.js.modules} />
                  <FeatureStatus label="Async/Await" supported={browserInfo.features.js.asyncAwait} />
                  <FeatureStatus label="Fetch API" supported={browserInfo.features.js.fetch} />
                </div>
              </div>

              {/* API 功能 */}
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">浏览器 API</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <FeatureStatus label="Intersection Observer" supported={browserInfo.features.apis.intersectionObserver} />
                  <FeatureStatus label="Resize Observer" supported={browserInfo.features.apis.resizeObserver} />
                  <FeatureStatus label="Web Workers" supported={browserInfo.features.apis.webWorkers} />
                  <FeatureStatus label="Service Worker" supported={browserInfo.features.apis.serviceWorker} />
                  <FeatureStatus label="Local Storage" supported={browserInfo.features.apis.localStorage} />
                  <FeatureStatus label="Session Storage" supported={browserInfo.features.apis.sessionStorage} />
                </div>
              </div>

              {/* 图片格式 */}
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">图片格式支持</p>
                <div className="grid grid-cols-2 gap-2">
                  <FeatureStatus label="WebP" supported={browserInfo.features.webp} />
                  <FeatureStatus label="AVIF" supported={browserInfo.features.avif} />
                </div>
              </div>
            </div>

            {/* 推荐浏览器 */}
            {!browserInfo.isSupported && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">推荐浏览器</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendedBrowsers.map((browser) => (
                    <div key={browser.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{browser.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          版本 {browser.minVersion}+
                        </p>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={browser.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          下载
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 切换详情显示 */}
      {!showDetails && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetailedInfo(!showDetailedInfo)}
          >
            <Info className="h-4 w-4 mr-2" />
            {showDetailedInfo ? '隐藏' : '查看'}兼容性详情
          </Button>
        </div>
      )}
    </div>
  )
}

// 功能支持状态组件
function FeatureStatus({ label, supported }: { label: string; supported: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {supported ? (
        <CheckCircle className="h-3 w-3 text-green-500" />
      ) : (
        <XCircle className="h-3 w-3 text-red-500" />
      )}
      <span className={supported ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
        {label}
      </span>
    </div>
  )
}
