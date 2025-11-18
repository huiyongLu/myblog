"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    data: any;
    error: { name: string; message: string } | null;
  }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    data: any;
    error: { name: string; message: string } | null;
  }>;
  signInWithGitHub: () => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 使用 useMemo 缓存 supabase 实例，避免每次渲染都创建新实例
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    // 获取当前会话
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("获取会话失败:", error);
      }

      // 只在组件仍然挂载时更新状态
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    getSession();

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // 只在组件仍然挂载时更新状态
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // 如果是登录成功，触发自定义事件以便其他组件响应
        if (event === "SIGNED_IN") {
          window.dispatchEvent(
            new CustomEvent("auth:signed-in", { detail: session })
          );
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      // 验证输入
      if (!email || !password) {
        return {
          data: null,
          error: {
            name: "ValidationError",
            message: "邮箱和密码不能为空",
          } as { name: string; message: string },
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("登录错误:", error);
        // 提供更友好的错误信息
        let errorMessage = error.message;
        // Supabase 错误码可能在 code、status 或 name 字段中
        const errorObj = error as {
          code?: string;
          status?: string | number;
          name?: string;
        };
        const errorCode = errorObj.code || errorObj.status || errorObj.name;

        if (
          error.message?.includes("Invalid login credentials") ||
          errorCode === "invalid_credentials" ||
          errorCode === 400
        ) {
          errorMessage = "邮箱或密码错误";
        } else if (
          error.message?.includes("Email not confirmed") ||
          errorCode === "email_not_confirmed"
        ) {
          errorMessage =
            "请先验证您的邮箱。我们已向您的邮箱发送了验证链接，请查收并点击链接完成验证。";
        } else if (error.message?.includes("Too many requests")) {
          errorMessage = "请求过于频繁，请稍后再试";
        }

        return {
          data: null,
          error: {
            ...error,
            message: errorMessage,
            code: errorCode,
          },
        };
      }

      if (!data) {
        console.error("登录返回数据为空");
        return {
          data: null,
          error: {
            name: "SignInError",
            message: "登录失败，请重试",
          } as { name: string; message: string },
        };
      }

      if (data.session) {
        console.log("登录成功，用户:", data.session.user.email);
        // 更新本地状态
        setSession(data.session);
        setUser(data.session.user);
        setLoading(false);
      } else {
        console.warn("登录成功但无会话数据");
      }

      return { data, error };
    } catch (err) {
      console.error("登录异常:", err);
      const errorMessage =
        err instanceof Error ? err.message : "登录时发生错误，请重试";
      return {
        data: null,
        error: {
          name: "SignInError",
          message: errorMessage,
        } as { name: string; message: string },
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("注册错误:", error);
        // 提供更友好的错误信息
        let errorMessage = error.message;
        if (error.message.includes("already registered")) {
          errorMessage = "该邮箱已被注册，请直接登录";
        } else if (error.message.includes("Password")) {
          errorMessage =
            "密码不符合要求，请确保密码至少6位且包含大小写字母和数字";
        }
        return {
          data: null,
          error: {
            ...error,
            message: errorMessage,
          },
        };
      }

      if (data.user) {
        console.log("注册成功，用户:", data.user.email);

        // 如果直接返回了会话，尝试创建用户记录
        if (data.session) {
          // 如果直接返回了会话，说明不需要邮箱验证
          console.log("注册成功且自动登录");
          setSession(data.session);
          setUser(data.user);
          setLoading(false);

          // 确保用户记录已创建（如果数据库触发器未触发）
          try {
            const response = await fetch("/api/users/create-from-auth", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.session.access_token}`,
              },
            });
            if (response.ok) {
              console.log("用户记录创建成功");
            }
          } catch (err) {
            console.error("创建用户记录失败:", err);
            // 不阻止注册流程
          }
        } else {
          // 需要邮箱验证
          console.log("注册成功，需要邮箱验证");
        }
      }

      return { data, error };
    } catch (err) {
      console.error("注册异常:", err);
      return {
        data: null,
        error: {
          name: "SignUpError",
          message: "注册时发生错误，请重试",
        } as { name: string; message: string },
      };
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      if (!email) {
        return {
          error: {
            name: "ValidationError",
            message: "邮箱地址不能为空",
          } as { name: string; message: string },
        };
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("重新发送验证邮件错误:", error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error("重新发送验证邮件异常:", err);
      return {
        error: {
          name: "ResendEmailError",
          message:
            err instanceof Error ? err.message : "发送验证邮件时发生错误",
        } as { name: string; message: string },
      };
    }
  };

  const signInWithGitHub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "user:email", // 请求邮箱权限，允许访问用户的邮箱地址
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGitHub,
    signOut,
    resendConfirmationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
