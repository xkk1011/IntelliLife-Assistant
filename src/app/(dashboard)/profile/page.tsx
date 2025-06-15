"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from '@/components/layout/breadcrumb'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(1, "请输入姓名").max(50, "姓名不能超过50个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string()
    .min(8, "密码至少需要8个字符")
    .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
    .regex(/[a-z]/, "密码必须包含至少一个小写字母")
    .regex(/\d/, "密码必须包含至少一个数字")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "密码必须包含至少一个特殊字符"),
  confirmPassword: z.string().min(1, "请确认密码"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name || "",
        email: session.user.email || "",
      })
    }
  }, [session, profileForm])

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "更新失败")
      } else {
        setSuccess("个人信息更新成功")
        // 更新session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.name,
            email: data.email,
          },
        })
      }
    } catch {
      setError("更新失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "密码修改失败")
      } else {
        setSuccess("密码修改成功")
        passwordForm.reset()
      }
    } catch {
      setError("密码修改失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="个人设置"
        description="管理您的个人资料、账户安全和偏好设置"
      />

      <div className="max-w-2xl">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">个人信息</TabsTrigger>
            <TabsTrigger value="security">安全设置</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
                <CardDescription>
                  更新您的个人信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      {...profileForm.register("name")}
                      disabled={isLoading}
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-red-600">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register("email")}
                      disabled={isLoading}
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-600">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="text-sm text-red-600">{error}</div>
                  )}

                  {success && (
                    <div className="text-sm text-green-600">{success}</div>
                  )}

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "更新中..." : "更新信息"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>修改密码</CardTitle>
                <CardDescription>
                  为了账户安全，请定期更换密码
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">当前密码</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...passwordForm.register("currentPassword")}
                      disabled={isLoading}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">新密码</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...passwordForm.register("newPassword")}
                      disabled={isLoading}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">确认新密码</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                      disabled={isLoading}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-600">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="text-sm text-red-600">{error}</div>
                  )}

                  {success && (
                    <div className="text-sm text-green-600">{success}</div>
                  )}

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "修改中..." : "修改密码"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
