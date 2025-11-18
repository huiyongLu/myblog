import { createServerClient } from "@/lib/supabase-server";

const supabase = createServerClient();

interface PostProps {
  params: { slug: string[] };
}

export default async function PostPage({ params }: PostProps) {
  const { slug } = await params;
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    return <div className="container mx-auto py-10">文章不存在</div>;
  }

  return (
    <article className="container mx-auto py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-500 mb-6">
        {new Date(post.created_at).toLocaleDateString()}
      </p>
      <div className="prose dark:prose-invert max-w-none">
        {/* 实际项目中建议使用 markdown 渲染库（如 react-markdown） */}
        <p>{post.content}</p>
      </div>
    </article>
  );
}
