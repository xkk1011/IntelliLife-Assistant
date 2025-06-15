"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-context"

interface Props {
  children: ReactNode
}

export default function AuthSessionProvider({ children }: Props) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  )
}
