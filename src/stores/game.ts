import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { LevelConfig, LevelResult, Product } from '@/types'
import { PRODUCT_MAP } from '@/data/products'
import { CATEGORY_MAP } from '@/data/categories'
import { SPEND_CLEAR_RATIO } from '@/data/levels'

export interface TrophyEntry {
  product: Product
  qty: number
  subtotal: number
}

export const useGameStore = defineStore('game', () => {
  const level = ref<LevelConfig | null>(null)
  const balance = ref(0)
  const owned = ref<Record<string, number>>({})
  const startedAt = ref(0)
  const settled = ref(false)
  const lastPurchaseCost = ref(0)
  const now = ref(Date.now())
  const expired = ref(false)

  const initial = computed(() => level.value?.initial ?? 0)
  const spent = computed(() => initial.value - balance.value)
  const kinds = computed(() => Object.keys(owned.value).length)
  const itemCount = computed(() =>
    Object.values(owned.value).reduce((s, n) => s + n, 0),
  )

  const minKinds = computed(() => level.value?.minKinds ?? 0)
  const kindsGoal = computed(() => Math.max(1, minKinds.value))
  const kindsMet = computed(() => kinds.value >= minKinds.value || (level.value?.timed ?? false))
  const spendRatio = computed(() => (initial.value > 0 ? spent.value / initial.value : 0))
  const spendMet = computed(
    () => spendRatio.value >= SPEND_CLEAR_RATIO || (level.value?.timed ?? false),
  )
  const exactZero = computed(() => level.value !== null && balance.value === 0)
  const cleared = computed(
    () => level.value !== null && (level.value.timed ? exactZero.value : spendMet.value && kindsMet.value),
  )
  const timedOut = computed(
    () =>
      (level.value?.timed ?? false) &&
      !cleared.value &&
      now.value > startedAt.value + (level.value?.timeLimitSec ?? 0) * 1000,
  )
  const remainingSec = computed(() => {
    if (!(level.value?.timed ?? false)) return null
    const left = Math.ceil(
      (startedAt.value + (level.value?.timeLimitSec ?? 0) * 1000 - now.value) / 1000,
    )
    return Math.max(0, left)
  })
  const elapsedMs = computed(() => now.value - startedAt.value)

  const spentByCategory = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const [id, qty] of Object.entries(owned.value)) {
      const p = PRODUCT_MAP[id]
      if (p) map[p.category] = (map[p.category] ?? 0) + p.price * qty
    }
    return map
  })

  const topCategories = computed(() =>
    Object.entries(spentByCategory.value)
      .map(([id, amount]) => ({ id, name: CATEGORY_MAP[id as keyof typeof CATEGORY_MAP]?.name ?? id, amount }))
      .sort((a, b) => b.amount - a.amount),
  )

  const trophyList = computed<TrophyEntry[]>(() =>
    Object.entries(owned.value)
      .map(([id, qty]) => {
        const product = PRODUCT_MAP[id]
        return product ? { product, qty, subtotal: product.price * qty } : null
      })
      .filter((e): e is TrophyEntry => e !== null)
      .sort((a, b) => b.subtotal - a.subtotal),
  )

  const maintenancePerYear = computed(() =>
    Object.entries(owned.value).reduce((sum, [id, qty]) => {
      const p = PRODUCT_MAP[id]
      return sum + (p?.maintenancePerYear ?? 0) * qty
    }, 0),
  )

  const maintenancePerSec = computed(() => {
    const scale = level.value?.constraints.timeScaleDaysPerSec ?? 0
    if (scale <= 0) return 0
    return Math.floor((maintenancePerYear.value / 365) * scale)
  })

  const interestPerSec = computed(() => {
    const pct = level.value?.constraints.interestPerSecPct ?? 0
    if (pct <= 0) return 0
    return Math.floor((balance.value * pct) / 100)
  })

  function start(cfg: LevelConfig): void {
    level.value = cfg
    balance.value = cfg.initial
    owned.value = {}
    startedAt.value = Date.now()
    settled.value = false
    expired.value = false
    startClock()
  }

  function restart(): void {
    if (level.value) start(level.value)
  }

  let clockId: number | undefined

  function startClock(): void {
    stopClock()
    clockId = window.setInterval(tick, 1000)
  }

  function stopClock(): void {
    if (clockId !== undefined) {
      window.clearInterval(clockId)
      clockId = undefined
    }
  }

  function tick(): void {
    if (settled.value || !level.value) return
    now.value = Date.now()
    const cfg = level.value
    if (cfg.constraints.interestPerSecPct) {
      balance.value += interestPerSec.value
      const drain = maintenancePerSec.value
      if (drain > 0) balance.value = Math.max(0, balance.value - drain)
    }
    if (
      cfg.timed &&
      now.value >= startedAt.value + (cfg.timeLimitSec ?? 0) * 1000 &&
      balance.value > 0
    ) {
      expired.value = true
      settled.value = true
      stopClock()
    }
  }

  function effectiveMaxQty(p: Product): number {
    if ((p.maxQty ?? 1) === 0) return 0
    if (level.value?.constraints.uniqueOnly) return Math.min(1, p.maxQty ?? 1)
    return p.maxQty ?? Number.POSITIVE_INFINITY
  }

  function isBuyable(p: Product): { ok: boolean; reason?: string } {
    if (!level.value) return { ok: false, reason: '未开始' }
    if ((p.maxQty ?? 1) === 0) return { ok: false, reason: '非卖品' }
    if (level.value.constraints.consumableOnly && !p.consumable)
      return { ok: false, reason: '本关只能买消费品' }
    if ((owned.value[p.id] ?? 0) >= effectiveMaxQty(p))
      return { ok: false, reason: level.value.constraints.uniqueOnly ? '本关每种限购 1 件' : '已达限量' }
    if (balance.value < p.price) return { ok: false, reason: '余额不足' }
    return { ok: true }
  }

  function maxAffordable(p: Product): number {
    const cap = effectiveMaxQty(p) - (owned.value[p.id] ?? 0)
    if (cap <= 0) return 0
    const byBalance = Math.floor(balance.value / p.price)
    return Math.max(0, Math.min(cap, byBalance))
  }

  function buy(id: string, want: number): number {
    const p = PRODUCT_MAP[id]
    if (!p || settled.value) return 0
    const qty = Math.min(want, maxAffordable(p))
    if (qty <= 0) return 0
    const cost = qty * p.price
    balance.value -= cost
    owned.value[id] = (owned.value[id] ?? 0) + qty
    lastPurchaseCost.value = cost
    return qty
  }

  function sell(id: string, qty: number): number {
    const p = PRODUCT_MAP[id]
    if (!p || settled.value) return 0
    const have = owned.value[id] ?? 0
    const n = Math.min(qty, have)
    if (n <= 0) return 0
    balance.value += n * p.price
    if (n === have) delete owned.value[id]
    else owned.value[id] = have - n
    return n
  }

  function buildResult(): LevelResult | null {
    if (!level.value) return null
    return {
      spent: spent.value,
      items: itemCount.value,
      kinds: kinds.value,
      durationMs: Date.now() - startedAt.value,
      clearedAt: Date.now(),
      exactZero: exactZero.value,
    }
  }

  return {
    level,
    balance,
    owned,
    startedAt,
    settled,
    expired,
    lastPurchaseCost,
    initial,
    spent,
    kinds,
    minKinds,
    kindsGoal,
    kindsMet,
    spendRatio,
    spendMet,
    exactZero,
    itemCount,
    cleared,
    timedOut,
    remainingSec,
    elapsedMs,
    topCategories,
    trophyList,
    maintenancePerYear,
    maintenancePerSec,
    interestPerSec,
    start,
    restart,
    stopClock,
    isBuyable,
    maxAffordable,
    effectiveMaxQty,
    buy,
    sell,
    buildResult,
  }
})
