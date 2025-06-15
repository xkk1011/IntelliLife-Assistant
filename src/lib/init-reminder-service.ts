import { reminderService } from './reminder-service'

// 初始化提醒服务
export function initReminderService() {
  // 只在服务器端启动提醒服务
  if (typeof window === 'undefined') {
    try {
      reminderService.start()
      console.log('提醒服务初始化成功')
    } catch (error) {
      console.error('提醒服务初始化失败:', error)
    }
  }
}

// 在应用启动时自动初始化
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  initReminderService()
}
