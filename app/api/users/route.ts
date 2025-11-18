// app/api/users/route.ts - 用户 CRUD API 路由
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { CreateUserProfileInput, UpdateUserProfileInput } from "@/types/user";

// GET - 查询用户列表或单个用户
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const email = searchParams.get("email");

    const supabase = createServerClient();

    if (userId) {
      // 查询单个用户
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: error.code === "PGRST116" ? 404 : 500 }
        );
      }

      return NextResponse.json({ data });
    }

    if (email) {
      // 根据邮箱查询用户
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: error.code === "PGRST116" ? 404 : 500 }
        );
      }

      return NextResponse.json({ data });
    }

    // 查询所有用户（需要认证）
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "需要认证才能查询所有用户" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("查询用户错误:", error);
    return NextResponse.json(
      { error: "查询用户时发生错误" },
      { status: 500 }
    );
  }
}

// POST - 创建新用户
export async function POST(request: NextRequest) {
  try {
    const body: CreateUserProfileInput = await request.json();
    const { id, email, username, full_name, avatar_url, bio } = body;

    if (!id || !email) {
      return NextResponse.json(
        { error: "id 和 email 是必填字段" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // 检查用户是否已存在
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", id)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "用户已存在" },
        { status: 409 }
      );
    }

    // 创建用户记录
    const { data, error } = await supabase
      .from("users")
      .insert({
        id,
        email,
        username: username || email.split("@")[0],
        full_name: full_name || null,
        avatar_url: avatar_url || null,
        bio: bio || null,
      })
      .select()
      .single();

    if (error) {
      console.error("创建用户错误:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("创建用户异常:", error);
    return NextResponse.json(
      { error: "创建用户时发生错误" },
      { status: 500 }
    );
  }
}

// PUT - 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const body: { id: string; data: UpdateUserProfileInput } = await request.json();
    const { id, data: updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "id 是必填字段" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 更新用户记录
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("更新用户错误:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("更新用户异常:", error);
    return NextResponse.json(
      { error: "更新用户时发生错误" },
      { status: 500 }
    );
  }
}

// DELETE - 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "id 是必填字段" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 删除用户记录
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) {
      console.error("删除用户错误:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "用户已删除" });
  } catch (error) {
    console.error("删除用户异常:", error);
    return NextResponse.json(
      { error: "删除用户时发生错误" },
      { status: 500 }
    );
  }
}

