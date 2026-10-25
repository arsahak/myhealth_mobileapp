// Gradient palettes, as [start, ..., end] color stops, for light and dark mode.

type Stops = readonly [string, string, ...string[]];
type Pair = { light: Stops; dark: Stops };

export const Gradients = {
  /** Home hero card. */
  hero: { light: ['#10b981', '#059669', '#0f766e'], dark: ['#059669', '#047857', '#134e4a'] },
  /** Soft wash behind the top of Home. */
  wash: { light: ['#d1fae5', '#fafafa'], dark: ['#022c22', '#000000'] },
  workoutTile: { light: ['#ecfdf5', '#d1fae5'], dark: ['rgba(16,185,129,0.24)', 'rgba(16,185,129,0.06)'] },
  foodTile: { light: ['#fff7ed', '#ffedd5'], dark: ['rgba(249,115,22,0.24)', 'rgba(249,115,22,0.06)'] },
  streak: { light: ['#fb923c', '#f43f5e'], dark: ['#ea580c', '#be123c'] },
  week: { light: ['#818cf8', '#7c3aed'], dark: ['#4f46e5', '#6d28d9'] },
  tip: { light: ['#f5f3ff', '#fdf2f8'], dark: ['rgba(139,92,246,0.22)', 'rgba(236,72,153,0.12)'] },
  /** Progress rings and chart bars: [lighter, deeper]. */
  green: { light: ['#6ee7b7', '#059669'], dark: ['#6ee7b7', '#10b981'] },
  orange: { light: ['#fdba74', '#f97316'], dark: ['#fdba74', '#fb923c'] },
} satisfies Record<string, Pair>;

/** Per-habit accent color (icon + soft tile). */
export const HabitColors: Record<string, { fg: string; light: string; dark: string }> = {
  Water: { fg: '#0ea5e9', light: '#e0f2fe', dark: 'rgba(14,165,233,0.18)' },
  Sleep: { fg: '#6366f1', light: '#e0e7ff', dark: 'rgba(99,102,241,0.2)' },
  Steps: { fg: '#10b981', light: '#d1fae5', dark: 'rgba(16,185,129,0.18)' },
  Avoid: { fg: '#f43f5e', light: '#ffe4e6', dark: 'rgba(244,63,94,0.18)' },
};
