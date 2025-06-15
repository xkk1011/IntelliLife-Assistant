"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function useUser() {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "获取用户信息失败");
      }

      setUserProfile(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取用户信息失败");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const updateProfile = async (updateData: {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "更新资料失败");
      }

      setUserProfile(data.user);
      return { success: true, message: data.message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新资料失败";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchUserProfile();
    }
  }, [session?.user?.id, status, fetchUserProfile]);

  return {
    userProfile,
    isLoading,
    error,
    fetchUserProfile,
    updateProfile,
    isAuthenticated: status === "authenticated",
  };
}
