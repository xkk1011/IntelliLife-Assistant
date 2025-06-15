import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";

export default function Home() {
  return (
    <MainLayout showSidebar={false} useContainer={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
          智享生活助手
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 mb-8">
          个性化的焕肤计划和运动计划管理工具
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          让我们帮助您制定和管理个性化的美容护理计划和运动健身计划，通过智能提醒系统让您的生活更加规律和健康。
        </p>

        <div className="flex gap-4 items-center justify-center">
          <Link
            href="/auth/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            立即登录
          </Link>
          <Link
            href="/auth/register"
            className="bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-8 rounded-lg border border-blue-600 transition-colors"
          >
            免费注册
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">焕肤计划</h3>
            <p className="text-gray-600">制定个性化的美容护理计划，让肌肤焕发光彩</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💪</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">运动计划</h3>
            <p className="text-gray-600">管理运动健身计划，保持健康的生活方式</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔔</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">智能提醒</h3>
            <p className="text-gray-600">智能提醒系统帮您养成良好的生活习惯</p>
          </div>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}
