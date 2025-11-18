// lib/user-service.ts - 用户服务工具函数
import { createServerClient } from "./supabase-server";
import type { CreateUserProfileInput } from "@/types/user";

/**
 * 创建用户记录
 * @param userData 用户数据
 * @returns 创建的用户记录或错误
 */
export async function createUserProfile(userData: CreateUserProfileInput) {
  try {
    const supabase = createServerClient();

    // 检查用户是否已存在
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", userData.id)
      .single();

    if (existingUser) {
      console.log("用户已存在，跳过创建:", userData.id);
      return { data: existingUser, error: null };
    }

    // 创建用户记录
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: userData.id,
        email: userData.email,
        username: userData.username || userData.email.split("@")[0],
        full_name: userData.full_name || null,
        avatar_url: userData.avatar_url || null,
        bio: userData.bio || null,
      })
      .select()
      .single();

    if (error) {
      console.error("创建用户记录错误:", error);
      return { data: null, error };
    }

    console.log("用户记录创建成功:", data.id);
    return { data, error: null };
  } catch (error) {
    console.error("创建用户记录异常:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("未知错误"),
    };
  }
}

/**
 * 从 Supabase Auth 用户信息创建用户记录
 * @param authUser Supabase Auth 用户对象
 * @returns 创建的用户记录或错误
 */
export async function createUserProfileFromAuth(authUser: {
  id: string;
  email?: string;
  user_metadata?: {
    user_name?: string;
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
}) {
  const userData: CreateUserProfileInput = {
    id: authUser.id,
    email: authUser.email || "",
    username:
      authUser.user_metadata?.user_name ??
      authUser.user_metadata?.name ??
      authUser.email?.split("@")[0],
    full_name:
      authUser.user_metadata?.full_name ??
      authUser.user_metadata?.name ??
      undefined,
    avatar_url:
      authUser.user_metadata?.avatar_url ??
      authUser.user_metadata?.picture ??
      undefined,
  };

  return createUserProfile(userData);
}

