"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// 密码强度检查函数
const passwordStrengthCheck = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const score = Object.values(checks).filter(Boolean).length
  return { checks, score }
}

const registerSchema = z.object({
  name: z.string().min(1, "请输入姓名").max(50, "姓名不能超过50个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string()
    .min(8, "密码至少需要8个字符")
    .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
    .regex(/[a-z]/, "密码必须包含至少一个小写字母")
    .regex(/\d/, "密码必须包含至少一个数字")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "密码必须包含至少一个特殊字符"),
  confirmPassword: z.string().min(1, "请确认密码"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "请同意用户协议和隐私政策",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ checks: {}, score: 0 })
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const watchedPassword = watch("password", "")

  // 实时更新密码强度
  useEffect(() => {
    if (watchedPassword) {
      setPasswordStrength(passwordStrengthCheck(watchedPassword))
    }
  }, [watchedPassword])

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "注册失败")
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      }
    } catch {
      setError("注册失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-green-600 text-lg font-medium mb-2">
                注册成功！
              </div>
              <p className="text-gray-600">
                正在跳转到登录页面...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">注册</CardTitle>
          <CardDescription className="text-center">
            创建您的智享生活助手账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                type="text"
                placeholder="请输入姓名"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码（至少8个字符）"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}

              {/* 密码强度指示器 */}
              {watchedPassword && (
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength.score
                            ? passwordStrength.score <= 2
                              ? "bg-red-500"
                              : passwordStrength.score <= 3
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">
                    <div className="grid grid-cols-2 gap-1">
                      <span className={passwordStrength.checks.length ? "text-green-600" : "text-gray-400"}>
                        ✓ 至少8个字符
                      </span>
                      <span className={passwordStrength.checks.uppercase ? "text-green-600" : "text-gray-400"}>
                        ✓ 包含大写字母
                      </span>
                      <span className={passwordStrength.checks.lowercase ? "text-green-600" : "text-gray-400"}>
                        ✓ 包含小写字母
                      </span>
                      <span className={passwordStrength.checks.number ? "text-green-600" : "text-gray-400"}>
                        ✓ 包含数字
                      </span>
                      <span className={passwordStrength.checks.special ? "text-green-600" : "text-gray-400"}>
                        ✓ 包含特殊字符
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                {...register("confirmPassword")}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* 用户协议复选框 */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Controller
                  name="agreeToTerms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="agreeToTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
                <Label htmlFor="agreeToTerms" className="text-sm leading-5">
                  我已阅读并同意{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                    用户协议
                  </Link>{" "}
                  和{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                    隐私政策
                  </Link>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-600 text-center">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "注册中..." : "注册"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已有账户？{" "}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                立即登录
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
