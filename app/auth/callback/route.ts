// app/auth/callback/route.ts - GitHub OAuth 回调处理
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createUserProfileFromAuth } from "@/lib/user-service";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("服务器配置错误")}`,
          requestUrl.origin
        )
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth callback error:", error);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(error.message)}`,
          requestUrl.origin
        )
      );
    }

    // 如果成功登录/注册，创建或更新用户记录
    if (data?.user) {
      try {
        const { error: createError } = await createUserProfileFromAuth(
          data.user
        );
        if (createError) {
          console.error("创建用户记录失败:", createError);
          // 不阻止登录流程，只记录错误
        } else {
          console.log("用户记录创建成功:", data.user.id);
        }
      } catch (err) {
        console.error("创建用户记录异常:", err);
        // 不阻止登录流程
      }
    }
  }

  // 重定向到首页，并强制刷新以更新认证状态
  const redirectUrl = new URL(next, requestUrl.origin);
  redirectUrl.searchParams.set("auth", "success");
  return NextResponse.redirect(redirectUrl);
}
