import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { TipButton } from "@/components/TipButton";
const supabase = createServerClient();

export const dynamic = "force-dynamic";

interface PostProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function PostPage({ params }: PostProps) {
  const { slug: slugParam } = await params;
  const slugSegments = slugParam?.filter(Boolean);

  if (!slugSegments?.length) {
    redirect("/");
  }

  const slug = slugSegments.join("/");

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !post) {
    console.error("获取文章失败:", error);
    notFound();
  }

  // 从环境变量获取打赏接收地址，如果没有则使用默认地址
  const recipientAddress =
    process.env.NEXT_PUBLIC_TIP_RECIPIENT_ADDRESS ||
    "0x0000000000000000000000000000000000000000"; // 实际接收地址否则无法收到打赏

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-0">
      <header className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm" style={{ color: "var(--muted-text)" }}>
            {new Date(post.created_at).toLocaleDateString("zh-CN")}
          </p>
          <TipButton
            recipientAddress={recipientAddress}
            postTitle={post.title}
          />
        </div>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 transition-colors duration-500 dark:text-white">
          {post.title}
        </h1>
      </header>

      <div className="prose prose-slate max-w-none dark:prose-invert">
        <p>{post.content ?? "这篇文章暂无内容，稍后再来看看吧。"}</p>
      </div>
    </article>
  );
}
