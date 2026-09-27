"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setIsDark(shouldUseDark);

    document.documentElement.classList.toggle("dark", shouldUseDark);

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDark;

    setIsDark(newDarkMode);

    document.documentElement.classList.toggle("dark", newDarkMode);

    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  if (!mounted) {
    return (
      <div className="h-8 w-14 rounded-full border border-[#E5E5E5] bg-[#F5F5F5] dark:border-[#404040] dark:bg-[#171717]" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Ganti tema"
      title={isDark ? "Gunakan light mode" : "Gunakan dark mode"}
      className="relative h-8 w-14 shrink-0 rounded-full border border-[#D4D4D4] bg-[#F5F5F5] transition dark:border-[#404040] dark:bg-[#171717]"
    >
      <span
        className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#000000] text-[11px] text-white shadow-sm transition-all dark:bg-[#FFFFFF] dark:text-black ${isDark ? "left-7" : "left-1"}`}
      >
        {isDark ? "☾" : "☀"}
      </span>
    </button>
  );
}
