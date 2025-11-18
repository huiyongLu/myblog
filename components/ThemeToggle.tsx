// components/ThemeToggle.tsx
"use client";

import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react"; // 需要安装 lucide-react 图标库

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡
    toggleTheme();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止 mousedown 事件冒泡
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      aria-label={`切换到${theme === "light" ? "暗黑" : "浅色"}模式`}
      className="flex h-8 w-8 items-center justify-center bg-card-bg rounded-full hover:bg-primary-color/10 transition-colors"
    >
      {theme === "light" ? (
        <Moon size={18} /> // 暗黑模式图标
      ) : (
        <Sun size={18} /> // 浅色模式图标
      )}
    </button>
  );
}
