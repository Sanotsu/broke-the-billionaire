import type { Category, CategoryId } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 'daily', name: '日常与体验', icon: '☕', gradient: 'from-amber-500/20 to-amber-700/10' },
  { id: 'watch', name: '服饰与腕表', icon: '⌚', gradient: 'from-orange-500/20 to-orange-700/10' },
  { id: 'jewelry', name: '珠宝与收藏', icon: '💎', gradient: 'from-rose-500/20 to-rose-700/10' },
  { id: 'art', name: '艺术与文物', icon: '🖼️', gradient: 'from-fuchsia-500/20 to-fuchsia-700/10' },
  { id: 'car', name: '豪车', icon: '🏎️', gradient: 'from-red-500/20 to-red-700/10' },
  { id: 'estate', name: '房产与土地', icon: '🏝️', gradient: 'from-emerald-500/20 to-emerald-700/10' },
  { id: 'vehicle', name: '飞机与游艇', icon: '🛩️', gradient: 'from-sky-500/20 to-sky-700/10' },
  { id: 'club', name: '球队与公司', icon: '🏟️', gradient: 'from-indigo-500/20 to-indigo-700/10' },
  { id: 'project', name: '工程与慈善', icon: '🚀', gradient: 'from-cyan-500/20 to-cyan-700/10' },
]

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>
