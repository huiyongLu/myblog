// lib/user-api.ts - 客户端用户 API 调用工具函数
import type { UserProfile, CreateUserProfileInput, UpdateUserProfileInput } from "@/types/user";

const API_BASE_URL = "/api/users";

/**
 * 获取用户信息
 * @param userId 用户 ID
 * @returns 用户信息
 */
export async function getUser(userId: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}?id=${userId}`);
    if (!response.ok) {
      throw new Error("获取用户信息失败");
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("获取用户信息错误:", error);
    return null;
  }
}

/**
 * 根据邮箱获取用户信息
 * @param email 邮箱地址
 * @returns 用户信息
 */
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error("获取用户信息失败");
    }
    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("获取用户信息错误:", error);
    return null;
  }
}

/**
 * 创建用户
 * @param userData 用户数据
 * @returns 创建的用户信息
 */
export async function createUser(
  userData: CreateUserProfileInput
): Promise<UserProfile | null> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "创建用户失败");
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("创建用户错误:", error);
    throw error;
  }
}

/**
 * 更新用户信息
 * @param userId 用户 ID
 * @param updateData 更新的数据
 * @returns 更新后的用户信息
 */
export async function updateUser(
  userId: string,
  updateData: UpdateUserProfileInput
): Promise<UserProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "更新用户失败");
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("更新用户错误:", error);
    throw error;
  }
}

/**
 * 删除用户
 * @param userId 用户 ID
 * @returns 是否成功
 */
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || "删除用户失败");
    }

    return true;
  } catch (error) {
    console.error("删除用户错误:", error);
    throw error;
  }
}

/**
 * 获取所有用户（需要认证）
 * @param token 认证 token
 * @returns 用户列表
 */
export async function getAllUsers(token: string): Promise<UserProfile[]> {
  try {
    const response = await fetch(API_BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("获取用户列表失败");
    }

    const { data } = await response.json();
    return data || [];
  } catch (error) {
    console.error("获取用户列表错误:", error);
    throw error;
  }
}

