# 智享生活助手 (IntelliLife Assistant)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**个性化的焕肤计划和运动计划管理工具**

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术栈](#-技术栈) • [项目结构](#-项目结构)

</div>

## 📋 项目概述

智享生活助手是一个现代化的个人健康管理平台，专注于帮助用户制定和管理个性化的焕肤计划和运动计划。通过智能提醒系统和数据统计分析，让用户更好地坚持健康生活方式。

### 🎯 核心目标

- 🌟 **个性化管理**: 根据用户需求定制焕肤和运动计划
- ⏰ **智能提醒**: 多渠道提醒系统确保计划执行
- 📊 **数据统计**: 详细的历史记录和进度分析
- 📱 **响应式设计**: 完美适配桌面端和移动端
- 🔒 **安全可靠**: 完善的用户认证和数据保护

## ✨ 功能特性

### 🧴 焕肤计划管理
- **多部位管理**: 支持面部、颈部、手部等多个护理部位
- **设备管理**: 管理各种美容设备和护肤工具
- **计划定制**: 创建个性化的焕肤护理计划
- **提醒设置**: 灵活的提醒规则和频率设置
- **历史记录**: 详细的护理历史和效果追踪

### 🏃‍♀️ 运动计划管理
- **运动条目**: 创建和管理各种运动项目
- **视频教程**: 上传和播放运动指导视频
- **计划制定**: 设置运动时长、组数和重复次数
- **进度追踪**: 记录运动完成情况和成果
- **数据分析**: 运动数据统计和趋势分析

### 🔔 智能提醒系统
- **站内消息**: 实时的站内通知系统
- **邮件提醒**: 自动发送邮件提醒
- **多种频率**: 支持每日、每周、自定义频率
- **提醒管理**: 灵活的提醒开关和设置

### 👥 用户管理
- **安全认证**: 基于NextAuth.js的安全登录系统
- **角色管理**: 用户和管理员角色权限控制
- **个人资料**: 完善的用户信息管理
- **账户安全**: 密码修改和账户安全设置

### 📊 管理后台
- **用户管理**: 管理员可查看和管理所有用户
- **数据统计**: 系统使用情况和用户行为分析
- **内容管理**: 管理系统内容和配置
- **系统监控**: 实时监控系统运行状态

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **MySQL**: >= 8.0
- **npm/yarn/pnpm**: 最新版本

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd IntelliLife-Assistant
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   # 或
   pnpm install
   ```

3. **环境配置**
   ```bash
   # 复制环境变量模板
   cp .env.example .env.local

   # 编辑环境变量
   # 配置数据库连接、NextAuth密钥等
   ```

4. **数据库设置**
   ```bash
   # 生成Prisma客户端
   npx prisma generate

   # 运行数据库迁移
   npx prisma db push

   # 填充种子数据
   npm run db:seed
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**

   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 默认账户

开发环境默认创建的测试账户：
- **邮箱**: test@example.com
- **密码**: 123456

## 🛠 技术栈

### 前端技术
- **[Next.js 15](https://nextjs.org/)** - React全栈框架
- **[TypeScript](https://www.typescriptlang.org/)** - 类型安全的JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - 实用优先的CSS框架
- **[shadcn/ui](https://ui.shadcn.com/)** - 现代化UI组件库
- **[React Hook Form](https://react-hook-form.com/)** - 高性能表单库
- **[Zod](https://zod.dev/)** - TypeScript优先的模式验证

### 后端技术
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - 服务端API
- **[Prisma](https://www.prisma.io/)** - 现代化数据库ORM
- **[MySQL 8.0](https://www.mysql.com/)** - 关系型数据库
- **[NextAuth.js](https://next-auth.js.org/)** - 身份认证解决方案
- **[Resend](https://resend.com/)** - 邮件发送服务
- **[Node-cron](https://www.npmjs.com/package/node-cron)** - 任务调度

### 开发工具
- **[ESLint](https://eslint.org/)** - 代码质量检查
- **[Prettier](https://prettier.io/)** - 代码格式化
- **[Turbopack](https://turbo.build/pack)** - 快速构建工具

## 📁 项目结构

```
IntelliLife-Assistant/
├── prisma/                    # 数据库相关
│   ├── schema.prisma         # 数据库模式定义
│   └── seed.ts              # 种子数据
├── public/                   # 静态资源
│   └── uploads/             # 用户上传文件
│       ├── videos/          # 视频文件
│       └── images/          # 图片文件
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # 认证相关页面
│   │   ├── (dashboard)/    # 用户仪表板
│   │   ├── admin/          # 管理后台
│   │   ├── api/            # API路由
│   │   └── globals.css     # 全局样式
│   ├── components/         # React组件
│   │   ├── ui/            # 基础UI组件
│   │   ├── forms/         # 表单组件
│   │   ├── layout/        # 布局组件
│   │   └── providers/     # Context提供者
│   ├── lib/               # 工具库
│   │   ├── api/          # API客户端
│   │   ├── auth.ts       # 认证配置
│   │   ├── db.ts         # 数据库连接
│   │   └── utils.ts      # 工具函数
│   └── types/            # TypeScript类型定义
├── doc/                  # 项目文档
├── .env.example         # 环境变量模板
├── .gitignore          # Git忽略文件
├── next.config.js      # Next.js配置
├── package.json        # 项目依赖
├── tailwind.config.js  # Tailwind配置
└── tsconfig.json       # TypeScript配置
```

## 🔧 环境变量配置

创建 `.env.local` 文件并配置以下环境变量：

```bash
# 数据库配置
DATABASE_URL="mysql://username:password@localhost:3306/intellilife"

# NextAuth.js配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# 邮件服务配置 (Resend)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# 文件上传配置
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="314572800"  # 300MB

# 时区配置
TZ="Asia/Shanghai"
```

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行端到端测试
npm run test:e2e
```

### 测试账户
开发环境提供以下测试账户：

**普通用户:**
- 邮箱: test@example.com
- 密码: 123456

**管理员:**
- 邮箱: admin@example.com
- 密码: admin123

## 🚀 部署指南

### 生产环境部署

#### 1. 构建项目
```bash
npm run build
```

#### 2. 启动生产服务器
```bash
npm start
```

#### 3. 使用PM2部署 (推荐)
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "intellilife-assistant" -- start

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

### Docker部署

#### 1. 构建Docker镜像
```bash
docker build -t intellilife-assistant .
```

#### 2. 运行容器
```bash
docker run -d \
  --name intellilife-assistant \
  -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  intellilife-assistant
```

### 环境配置检查清单

- [ ] 数据库连接配置正确
- [ ] NextAuth.js密钥已设置
- [ ] 邮件服务配置完成
- [ ] 文件上传目录权限正确
- [ ] SSL证书配置 (生产环境)
- [ ] 防火墙规则设置
- [ ] 备份策略制定

## 📊 性能优化

### 前端优化
- **代码分割**: 使用Next.js动态导入
- **图片优化**: 使用Next.js Image组件
- **缓存策略**: 合理设置缓存头
- **懒加载**: 非关键资源懒加载

### 后端优化
- **数据库索引**: 关键字段添加索引
- **查询优化**: 使用Prisma查询优化
- **缓存机制**: Redis缓存热点数据
- **文件压缩**: 静态资源压缩

### 监控指标
- **页面加载时间**: < 3秒
- **API响应时间**: < 500ms
- **数据库查询时间**: < 100ms
- **文件上传成功率**: > 99%

## 🔒 安全措施

### 数据安全
- **密码加密**: 使用bcrypt加密存储
- **SQL注入防护**: Prisma ORM防护
- **XSS防护**: 输入验证和输出编码
- **CSRF防护**: NextAuth.js内置防护

### 访问控制
- **身份认证**: JWT令牌验证
- **权限控制**: 基于角色的访问控制
- **会话管理**: 安全的会话处理
- **API限流**: 防止恶意请求

### 文件安全
- **文件类型验证**: 严格的文件类型检查
- **文件大小限制**: 防止大文件攻击
- **文件扫描**: 恶意文件检测
- **存储隔离**: 用户文件隔离存储

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

### 开发流程

1. **Fork项目**
   ```bash
   git clone https://github.com/your-username/IntelliLife-Assistant.git
   ```

2. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **提交更改**
   ```bash
   git commit -m "feat: add your feature description"
   ```

4. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **创建Pull Request**

### 代码规范

- **TypeScript**: 严格的类型检查
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Conventional Commits**: 提交信息规范

### 提交信息格式
```
type(scope): description

[optional body]

[optional footer]
```

**类型说明:**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

## 📝 更新日志

### v1.0.0 (2024-01-15)
- ✨ 初始版本发布
- 🧴 焕肤计划管理功能
- 🏃‍♀️ 运动计划管理功能
- 🔔 智能提醒系统
- 📱 响应式设计
- 👥 用户认证系统
- 📊 管理后台

### 即将发布
- 📈 数据分析面板
- 🌐 多语言支持
- 📱 移动端App
- 🔗 第三方集成
- 🤖 AI推荐系统

## 🆘 常见问题

### Q: 如何重置管理员密码？
A: 可以通过数据库直接修改，或使用种子脚本重新创建管理员账户。

### Q: 视频上传失败怎么办？
A: 检查文件大小是否超过300MB限制，确保服务器有足够的存储空间。

### Q: 邮件提醒不工作？
A: 检查Resend API密钥配置，确保邮件服务配置正确。

### Q: 数据库连接失败？
A: 检查DATABASE_URL配置，确保MySQL服务正在运行。

## 📞 技术支持

如果您在使用过程中遇到问题，可以通过以下方式获取帮助：

- 📧 **邮件支持**: support@intellilife.com
- 💬 **在线客服**: [客服链接]
- 📖 **文档中心**: [文档链接]
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/your-repo/issues)

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 🙏 致谢

感谢以下开源项目和贡献者：

- [Next.js](https://nextjs.org/) - React全栈框架
- [Prisma](https://www.prisma.io/) - 现代化ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [shadcn/ui](https://ui.shadcn.com/) - UI组件库
- [NextAuth.js](https://next-auth.js.org/) - 认证解决方案

---

<div align="center">

**智享生活助手 (IntelliLife Assistant)**

让健康生活更简单 | Make Healthy Living Easier

[⭐ Star](https://github.com/your-repo) • [🐛 Report Bug](https://github.com/your-repo/issues) • [💡 Request Feature](https://github.com/your-repo/issues)

</div>