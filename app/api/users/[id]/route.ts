// app/api/users/[id]/route.ts - 单个用户的 CRUD API 路由
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { UpdateUserProfileInput } from "@/types/user";

// GET - 根据 ID 查询单个用户
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "PGRST116" ? 404 : 500 }
      );
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

// PUT - 更新用户信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: UpdateUserProfileInput = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("users")
      .update({
        ...body,
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = createServerClient();

    const { error } = await supabase.from("users").delete().eq("id", id);

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

