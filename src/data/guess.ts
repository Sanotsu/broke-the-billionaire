import type { Product } from '@/types'
import { PRODUCTS } from '@/data/products'
import { todayKey } from '@/stores/progress'

export interface GuessQuestion {
  a: Product
  b: Product
}

const RELIABLE = PRODUCTS.filter(
  (p) =>
    ['auction', 'retail', 'record'].includes(p.priceBasis) &&
    p.maxQty !== 0 &&
    p.price >= 1000,
)

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function ratioOk(a: Product, b: Product): boolean {
  const r = Math.max(a.price, b.price) / Math.min(a.price, b.price)
  return r >= 1.8 && r <= 100
}

function pickPair(rand: () => number): GuessQuestion {
  const sameCategoryPairs: GuessQuestion[] = []
  const byCat = new Map<string, Product[]>()
  for (const p of RELIABLE) {
    const list = byCat.get(p.category) ?? []
    list.push(p)
    byCat.set(p.category, list)
  }
  for (const list of byCat.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (ratioOk(list[i], list[j])) sameCategoryPairs.push({ a: list[i], b: list[j] })
      }
    }
  }
  if (sameCategoryPairs.length > 0) {
    const idx = Math.floor(rand() * sameCategoryPairs.length)
    return sameCategoryPairs[idx]
  }
  const idxA = Math.floor(rand() * RELIABLE.length)
  let idxB = Math.floor(rand() * RELIABLE.length)
  if (idxB === idxA) idxB = (idxB + 1) % RELIABLE.length
  return { a: RELIABLE[idxA], b: RELIABLE[idxB] }
}

export function buildDailyQuestion(): GuessQuestion {
  return pickPair(mulberry32(hashString(`daily-${todayKey()}`)))
}

export function buildRandomQuestion(): GuessQuestion {
  return pickPair(mulberry32((Math.random() * 4294967296) >>> 0))
}
