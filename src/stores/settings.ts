import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { InfoPreset, Settings } from '@/types'
import { loadJson, saveJson, shallowMerge } from '@/utils/storage'

const STORAGE_KEY = 'btb-settings-v1'

export const DEFAULT_SETTINGS: Settings = {
  infoPreset: 'immersive',
  anchorLine: true,
  coldFacts: true,
  perspectives: true,
  deepDive: true,
  narrativeEnding: true,
  numberFormat: 'full',
  confirmLargePurchase: true,
  fontSize: 'normal',
}

export const PRESET_OVERRIDES: Record<InfoPreset, Partial<Settings>> = {
  minimal: {
    anchorLine: false,
    coldFacts: false,
    perspectives: false,
    deepDive: false,
    narrativeEnding: false,
  },
  standard: {
    anchorLine: true,
    coldFacts: true,
    perspectives: false,
    deepDive: false,
    narrativeEnding: false,
  },
  immersive: {
    anchorLine: true,
    coldFacts: true,
    perspectives: true,
    deepDive: true,
    narrativeEnding: true,
  },
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>(
    loadJson(STORAGE_KEY, DEFAULT_SETTINGS, (raw, base) => shallowMerge(raw, base)),
  )

  watch(
    settings,
    (v) => saveJson(STORAGE_KEY, v),
    { deep: true },
  )

  function setPreset(preset: InfoPreset): void {
    settings.value = { ...settings.value, ...PRESET_OVERRIDES[preset], infoPreset: preset }
  }

  function patch(partial: Partial<Settings>): void {
    settings.value = { ...settings.value, ...partial }
  }

  function reset(): void {
    settings.value = { ...DEFAULT_SETTINGS }
  }

  return { settings, setPreset, patch, reset }
})
