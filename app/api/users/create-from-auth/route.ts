// app/api/users/create-from-auth/route.ts - 从认证信息创建用户记录的 API
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createUserProfileFromAuth } from "@/lib/user-service";

/**
 * POST - 从当前认证用户创建用户记录
 * 这个 API 用于在客户端注册成功后调用，确保用户记录被创建
 */
export async function POST(request: NextRequest) {
  try {
    // 获取认证 token
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "需要认证" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "服务器配置错误" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 验证 token 并获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      console.error("认证错误:", authError);
      return NextResponse.json(
        { error: `认证失败: ${authError.message}` },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "用户信息不存在" },
        { status: 401 }
      );
    }

    // 创建用户记录
    const { data, error } = await createUserProfileFromAuth(user);

    if (error) {
      console.error("创建用户记录错误:", error);
      return NextResponse.json(
        { error: error.message || "创建用户记录失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("创建用户记录异常:", error);
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json(
      { error: `创建用户记录时发生错误: ${errorMessage}` },
      { status: 500 }
    );
  }
}

