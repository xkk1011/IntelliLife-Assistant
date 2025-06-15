// 浏览器兼容性检测和处理工具

export interface BrowserInfo {
  name: string
  version: string
  engine: string
  platform: string
  isMobile: boolean
  isSupported: boolean
  features: FeatureSupport
}

export interface FeatureSupport {
  webp: boolean
  avif: boolean
  css: {
    grid: boolean
    flexbox: boolean
    customProperties: boolean
    backdrop: boolean
  }
  js: {
    es6: boolean
    modules: boolean
    asyncAwait: boolean
    fetch: boolean
  }
  apis: {
    intersectionObserver: boolean
    resizeObserver: boolean
    webWorkers: boolean
    serviceWorker: boolean
    localStorage: boolean
    sessionStorage: boolean
  }
}

// 检测浏览器信息
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent
  const platform = navigator.platform
  
  let name = 'Unknown'
  let version = 'Unknown'
  let engine = 'Unknown'
  
  // 检测浏览器名称和版本
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    name = 'Chrome'
    const match = userAgent.match(/Chrome\/(\d+)/)
    version = match ? match[1] : 'Unknown'
    engine = 'Blink'
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox'
    const match = userAgent.match(/Firefox\/(\d+)/)
    version = match ? match[1] : 'Unknown'
    engine = 'Gecko'
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari'
    const match = userAgent.match(/Version\/(\d+)/)
    version = match ? match[1] : 'Unknown'
    engine = 'WebKit'
  } else if (userAgent.includes('Edg')) {
    name = 'Edge'
    const match = userAgent.match(/Edg\/(\d+)/)
    version = match ? match[1] : 'Unknown'
    engine = 'Blink'
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    name = 'Opera'
    const match = userAgent.match(/(?:Opera|OPR)\/(\d+)/)
    version = match ? match[1] : 'Unknown'
    engine = 'Blink'
  }
  
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  const features = detectFeatureSupport()
  const isSupported = checkBrowserSupport(name, parseInt(version), features)
  
  return {
    name,
    version,
    engine,
    platform,
    isMobile,
    isSupported,
    features
  }
}

// 检测功能支持
function detectFeatureSupport(): FeatureSupport {
  return {
    webp: checkWebPSupport(),
    avif: checkAVIFSupport(),
    css: {
      grid: checkCSSSupport('display', 'grid'),
      flexbox: checkCSSSupport('display', 'flex'),
      customProperties: checkCSSSupport('--test', 'test'),
      backdrop: checkCSSSupport('backdrop-filter', 'blur(1px)')
    },
    js: {
      es6: checkES6Support(),
      modules: checkModuleSupport(),
      asyncAwait: checkAsyncAwaitSupport(),
      fetch: typeof fetch !== 'undefined'
    },
    apis: {
      intersectionObserver: typeof IntersectionObserver !== 'undefined',
      resizeObserver: typeof ResizeObserver !== 'undefined',
      webWorkers: typeof Worker !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: checkStorageSupport('localStorage'),
      sessionStorage: checkStorageSupport('sessionStorage')
    }
  }
}

// 检查浏览器是否受支持
function checkBrowserSupport(name: string, version: number, features: FeatureSupport): boolean {
  // 最低版本要求
  const minVersions: Record<string, number> = {
    Chrome: 80,
    Firefox: 75,
    Safari: 13,
    Edge: 80,
    Opera: 67
  }
  
  const minVersion = minVersions[name]
  if (!minVersion) return false
  
  // 检查版本
  if (version < minVersion) return false
  
  // 检查关键功能
  const requiredFeatures = [
    features.css.flexbox,
    features.js.es6,
    features.js.fetch,
    features.apis.localStorage
  ]
  
  return requiredFeatures.every(Boolean)
}

// WebP 支持检测
function checkWebPSupport(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
}

// AVIF 支持检测
function checkAVIFSupport(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  } catch {
    return false
  }
}

// CSS 功能支持检测
function checkCSSSupport(property: string, value: string): boolean {
  const element = document.createElement('div')
  try {
    element.style.setProperty(property, value)
    return element.style.getPropertyValue(property) === value
  } catch {
    return false
  }
}

// ES6 支持检测
function checkES6Support(): boolean {
  try {
    // 检查箭头函数
    eval('() => {}')
    // 检查 const/let
    eval('const test = 1; let test2 = 2;')
    // 检查模板字符串
    eval('`template ${1} string`')
    return true
  } catch {
    return false
  }
}

// 模块支持检测
function checkModuleSupport(): boolean {
  const script = document.createElement('script')
  return 'noModule' in script
}

// async/await 支持检测
function checkAsyncAwaitSupport(): boolean {
  try {
    eval('async function test() { await Promise.resolve(); }')
    return true
  } catch {
    return false
  }
}

// 存储支持检测
function checkStorageSupport(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type]
    const test = '__storage_test__'
    storage.setItem(test, test)
    storage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// 获取兼容性警告
export function getCompatibilityWarnings(browserInfo: BrowserInfo): string[] {
  const warnings: string[] = []
  
  if (!browserInfo.isSupported) {
    warnings.push(`您的浏览器 ${browserInfo.name} ${browserInfo.version} 版本过低，可能无法正常使用所有功能`)
  }
  
  if (!browserInfo.features.css.grid) {
    warnings.push('您的浏览器不支持 CSS Grid，布局可能显示异常')
  }
  
  if (!browserInfo.features.css.flexbox) {
    warnings.push('您的浏览器不支持 CSS Flexbox，布局可能显示异常')
  }
  
  if (!browserInfo.features.js.fetch) {
    warnings.push('您的浏览器不支持 Fetch API，网络请求可能失败')
  }
  
  if (!browserInfo.features.apis.localStorage) {
    warnings.push('您的浏览器不支持本地存储，某些功能可能无法正常工作')
  }
  
  return warnings
}

// 应用兼容性修复
export function applyCompatibilityFixes(browserInfo: BrowserInfo): void {
  // 添加浏览器类名到 body
  document.body.classList.add(`browser-${browserInfo.name.toLowerCase()}`)
  document.body.classList.add(`engine-${browserInfo.engine.toLowerCase()}`)
  
  if (browserInfo.isMobile) {
    document.body.classList.add('is-mobile')
  }
  
  if (!browserInfo.isSupported) {
    document.body.classList.add('unsupported-browser')
  }
  
  // CSS 功能检测类名
  if (!browserInfo.features.css.grid) {
    document.body.classList.add('no-css-grid')
  }
  
  if (!browserInfo.features.css.backdrop) {
    document.body.classList.add('no-backdrop-filter')
  }
  
  // 添加 polyfill 提示
  if (!browserInfo.features.apis.intersectionObserver) {
    console.warn('IntersectionObserver not supported, consider adding a polyfill')
  }
  
  if (!browserInfo.features.apis.resizeObserver) {
    console.warn('ResizeObserver not supported, consider adding a polyfill')
  }
}

// 推荐的浏览器列表
export const recommendedBrowsers = [
  { name: 'Chrome', minVersion: 80, downloadUrl: 'https://www.google.com/chrome/' },
  { name: 'Firefox', minVersion: 75, downloadUrl: 'https://www.mozilla.org/firefox/' },
  { name: 'Safari', minVersion: 13, downloadUrl: 'https://www.apple.com/safari/' },
  { name: 'Edge', minVersion: 80, downloadUrl: 'https://www.microsoft.com/edge' }
]

// 获取升级建议
export function getUpgradeRecommendation(browserInfo: BrowserInfo): string | null {
  if (browserInfo.isSupported) return null
  
  const recommended = recommendedBrowsers.find(b => b.name === browserInfo.name)
  if (recommended) {
    return `建议升级到 ${recommended.name} ${recommended.minVersion} 或更高版本`
  }
  
  return '建议使用现代浏览器以获得最佳体验'
}
