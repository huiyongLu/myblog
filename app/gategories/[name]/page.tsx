import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";

const supabase = createServerClient();

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  summary?: string | null;
  excerpt?: string | null;
  description?: string | null;
  content?: string | null;
  tags?: string[] | string | null;
};

const buildExcerpt = (post: BlogPost) => {
  const fallback =
    post.summary ?? post.excerpt ?? post.description ?? post.content ?? "";

  const normalized = fallback
    .replace(/[#>*`_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "这篇文章正在准备更丰富的摘要，敬请期待。";

  return normalized.length > 120 ? `${normalized.slice(0, 120)}…` : normalized;
};

const parseTags = (tags: BlogPost["tags"]) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean).slice(0, 6);
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);
};

interface CategoryPageProps {
  params: { name: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { name } = params;
  const categoryName = decodeURIComponent(name);

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("获取文章失败:", error);
  }

  const allPosts = (data as BlogPost[] | null) ?? [];

  // 筛选出包含该分类标签的文章
  const posts = allPosts.filter((post) => {
    const tags = parseTags(post.tags);
    return tags.includes(categoryName);
  });

  return (
    <div className="relative isolate overflow-hidden transition-colors duration-500">
      <div
        className="absolute inset-0 -z-20 transition-colors duration-500"
        style={{ backgroundColor: "var(--page-bg)" }}
      />
      <div
        className="absolute inset-0 -z-10 opacity-50 transition-colors duration-500"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "var(--grid-size) var(--grid-size)",
        }}
      />
      <div
        className="absolute -top-32 right-[-15%] h-96 w-96 -z-10 rounded-full blur-[140px] transition-colors duration-500"
        style={{ backgroundColor: "var(--glow-primary)" }}
      />
      <div
        className="absolute -bottom-40 left-[-10%] h-96 w-96 -z-10 rounded-full blur-[160px] transition-colors duration-500"
        style={{ backgroundColor: "var(--glow-secondary)" }}
      />

      <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-6xl flex-col px-4 pb-16 pt-12 sm:px-6 lg:px-8 xl:max-w-7xl">
        <section className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span
              className="inline-flex items-center rounded-full border px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-500"
              style={{
                borderColor: "var(--surface-border)",
                backgroundColor: "rgba(255,255,255,0.4)",
                color: "var(--muted-text)",
              }}
            >
              分类 · {categoryName}
            </span>
            <h1 className="text-4xl font-semibold text-slate-800 transition-colors duration-500 dark:text-slate-100 sm:text-5xl">
              {categoryName}
            </h1>
            <p className="text-base leading-relaxed text-(--muted-text) transition-colors duration-500 sm:text-lg">
              共找到 {posts.length} 篇相关文章
            </p>
          </div>
          <div className="grid gap-4 text-right text-sm text-(--muted-text)">
            <div>
              <Link
                href="/gategories"
                className="text-sky-600 transition hover:text-sky-700 hover:underline dark:text-sky-300 dark:hover:text-sky-200"
              >
                ← 返回分类
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 flex-1">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => {
              const tags = parseTags(post.tags);
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/50"
                  style={{
                    backgroundColor: "var(--card-soft-bg)",
                    borderColor: "var(--card-soft-border)",
                    boxShadow: "var(--card-soft-shadow)",
                  }}
                >
                  <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-linear-to-b from-sky-500/20 via-sky-500/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="flex items-center justify-between text-xs text-(--muted-text)">
                    <span>
                      {new Date(post.created_at).toLocaleDateString("zh-CN")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sky-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:text-sky-300">
                      阅读更多 →
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-800 transition-colors duration-500 group-hover:text-sky-600 dark:text-slate-100 dark:group-hover:text-sky-200">
                    {post.title}
                  </h2>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-(--muted-text)">
                    {buildExcerpt(post)}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {tags.length ? (
                      tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-sky-600 transition-colors duration-500 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200"
                          style={{
                            borderColor: "var(--card-soft-border)",
                            backgroundColor: "rgba(59,130,246,0.12)",
                          }}
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span
                        className="inline-flex items-center rounded-full border px-3 py-1 text-xs text-(--muted-text)"
                        style={{ borderColor: "var(--card-soft-border)" }}
                      >
                        未分类
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
            {!posts.length && (
              <div
                className="col-span-full rounded-3xl border border-dashed p-12 text-center text-(--muted-text)"
                style={{
                  backgroundColor: "var(--card-soft-bg)",
                  borderColor: "var(--card-soft-border)",
                }}
              >
                该分类下暂无文章，稍后再来看看新的内容吧。
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
