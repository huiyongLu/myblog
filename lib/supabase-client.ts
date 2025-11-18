// lib/supabase-client.ts - 客户端 Supabase 实例
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    const error = "Missing NEXT_PUBLIC_SUPABASE_URL environment variable";
    console.error(error);
    throw new Error(error);
  }

  if (!supabaseKey) {
    const error = "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable";
    console.error(error);
    throw new Error(error);
  }

  try {
    return createSupabaseClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("创建 Supabase 客户端失败:", error);
    throw error;
  }
}
