import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";

const supabase = createServerClient();

type BlogPost = {
  id: string;
  tags?: string[] | string | null;
};

type Category = {
  name: string;
  count: number;
};

const parseTags = (tags: BlogPost["tags"]) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean);
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const buildCategories = (posts: BlogPost[]) => {
  const counter = new Map<string, number>();

  posts.forEach((post) => {
    parseTags(post.tags).forEach((tag) => {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    });
  });

  const result: Category[] = Array.from(counter.entries()).map(
    ([name, count]) => ({
      name,
      count,
    })
  );

  return result
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 60);
};

export default async function CategoriesPage() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, tags")
    .eq("published", true);
  if (error) {
    console.error("获取分类失败:", error);
  }

  const posts = (data as BlogPost[] | null) ?? [];
  const categories = buildCategories(posts);

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
        className="absolute -top-48 left-[-10%] h-96 w-96 -z-10 rounded-full blur-[160px] transition-colors duration-500"
        style={{ backgroundColor: "var(--glow-primary)" }}
      />
      <div
        className="absolute -bottom-32 right-[-15%] h-96 w-96 -z-10 rounded-full blur-[160px] transition-colors duration-500"
        style={{ backgroundColor: "var(--glow-secondary)" }}
      />

      <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-6xl flex-col px-4 pb-16 pt-12 sm:px-6 lg:px-8 xl:max-w-7xl">
        <header className="mb-12">
          <h1 className="text-4xl font-semibold text-slate-800 transition-colors duration-500 dark:text-slate-100 sm:text-5xl">
            文章分类
          </h1>
        </header>

        <section className="flex-1">
          {categories.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/gategories/${encodeURIComponent(category.name)}`}
                  className="group flex flex-col rounded-3xl border px-8 py-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/50"
                  style={{
                    backgroundColor: "var(--card-soft-bg)",
                    borderColor: "var(--card-soft-border)",
                    boxShadow: "var(--card-soft-shadow)",
                  }}
                >
                  <h2 className="text-2xl font-semibold text-sky-600 transition-colors duration-300 group-hover:text-sky-700 dark:text-sky-200 dark:group-hover:text-sky-100">
                    {category.name}
                  </h2>
                  <p className="mt-3 text-sm text-(--muted-text)">
                    共 {category.count} 篇文章
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="flex h-64 items-center justify-center rounded-3xl border border-dashed text-(--muted-text)"
              style={{
                backgroundColor: "var(--card-soft-bg)",
                borderColor: "var(--card-soft-border)",
              }}
            >
              暂无分类数据，稍后再来看看。
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
