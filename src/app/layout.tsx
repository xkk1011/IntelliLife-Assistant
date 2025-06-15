import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import "@/lib/init-reminder-service";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "智享生活助手",
  description: "个性化的焕肤计划和运动计划管理工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSessionProvider>
            {children}
            <Toaster />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
