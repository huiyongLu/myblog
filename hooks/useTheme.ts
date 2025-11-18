// hooks/useTheme.ts
"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const transitionTimeoutRef = useRef<number | null>(null);

  const triggerThemeTransition = () => {
    const body = document.body;
    if (!body) return;
    body.classList.remove("theme-transition");
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
    }
    // 强制重绘，确保动画每次都能触发
    void body.offsetWidth;
    body.classList.add("theme-transition");
    transitionTimeoutRef.current = window.setTimeout(() => {
      body.classList.remove("theme-transition");
      transitionTimeoutRef.current = null;
    }, 650);
  };

  // 初始化主题（优先从 localStorage 读取，否则用系统偏好）
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      setTimeout(() => {
        setTheme(savedTheme);
        document.documentElement.classList.toggle(
          "dark",
          savedTheme === "dark"
        );
      }, 0);
    } else {
      // 跟随系统主题
      const systemTheme = prefersDark ? "dark" : "light";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(systemTheme);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  // 切换主题
  const toggleTheme = () => {
    triggerThemeTransition();
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme); // 持久化到本地存储
  };

  useEffect(
    () => () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    },
    []
  );

  return { theme, toggleTheme };
}
