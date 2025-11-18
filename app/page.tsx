import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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

export default async function Home() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("获取文章失败:", error);
  }

  const posts = (data as BlogPost[] | null) ?? [];

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
              Web3 · 开源 · 分享
            </span>
            <h1 className="text-4xl font-semibold text-slate-800 transition-colors duration-500 dark:text-white sm:text-5xl">
              探索区块链与前端的交汇
            </h1>
            <p className="text-base leading-relaxed text-(--muted-text) transition-colors duration-500 sm:text-lg">
              记录去中心化应用的构建心得、工程实践与个人思考，从概念到落地，与你一起穿梭于技术宇宙。
            </p>
          </div>
          <div className="grid gap-4 text-right text-sm text-(--muted-text)">
            <div>
              <span className="block text-(--muted-text)">累计文章</span>
              <span className="text-3xl font-semibold text-slate-800 transition-colors duration-500 dark:text-slate-100">
                {posts.length}
              </span>
            </div>
            <div>
              <span className="block text-(--muted-text)">最新更新</span>
              <span className="text-lg text-slate-700 transition-colors duration-500 dark:text-slate-200">
                {posts[0]
                  ? new Date(posts[0].created_at).toLocaleDateString()
                  : "--"}
              </span>
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
                暂无文章，稍后再来看看新的内容吧。
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-center gap-4 text-(--muted-text)">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border text-lg transition hover:border-sky-400 hover:text-sky-500 dark:hover:border-sky-500 dark:hover:text-sky-300"
              style={{
                borderColor: "var(--card-soft-border)",
                backgroundColor: "var(--card-soft-bg)",
              }}
              aria-label="上一页"
            >
              ‹
            </button>
            <span
              className="rounded-full border px-4 py-1 text-sm text-sky-600 transition-colors duration-500 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200"
              style={{
                borderColor: "var(--card-soft-border)",
                backgroundColor: "var(--card-soft-bg)",
              }}
            >
              第 1 页
            </span>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border text-lg transition hover:border-sky-400 hover:text-sky-500 dark:hover:border-sky-500 dark:hover:text-sky-300"
              style={{
                borderColor: "var(--card-soft-border)",
                backgroundColor: "var(--card-soft-bg)",
              }}
              aria-label="下一页"
            >
              ›
            </button>
          </div>
        </section>

        <section
          className="mt-16 rounded-3xl border px-8 py-10 backdrop-blur transition-colors duration-500"
          style={{
            backgroundColor: "var(--card-soft-bg)",
            borderColor: "var(--card-soft-border)",
            boxShadow: "var(--card-soft-shadow)",
          }}
        >
          <div className="grid gap-10 text-sm text-(--muted-text) md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 transition-colors duration-500 dark:text-sky-300">
                关于我们
              </h3>
              <p className="mt-4 leading-relaxed text-(--muted-text)">
                分享技术见解、记录学习历程，专注
                Web3、去中心化金融与前端工程实践，让知识在社区中持续流动。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 transition-colors duration-500 dark:text-sky-300">
                快速链接
              </h3>
              <ul className="mt-4 space-y-2 text-(--muted-text)">
                <li>
                  <Link
                    href="/"
                    className="transition hover:text-sky-600 hover:underline dark:hover:text-sky-200"
                  >
                    首页
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gategories"
                    className="transition hover:text-sky-600 hover:underline dark:hover:text-sky-200"
                  >
                    分类
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="transition hover:text-sky-600 hover:underline dark:hover:text-sky-200"
                  >
                    新文章
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 transition-colors duration-500 dark:text-sky-300">
                联系方式
              </h3>
              <ul className="mt-4 space-y-2 text-(--muted-text)">
                <li>邮箱：yuyi.gz@163.com；yuyigz@gmail.com</li>
                <li>
                  GitHub：{" "}
                  <a
                    href="https://github.com/yy9331"
                    className="transition hover:text-sky-600 hover:underline dark:hover:text-sky-200"
                  >
                    github.com/yy9331
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
