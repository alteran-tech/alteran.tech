"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { href: "#about", label: "О себе" },
  { href: "#projects", label: "Проекты" },
  { href: "#contact", label: "Контакт" },
];

/**
 * Sticky site header with glassmorphism background.
 * Includes mobile hamburger menu and smooth scroll navigation.
 * "use client" -- requires useState for mobile toggle and scroll detection.
 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setMobileOpen(false);
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [],
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl border-b border-ancient-teal/10 shadow-[0_2px_20px_rgba(0,0,0,0.4)]"
          : "bg-transparent",
      )}
      style={scrolled ? { background: "var(--header-bg)" } : undefined}
    >
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <span className="font-alteran text-xl text-ancient-teal glow-text-subtle tracking-widest group-hover:glow-text transition-all duration-300">
              alteran
            </span>
            <span className="text-sm text-ancient-aqua/60 hidden sm:inline">.tech</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  "px-4 py-2 text-sm text-ancient-aqua/80 rounded-lg",
                  "transition-all duration-200",
                  "hover:text-ancient-teal hover:bg-ancient-teal/5",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ancient-teal",
                )}
              >
                {link.label}
              </a>
            ))}

            {/* Sign-in link -- subtle on desktop */}
            <Link
              href="/sign-in"
              className={cn(
                "ml-3 px-4 py-1.5 text-sm rounded-lg",
                "text-ancient-aqua/50 border border-ancient-teal/15",
                "transition-all duration-200",
                "hover:text-ancient-teal hover:border-ancient-teal/40",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ancient-teal",
              )}
            >
              Войти
            </Link>

            <ThemeToggle />
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className={cn(
              "md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg",
              "text-ancient-aqua/70 hover:text-ancient-teal",
              "transition-colors duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ancient-teal",
            )}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
          >
            <span className="sr-only">{mobileOpen ? "Закрыть меню" : "Открыть меню"}</span>
            <div className="w-5 flex flex-col gap-1.5">
              <span
                className={cn(
                  "block h-0.5 bg-current rounded-full transition-all duration-300",
                  mobileOpen && "translate-y-[4px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 bg-current rounded-full transition-all duration-300",
                  mobileOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 bg-current rounded-full transition-all duration-300",
                  mobileOpen && "-translate-y-[4px] -rotate-45",
                )}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileOpen ? "max-h-64 opacity-100 pb-4" : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-col gap-1 pt-2 border-t border-ancient-teal/10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={cn(
                  "px-4 py-3 text-sm text-ancient-aqua/80 rounded-lg",
                  "transition-colors duration-200",
                  "hover:text-ancient-teal hover:bg-ancient-teal/5",
                )}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/sign-in"
              className={cn(
                "px-4 py-3 text-sm text-ancient-aqua/50 rounded-lg",
                "transition-colors duration-200",
                "hover:text-ancient-teal hover:bg-ancient-teal/5",
              )}
              onClick={() => setMobileOpen(false)}
            >
              Войти
            </Link>
            <div className="px-4 py-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
