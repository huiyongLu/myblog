// types/user.ts - 用户表类型定义
export interface UserProfile {
  id: string; // 对应 auth.users.id
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileInput {
  id: string; // auth.users.id
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

export interface UpdateUserProfileInput {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

