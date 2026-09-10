import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { LevelResult, SaveData } from '@/types'
import { INITIAL_LEVEL } from '@/data/levels'
import { loadJson, saveJson, shallowMerge } from '@/utils/storage'

const STORAGE_KEY = 'btb-save-v1'
const SAVE_VERSION = 1

const DEFAULT_SAVE: SaveData = {
  version: SAVE_VERSION,
  unlockedLevels: [INITIAL_LEVEL],
  results: {},
  owned: {},
  achievements: [],
  seenProducts: [],
  guess: { lastDate: '', streak: 0, bestStreak: 0, totalPlayed: 0, totalCorrect: 0 },
  guidedImmersive: false,
}

export function todayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function migrate(raw: unknown, base: SaveData): SaveData {
  const merged = shallowMerge(raw, base)
  if (merged.version !== SAVE_VERSION) {
    merged.version = SAVE_VERSION
    if (!merged.unlockedLevels.includes(INITIAL_LEVEL)) merged.unlockedLevels.push(INITIAL_LEVEL)
  }
  merged.unlockedLevels = Array.from(new Set(merged.unlockedLevels))
  return merged
}

export const useProgressStore = defineStore('progress', () => {
  const save = ref<SaveData>(loadJson(STORAGE_KEY, DEFAULT_SAVE, migrate))

  function persist(): void {
    saveJson(STORAGE_KEY, save.value)
  }

  function isUnlocked(levelId: string): boolean {
    return save.value.unlockedLevels.includes(levelId)
  }

  function unlock(levelId: string): void {
    if (!save.value.unlockedLevels.includes(levelId)) {
      save.value.unlockedLevels.push(levelId)
      persist()
    }
  }

  function recordResult(levelId: string, result: LevelResult): void {
    const prev = save.value.results[levelId]
    if (!prev || result.spent > prev.spent) save.value.results[levelId] = result
    persist()
  }

  function syncOwned(owned: Record<string, number>): void {
    for (const [id, qty] of Object.entries(owned)) {
      save.value.owned[id] = (save.value.owned[id] ?? 0) + qty
    }
    persist()
  }

  function markSeen(productId: string): void {
    if (!save.value.seenProducts.includes(productId)) {
      save.value.seenProducts.push(productId)
      persist()
    }
  }

  function recordGuess(correct: boolean): void {
    const g = save.value.guess
    g.totalPlayed++
    if (correct) {
      g.totalCorrect++
      g.streak++
      if (g.streak > g.bestStreak) g.bestStreak = g.streak
    } else {
      g.streak = 0
    }
    persist()
  }

  function markDailyGuessDone(): void {
    save.value.guess.lastDate = todayKey()
    persist()
  }

  function markGuided(): void {
    save.value.guidedImmersive = true
    persist()
  }

  const dailyGuessDone = computed(() => save.value.guess.lastDate === todayKey())

  function resetAll(): void {
    save.value = JSON.parse(JSON.stringify(DEFAULT_SAVE))
    persist()
  }

  const collectionCount = computed(() => Object.keys(save.value.owned).length)
  const totalSpentAllTime = computed(() =>
    Object.values(save.value.results).reduce((s, r) => s + r.spent, 0),
  )
  const hasProgress = computed(() => Object.keys(save.value.results).length > 0)

  function grantAchievements(ids: string[]): string[] {
    const fresh = ids.filter((id) => !save.value.achievements.includes(id))
    if (fresh.length > 0) {
      save.value.achievements.push(...fresh)
      persist()
    }
    return fresh
  }

  return {
    save,
    persist,
    isUnlocked,
    unlock,
    recordResult,
    syncOwned,
    markSeen,
    recordGuess,
    markDailyGuessDone,
    markGuided,
    dailyGuessDone,
    resetAll,
    grantAchievements,
    collectionCount,
    totalSpentAllTime,
    hasProgress,
  }
})
