import { Resend } from 'resend'

// 初始化Resend客户端
const resend = new Resend(process.env.RESEND_API_KEY)

// 邮件发送接口
interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

// 发送邮件函数
export async function sendEmail(options: EmailOptions) {
  try {
    // 如果没有配置API密钥，则跳过邮件发送
    if (!process.env.RESEND_API_KEY) {
      console.log('邮件发送跳过：未配置RESEND_API_KEY')
      console.log('邮件内容:', {
        to: options.to,
        subject: options.subject,
        html: options.html,
      })
      return { success: true, message: '邮件发送跳过（开发模式）' }
    }

    const result = await resend.emails.send({
      from: options.from || 'IntelliLife Assistant <noreply@intellilife.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    })

    console.log('邮件发送成功:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('邮件发送失败:', error)
    return { success: false, error }
  }
}

// 发送欢迎邮件
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">智享生活助手</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">IntelliLife Assistant</p>
      </div>
      
      <h2 style="color: #374151;">欢迎加入智享生活助手！</h2>
      
      <p>亲爱的 ${userName}，</p>
      
      <p>感谢您注册智享生活助手！我们很高兴您选择我们的平台来管理您的个性化生活计划。</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #374151;">您可以使用以下功能：</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;">📅 创建和管理个性化焕肤计划</li>
          <li style="margin-bottom: 8px;">💪 制定运动健身计划</li>
          <li style="margin-bottom: 8px;">🎥 上传和管理运动视频</li>
          <li style="margin-bottom: 8px;">⏰ 设置智能提醒</li>
          <li style="margin-bottom: 8px;">📊 查看进度统计</li>
          <li style="margin-bottom: 8px;">💌 接收站内信通知</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          开始使用
        </a>
      </div>
      
      <p>如果您有任何问题或需要帮助，请随时联系我们的客服团队。</p>
      
      <p>祝您使用愉快！</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #6b7280; font-size: 14px; text-align: center;">
        此邮件由智享生活助手自动发送，请勿回复。<br>
        如需取消订阅，请登录您的账户进行设置。
      </p>
    </div>
  `

  return await sendEmail({
    to: userEmail,
    subject: '欢迎加入智享生活助手！',
    html,
  })
}

// 发送密码重置邮件
export async function sendPasswordResetEmail(userEmail: string, resetToken: string, userName: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}&email=${userEmail}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">智享生活助手</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">IntelliLife Assistant</p>
      </div>
      
      <h2 style="color: #374151;">密码重置请求</h2>
      
      <p>亲爱的 ${userName}，</p>
      
      <p>我们收到了您的密码重置请求。如果这不是您本人的操作，请忽略此邮件。</p>
      
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;">
          <strong>安全提示：</strong>此重置链接将在1小时后失效，请尽快完成密码重置。
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          重置密码
        </a>
      </div>
      
      <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
      <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
        ${resetUrl}
      </p>
      
      <p>如果您没有请求密码重置，请联系我们的客服团队。</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #6b7280; font-size: 14px; text-align: center;">
        此邮件由智享生活助手自动发送，请勿回复。<br>
        为了您的账户安全，请不要将此邮件转发给他人。
      </p>
    </div>
  `

  return await sendEmail({
    to: userEmail,
    subject: '密码重置请求 - 智享生活助手',
    html,
  })
}

// 发送账户激活邮件
export async function sendAccountActivationEmail(userEmail: string, activationToken: string, userName: string) {
  const activationUrl = `${process.env.NEXTAUTH_URL}/auth/activate?token=${activationToken}&email=${userEmail}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">智享生活助手</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">IntelliLife Assistant</p>
      </div>
      
      <h2 style="color: #374151;">激活您的账户</h2>
      
      <p>亲爱的 ${userName}，</p>
      
      <p>感谢您注册智享生活助手！请点击下面的按钮激活您的账户：</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${activationUrl}" 
           style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          激活账户
        </a>
      </div>
      
      <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
      <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 14px;">
        ${activationUrl}
      </p>
      
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;">
          <strong>注意：</strong>此激活链接将在24小时后失效。
        </p>
      </div>
      
      <p>激活后，您就可以开始使用我们的所有功能了！</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="color: #6b7280; font-size: 14px; text-align: center;">
        此邮件由智享生活助手自动发送，请勿回复。
      </p>
    </div>
  `

  return await sendEmail({
    to: userEmail,
    subject: '激活您的账户 - 智享生活助手',
    html,
  })
}
