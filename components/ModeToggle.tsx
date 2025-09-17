"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        aria-label="Toggle theme"
        disabled
        className="rounded-full glow-border bg-zinc-800/60"
      >
        <Sun className="h-5 w-5 text-yellow-400" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className={`relative rounded-full border transition-all 
        ${isDark 
          ? "border-blue-500/60 bg-black/70 hover:bg-blue-600/20 neon-blue" 
          : "border-yellow-400/70 bg-white/80 hover:bg-yellow-400/70"} 
      `}
    >
      {/* Sun */}
      <Sun
        className={`h-5 w-5 text-black transition-all duration-300
          ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
      />
      {/* Moon */}
      <Moon
        className={`absolute h-5 w-5 text-blue-400 transition-all duration-300
          ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
