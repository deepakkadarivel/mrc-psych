import type { CategoryColor } from "@/lib/types";

export const CATEGORY_COLOR_CLASSES: Record<
  CategoryColor,
  { header: string; rowTint: string; label: string; border: string }
> = {
  teal: {
    header: "bg-teal-600 text-white dark:bg-teal-700",
    rowTint: "bg-teal-50/60 dark:bg-teal-950/20",
    label: "text-teal-700 dark:text-teal-400",
    border: "border-teal-500",
  },
  orange: {
    header: "bg-orange-600 text-white dark:bg-orange-700",
    rowTint: "bg-orange-50/60 dark:bg-orange-950/20",
    label: "text-orange-700 dark:text-orange-400",
    border: "border-orange-500",
  },
  red: {
    header: "bg-red-600 text-white dark:bg-red-700",
    rowTint: "bg-red-50/60 dark:bg-red-950/20",
    label: "text-red-700 dark:text-red-400",
    border: "border-red-500",
  },
  gray: {
    header: "bg-gray-600 text-white dark:bg-gray-700",
    rowTint: "bg-gray-50/60 dark:bg-gray-900/20",
    label: "text-gray-700 dark:text-gray-400",
    border: "border-gray-500",
  },
  blue: {
    header: "bg-blue-600 text-white dark:bg-blue-700",
    rowTint: "bg-blue-50/60 dark:bg-blue-950/20",
    label: "text-blue-700 dark:text-blue-400",
    border: "border-blue-500",
  },
  purple: {
    header: "bg-purple-600 text-white dark:bg-purple-700",
    rowTint: "bg-purple-50/60 dark:bg-purple-950/20",
    label: "text-purple-700 dark:text-purple-400",
    border: "border-purple-500",
  },
};
