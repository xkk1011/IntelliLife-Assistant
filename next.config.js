/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 在构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在构建时忽略TypeScript错误
    ignoreBuildErrors: true,
  },
  experimental: {
    // 启用服务器组件
    serverComponentsExternalPackages: ['prisma'],
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
