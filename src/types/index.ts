export type PriceBasis = 'auction' | 'retail' | 'estimate' | 'record' | 'valuation'

export type CategoryId =
  | 'daily'
  | 'watch'
  | 'jewelry'
  | 'art'
  | 'car'
  | 'estate'
  | 'vehicle'
  | 'club'
  | 'project'

export interface Category {
  id: CategoryId
  name: string
  icon: string
  gradient: string
}

export interface ProductDeepDive {
  why?: string
  hardToBuy?: string
  hiddenCost?: string
  history?: string
  trivia?: string
}

export interface Product {
  id: string
  name: string
  category: CategoryId
  price: number
  priceBasis: PriceBasis
  priceYear: number
  priceSource: string
  unit?: string
  maxQty?: number
  consumable: boolean
  asset: boolean
  maintenancePerYear?: number
  blurb: string
  perspectives?: { normal?: string; rich?: string }
  deepDive?: ProductDeepDive
  image?: string
  icon: string
}

export type LevelGoal = 'spend-all' | 'exact-zero'

export interface LevelConstraints {
  uniqueOnly?: boolean
  consumableOnly?: boolean
  interestPerSecPct?: number
  timeScaleDaysPerSec?: number
}

export interface LevelConfig {
  id: string
  index: number
  name: string
  subtitle: string
  initial: number
  goal: LevelGoal
  ruleText: string
  ruleDetail?: string[]
  minKinds?: number
  timeLimitSec?: number
  constraints: LevelConstraints
  unlocks?: string[]
  next?: string
  sandbox?: boolean
  timed?: boolean
}

export interface Achievement {
  id: string
  name: string
  desc: string
  icon: string
}

export type InfoPreset = 'minimal' | 'standard' | 'immersive'

export type FontSize = 'normal' | 'large'

export interface Settings {
  infoPreset: InfoPreset
  anchorLine: boolean
  coldFacts: boolean
  perspectives: boolean
  deepDive: boolean
  narrativeEnding: boolean
  numberFormat: 'full' | 'abbrev'
  confirmLargePurchase: boolean
  fontSize: FontSize
}

export interface LevelResult {
  spent: number
  items: number
  kinds: number
  durationMs: number
  clearedAt: number
  exactZero: boolean
}

export interface GuessStats {
  lastDate: string
  streak: number
  bestStreak: number
  totalPlayed: number
  totalCorrect: number
}

export interface SaveData {
  version: number
  unlockedLevels: string[]
  results: Record<string, LevelResult>
  owned: Record<string, number>
  achievements: string[]
  seenProducts: string[]
  guess: GuessStats
  guidedImmersive: boolean
}
