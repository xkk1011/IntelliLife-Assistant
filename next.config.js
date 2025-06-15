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
  // 外部包配置
  serverExternalPackages: ["prisma"],
  images: {
    domains: ["localhost"],
  },
};

module.exports = nextConfig;
