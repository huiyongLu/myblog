"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Button, Dropdown, Space, message } from "antd";
import { usePathname } from "next/navigation";
import { BellFilled, DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const Nav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      message.error("登出失败");
    } else {
      message.success("已成功登出");
      // 只使用 router.push，避免多重刷新
      router.push("/");
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "访客";
    // 优先使用 GitHub 用户名，然后是邮箱用户名
    return (
      user.user_metadata?.user_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "用户"
    );
  };

  const getUserEmail = () => {
    if (!user) return "";
    return user.email || "";
  };

  const getUserAvatar = () => {
    if (!user) {
      return "https://api.dicebear.com/7.x/pixel-art/svg?seed=guest";
    }
    // 优先使用 GitHub 头像，然后是其他头像，最后是生成的像素头像
    return (
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.id}`
    );
  };

  const dropdownContent = (
    <div
      className="w-64 rounded-3xl border p-5 shadow-2xl backdrop-blur transition-colors duration-300"
      style={{
        backgroundColor: "var(--surface-bg)",
        borderColor: "var(--surface-border)",
        boxShadow: "var(--surface-shadow)",
      }}
      onClick={(e) => e.stopPropagation()} // 阻止整个下拉内容区域的点击事件冒泡
    >
      <div
        className="flex items-center gap-3 border-b pb-4 transition-colors duration-300"
        style={{ borderColor: "var(--surface-border)" }}
      >
        <Avatar
          size={48}
          src={getUserAvatar()}
          className="border border-sky-400/30 shadow-[0_12px_24px_rgba(14,116,244,0.2)] transition-shadow duration-300 dark:shadow-[0_0_18px_rgba(56,189,248,0.28)]"
        />
        <div>
          <p className="text-sm font-semibold text-(--surface-text) transition-colors duration-300">
            {getUserDisplayName()}
          </p>
          <p className="text-xs text-(--surface-text)/70 transition-colors duration-300">
            {getUserEmail() || "未登录"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4 text-sm text-(--surface-text) transition-colors duration-300">
        <div className="flex items-center justify-between">
          <span className="text-(--surface-text)/70 transition-colors duration-300">
            通知
          </span>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()} // 阻止点击事件冒泡
            className="flex h-8 w-8 items-center justify-center rounded-full border px-2 transition hover:border-sky-400 hover:text-sky-400 dark:hover:border-sky-500 dark:hover:text-sky-200"
            style={{
              borderColor: "var(--surface-border)",
              color: "var(--surface-text)",
              backgroundColor: "var(--surface-bg)",
            }}
            aria-label="通知"
          >
            <BellFilled />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-(--surface-text)/70 transition-colors duration-300">
            主题
          </span>
          <div
            className="rounded-full border px-3 py-1 transition-colors duration-300"
            style={{
              borderColor: "var(--surface-border)",
              backgroundColor: "var(--surface-bg)",
            }}
            onMouseDown={(e) => e.stopPropagation()} // 使用 onMouseDown 阻止事件冒泡
            onClick={(e) => e.stopPropagation()} // 阻止点击事件冒泡
          >
            <ThemeToggle />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-(--surface-text)/70 transition-colors duration-300">
            语言
          </span>
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()} // 阻止点击事件冒泡
          >
            <select
              className="appearance-none rounded-xl px-3 py-1 pr-8 text-xs shadow-inner transition-colors duration-300 focus:border-sky-400 focus:outline-none dark:focus:border-sky-500"
              style={{
                borderColor: "var(--surface-border)",
                backgroundColor: "var(--surface-bg)",
                color: "var(--surface-text)",
              }}
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
            <DownOutlined className="pointer-events-none absolute right-2 top-2 text-[10px] text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      </div>

      {user ? (
        <Button
          type="default"
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border py-2 text-sm font-medium shadow-sm transition hover:border-sky-400 hover:text-sky-500 dark:hover:border-sky-500 dark:hover:text-sky-200"
          style={{
            borderColor: "var(--surface-border)",
            color: "var(--surface-text)",
            backgroundColor: "var(--surface-bg)",
          }}
          icon={<LogoutOutlined />}
        >
          登出
        </Button>
      ) : (
        <Link href="/login">
          <Button
            type="primary"
            block
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 py-2 text-sm font-medium shadow-sm transition hover:bg-sky-600"
          >
            登录
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <header className="px-4 transition-colors duration-300">
      <div className="container mx-auto flex items-center justify-between px-2 py-4 transition-colors duration-300">
        <Link href="/" className="group">
          <Avatar
            size={48}
            src={getUserAvatar()}
            className="border border-sky-500/40 shadow-[0_12px_24px_rgba(14,116,244,0.2)] transition-all duration-300 group-hover:border-sky-400 group-hover:shadow-[0_16px_30px_rgba(14,116,244,0.3)] dark:shadow-[0_0_22px_rgba(56,189,248,0.3)]"
          />
        </Link>
        <div className="flex flex-row items-center">
          <Link
            href="/"
            className="mr-2 font-bold transform text-(--surface-text) transition hover:scale-105 hover:text-blue-400"
          >
            <div
              className={`${
                pathname === "/" ? "text-blue-400 " : "hover:border-b-2"
              }`}
            >
              首页
            </div>
          </Link>
          <Link
            href="/gategories"
            className="mr-2 font-bold transform text-(--surface-text)/80 transition hover:scale-105 hover:text-blue-400"
          >
            <div
              className={` ${
                pathname === "/gategories"
                  ? "text-blue-400 "
                  : "hover:border-b-2"
              }`}
            >
              分类
            </div>
          </Link>
          <Link
            href="/blog/new"
            className="mr-2 font-bold transform text-(--surface-text)/80 transition hover:scale-105 hover:text-blue-300"
          >
            <div
              className={` ${
                pathname === "/blog/new" ? "text-blue-400 " : "hover:border-b-2"
              }`}
            >
              新文章
            </div>
          </Link>

          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{ items: [] }}
            popupRender={() => dropdownContent}
          >
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="ml-2 flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium shadow-inner transition hover:border-sky-400 hover:text-sky-500 dark:hover:border-sky-500 dark:hover:text-sky-200"
              style={{
                borderColor: "var(--surface-border)",
                backgroundColor: "var(--surface-bg)",
                color: "var(--surface-text)",
              }}
            >
              <Space size={6}>
                <Avatar
                  size={32}
                  src={getUserAvatar()}
                  className="border border-sky-500/40 shadow-[0_12px_24px_rgba(14,116,244,0.2)] transition-shadow duration-300 dark:shadow-[0_0_18px_rgba(56,189,248,0.28)]"
                />
                <span className="hidden text-sm font-medium text-(--surface-text) sm:inline">
                  {loading ? "加载中..." : getUserDisplayName()}
                </span>
                <DownOutlined className="text-xs text-slate-400 dark:text-slate-500" />
              </Space>
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Nav;
