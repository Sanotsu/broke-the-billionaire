import type { Achievement } from '@/types'
import type { useGameStore } from '@/stores/game'
import type { useProgressStore } from '@/stores/progress'
import { PRODUCTS, PRODUCT_MAP } from '@/data/products'

type GameStore = ReturnType<typeof useGameStore>
type ProgressStore = ReturnType<typeof useProgressStore>

interface AchieveContext {
  game: GameStore
  progress: ProgressStore
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-buy', name: '零花钱', desc: '购买第一件商品', icon: '🛍️' },
  { id: 'imagination-poor', name: '贫穷限制想象', desc: '同一件低于 $100 的商品复购 1000 次', icon: '🍜' },
  { id: 'big-spender', name: '一掷千金', desc: '单笔消费超过 $10 亿', icon: '💸' },
  { id: 'keeper', name: '败家资产', desc: '持有商品的年维护费合计超过 $1 亿', icon: '🛥️' },
  { id: 'philanthropist', name: '慈善家', desc: '工程与慈善类累计消费超过 $100 亿', icon: '❤️' },
  { id: 'exact-zero', name: '一分不剩', desc: '任意关卡余额精确归零', icon: '🏅' },
  { id: 'clear-l1', name: '小目标达成', desc: '通关「小目标」', icon: '1️⃣' },
  { id: 'clear-l2', name: '开了眼', desc: '通关「开开眼」', icon: '2️⃣' },
  { id: 'clear-l3', name: '想象力见顶', desc: '通关「想象力的天花板」', icon: '3️⃣' },
  { id: 'clear-l4', name: '跑赢印钞机', desc: '通关「与利息赛跑」', icon: '4️⃣' },
  { id: 'clear-l5', name: '文明买单人', desc: '通关「文明的账单」', icon: '5️⃣' },
  { id: 'collector', name: '金钱博物学家', desc: '图鉴收集达到 50%', icon: '📚' },
  { id: 'archaeologist', name: '财富考古学家', desc: '图鉴收集 100%', icon: '🏺' },
  { id: 'price-master', name: '价格锚定大师', desc: '猜价格 10 连击', icon: '🎯' },
]

export const ACHIEVEMENT_MAP: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
)

export function evaluateAchievements(ctx: AchieveContext): Achievement[] {
  const { game, progress } = ctx
  const unlocked: string[] = []

  if (game.itemCount > 0) unlocked.push('first-buy')

  if (game.lastPurchaseCost >= 1_000_000_000) unlocked.push('big-spender')

  for (const [id, qty] of Object.entries(game.owned)) {
    const p = PRODUCT_MAP[id]
    if (p && p.price < 100 && qty >= 1000) unlocked.push('imagination-poor')
  }

  const maintenanceTotal = Object.entries(game.owned).reduce((sum, [id, qty]) => {
    const p = PRODUCT_MAP[id]
    return sum + (p?.maintenancePerYear ?? 0) * qty
  }, 0)
  if (maintenanceTotal >= 100_000_000) unlocked.push('keeper')

  const philanthropy = Object.entries(game.owned)
    .filter(([id]) => PRODUCT_MAP[id]?.category === 'project')
    .reduce((sum, [id, qty]) => sum + (PRODUCT_MAP[id]?.price ?? 0) * qty, 0)
  if (philanthropy >= 10_000_000_000) unlocked.push('philanthropist')

  if (game.exactZero) unlocked.push('exact-zero')

  if (game.level && game.cleared) {
    const levelAchievements: Record<string, string> = {
      l1: 'clear-l1',
      l2: 'clear-l2',
      l3: 'clear-l3',
      l4: 'clear-l4',
      l5: 'clear-l5',
    }
    const ach = levelAchievements[game.level.id]
    if (ach) unlocked.push(ach)
  }

  const half = Math.ceil(PRODUCTS.length / 2)
  if (progress.collectionCount >= half) unlocked.push('collector')
  if (progress.collectionCount >= PRODUCTS.length) unlocked.push('archaeologist')

  if (progress.save.guess.bestStreak >= 10) unlocked.push('price-master')

  return unlocked
    .filter((id) => !progress.save.achievements.includes(id))
    .map((id) => ACHIEVEMENT_MAP[id])
    .filter((a): a is Achievement => a !== undefined)
}
