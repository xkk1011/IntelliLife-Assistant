// 性能优化工具函数

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 图片懒加载
export function lazyLoadImage(img: HTMLImageElement, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const image = entry.target as HTMLImageElement
            image.src = src
            image.onload = () => {
              image.classList.add('loaded')
              observer.unobserve(image)
              resolve()
            }
            image.onerror = () => {
              observer.unobserve(image)
              reject(new Error('Image failed to load'))
            }
          }
        })
      },
      {
        rootMargin: '50px'
      }
    )
    
    observer.observe(img)
  })
}

// 预加载关键资源
export function preloadResource(href: string, as: string, type?: string): void {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  document.head.appendChild(link)
}

// 预连接到外部域名
export function preconnect(href: string): void {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = href
  document.head.appendChild(link)
}

// 性能监控
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number> = new Map()

  // 标记时间点
  mark(name: string): void {
    this.marks.set(name, performance.now())
    if (performance.mark) {
      performance.mark(name)
    }
  }

  // 测量时间间隔
  measure(name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark)
    if (!startTime) {
      console.warn(`Start mark "${startMark}" not found`)
      return 0
    }

    const endTime = endMark ? this.marks.get(endMark) : performance.now()
    if (endMark && !endTime) {
      console.warn(`End mark "${endMark}" not found`)
      return 0
    }

    const duration = (endTime || performance.now()) - startTime
    this.measures.set(name, duration)

    if (performance.measure) {
      try {
        performance.measure(name, startMark, endMark)
      } catch (e) {
        console.warn('Performance.measure failed:', e)
      }
    }

    return duration
  }

  // 获取测量结果
  getMeasure(name: string): number | undefined {
    return this.measures.get(name)
  }

  // 获取所有测量结果
  getAllMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures)
  }

  // 清除标记和测量
  clear(): void {
    this.marks.clear()
    this.measures.clear()
    if (performance.clearMarks) {
      performance.clearMarks()
    }
    if (performance.clearMeasures) {
      performance.clearMeasures()
    }
  }

  // 获取页面性能指标
  getPageMetrics(): Record<string, number> {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    const metrics: Record<string, number> = {}
    
    if (navigation) {
      metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
      metrics.loadComplete = navigation.loadEventEnd - navigation.loadEventStart
      metrics.domInteractive = navigation.domInteractive - navigation.navigationStart
      metrics.firstByte = navigation.responseStart - navigation.requestStart
    }
    
    paint.forEach((entry) => {
      if (entry.name === 'first-paint') {
        metrics.firstPaint = entry.startTime
      } else if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime
      }
    })
    
    return metrics
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 内存使用监控
export function getMemoryUsage(): Record<string, number> | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    }
  }
  return null
}

// 网络连接信息
export function getConnectionInfo(): Record<string, any> | null {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
  }
  return null
}

// 检测设备性能等级
export function getDevicePerformanceLevel(): 'high' | 'medium' | 'low' {
  const memory = getMemoryUsage()
  const connection = getConnectionInfo()
  
  let score = 0
  
  // 内存评分
  if (memory) {
    if (memory.jsHeapSizeLimit > 4 * 1024 * 1024 * 1024) { // > 4GB
      score += 3
    } else if (memory.jsHeapSizeLimit > 2 * 1024 * 1024 * 1024) { // > 2GB
      score += 2
    } else {
      score += 1
    }
  } else {
    score += 2 // 默认中等
  }
  
  // 网络评分
  if (connection) {
    if (connection.effectiveType === '4g') {
      score += 2
    } else if (connection.effectiveType === '3g') {
      score += 1
    }
  } else {
    score += 1 // 默认
  }
  
  // CPU 核心数评分
  if (navigator.hardwareConcurrency) {
    if (navigator.hardwareConcurrency >= 8) {
      score += 2
    } else if (navigator.hardwareConcurrency >= 4) {
      score += 1
    }
  } else {
    score += 1
  }
  
  if (score >= 6) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

// 自适应性能配置
export function getAdaptiveConfig() {
  const performanceLevel = getDevicePerformanceLevel()
  const connection = getConnectionInfo()
  
  const config = {
    imageQuality: 'high' as 'high' | 'medium' | 'low',
    animationEnabled: true,
    lazyLoadThreshold: 100,
    prefetchEnabled: true,
    cacheStrategy: 'aggressive' as 'aggressive' | 'normal' | 'minimal'
  }
  
  // 根据性能等级调整
  if (performanceLevel === 'low') {
    config.imageQuality = 'low'
    config.animationEnabled = false
    config.lazyLoadThreshold = 200
    config.prefetchEnabled = false
    config.cacheStrategy = 'minimal'
  } else if (performanceLevel === 'medium') {
    config.imageQuality = 'medium'
    config.lazyLoadThreshold = 150
    config.cacheStrategy = 'normal'
  }
  
  // 根据网络状况调整
  if (connection?.saveData) {
    config.imageQuality = 'low'
    config.prefetchEnabled = false
    config.cacheStrategy = 'minimal'
  }
  
  if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
    config.imageQuality = 'low'
    config.animationEnabled = false
    config.prefetchEnabled = false
  }
  
  return config
}

// 资源优先级提示
export function setResourcePriority(element: HTMLElement, priority: 'high' | 'low'): void {
  if ('importance' in element) {
    (element as any).importance = priority
  }
}

// 关键资源预加载
export function preloadCriticalResources(): void {
  // 预加载字体
  preloadResource('/fonts/inter.woff2', 'font', 'font/woff2')
  
  // 预连接到 CDN
  preconnect('https://cdn.example.com')
  
  // 预加载关键 CSS
  preloadResource('/css/critical.css', 'style')
}

// 延迟加载非关键资源
export function loadNonCriticalResources(): void {
  // 延迟加载分析脚本
  setTimeout(() => {
    const script = document.createElement('script')
    script.src = '/js/analytics.js'
    script.async = true
    document.head.appendChild(script)
  }, 3000)
}

// 清理未使用的资源
export function cleanupUnusedResources(): void {
  // 清理过期的缓存
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('old-version')) {
          caches.delete(name)
        }
      })
    })
  }
  
  // 清理性能监控数据
  if (performanceMonitor.getAllMeasures()) {
    const measures = performanceMonitor.getAllMeasures()
    const now = Date.now()
    Object.keys(measures).forEach(key => {
      // 清理超过1小时的数据
      if (now - measures[key] > 3600000) {
        delete measures[key]
      }
    })
  }
}
