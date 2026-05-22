import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes safely, resolving conflicts.
 * Uses clsx for conditional class handling + tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to relative time ("2 hours ago", "yesterday", etc.)
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" });
}

/**
 * Format a date to a short local date string.
 */
export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    month: "numeric",
    day: "numeric",
  });
}

/**
 * Get user initials from a name string (for avatar fallback).
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate a DiceBear avatar URL from a seed string.
 */
export function getAvatarUrl(seed: string | null | undefined): string {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed || "user")}`;
}
