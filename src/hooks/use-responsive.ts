'use client'

import { useState, useEffect } from 'react'

// 断点定义（与 Tailwind CSS 保持一致）
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof breakpoints

// 检测当前屏幕尺寸
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl')
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md')
      } else {
        setCurrentBreakpoint('sm')
      }
    }

    // 初始化
    updateBreakpoint()

    // 监听窗口大小变化
    window.addEventListener('resize', updateBreakpoint)
    
    return () => {
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, [])

  return currentBreakpoint
}

// 检测是否为移动设备
export function useIsMobile() {
  const breakpoint = useBreakpoint()
  return breakpoint === 'sm'
}

// 检测是否为平板设备
export function useIsTablet() {
  const breakpoint = useBreakpoint()
  return breakpoint === 'md'
}

// 检测是否为桌面设备
export function useIsDesktop() {
  const breakpoint = useBreakpoint()
  return ['lg', 'xl', '2xl'].includes(breakpoint)
}

// 检测屏幕方向
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    
    return () => {
      window.removeEventListener('resize', updateOrientation)
    }
  }, [])

  return orientation
}

// 检测是否支持触摸
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouchDevice
}

// 获取视口尺寸
export function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    
    return () => {
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  return size
}

// 响应式值选择器
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
  const breakpoint = useBreakpoint()
  
  // 按优先级查找值
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm']
  const currentIndex = breakpointOrder.indexOf(breakpoint)
  
  // 从当前断点开始向下查找
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp]!
    }
  }
  
  return defaultValue
}

// 媒体查询 Hook
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    
    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }, [query])

  return matches
}

// 预定义的媒体查询
export function usePreferredColorScheme() {
  return useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light'
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useIsHighDensityDisplay() {
  return useMediaQuery('(min-resolution: 2dppx)')
}

// 响应式网格列数计算
export function useResponsiveColumns(
  config: Partial<Record<Breakpoint, number>> = { sm: 1, md: 2, lg: 3, xl: 4 }
) {
  const breakpoint = useBreakpoint()
  
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm']
  const currentIndex = breakpointOrder.indexOf(breakpoint)
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (config[bp] !== undefined) {
      return config[bp]!
    }
  }
  
  return 1
}

// 响应式间距计算
export function useResponsiveSpacing(
  config: Partial<Record<Breakpoint, string>> = { 
    sm: 'gap-4', 
    md: 'gap-6', 
    lg: 'gap-8' 
  }
) {
  const breakpoint = useBreakpoint()
  
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm']
  const currentIndex = breakpointOrder.indexOf(breakpoint)
  
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (config[bp] !== undefined) {
      return config[bp]!
    }
  }
  
  return 'gap-4'
}

// 安全区域检测（用于移动设备的刘海屏等）
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
      })
    }

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    
    return () => {
      window.removeEventListener('resize', updateSafeArea)
    }
  }, [])

  return safeArea
}

// 设备类型检测
export function useDeviceType() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const isTouchDevice = useIsTouchDevice()
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  } as const
}
