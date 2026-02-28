import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and resolves Tailwind CSS conflicts with twMerge.
 * Usage: cn("px-4 py-2", condition && "bg-blue-500", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes upload URLs to go through the /api/uploads/ route.
 * - "https://alteran.tech/uploads/img.png" → "/api/uploads/img.png"
 * - "/uploads/img.png" → "/api/uploads/img.png"
 * - "/api/uploads/img.png" → "/api/uploads/img.png" (already correct)
 * - External URLs (GitHub etc.) → unchanged
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Already using the API route
  if (url.startsWith("/api/uploads/")) return url;

  // Relative /uploads/ path
  if (url.startsWith("/uploads/")) {
    return `/api/uploads/${url.slice("/uploads/".length)}`;
  }

  // Absolute URL with /uploads/ path — strip the origin
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/uploads/")) {
      return `/api/uploads/${parsed.pathname.slice("/uploads/".length)}`;
    }
  } catch {
    // not a valid absolute URL — return as-is
  }

  return url;
}

/**
 * Generates a URL-safe slug from text.
 * Transliterates basic Cyrillic, lowercases, strips non-alphanumeric, collapses hyphens.
 */
export function slugify(text: string): string {
  const cyrillic: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
    я: "ya",
  };

  return text
    .toLowerCase()
    .split("")
    .map((char) => cyrillic[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
