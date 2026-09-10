<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'
import { formatMoney, logProgress } from '@/utils/money'
import { useCountUp, formatDuration } from '@/composables/useCountUp'

const emit = defineEmits<{
  openTrophy: []
}>()

const router = useRouter()
const game = useGameStore()
const settings = useSettingsStore()

const displayBalance = useCountUp(() => game.balance)

const moneyMode = computed(() => settings.settings.numberFormat)
const balanceText = computed(() => formatMoney(displayBalance.value, moneyMode.value))
const goalText = computed(() => formatMoney(game.initial, 'abbrev'))

const progress = computed(() => logProgress(game.balance, game.initial))
const elapsed = computed(() => formatDuration(game.elapsedMs))

const timerClass = computed(() => {
  const sec = game.remainingSec
  if (sec === null) return ''
  return sec <= 10 ? 'text-red-400 animate-pulse' : 'text-gold-300'
})

const spendChip = computed(() => {
  if (game.spendRatio < 0)
    return { ok: false, text: `资产增值中 +${(-game.spendRatio * 100).toFixed(1)}%` }
  return game.spendMet
    ? { ok: true, text: `✓ 已花 ${(game.spendRatio * 100).toFixed(1)}%` }
    : { ok: false, text: `已花 ${(game.spendRatio * 100).toFixed(1)}% / 99.9%` }
})

const kindsChip = computed(() =>
  game.minKinds === 0
    ? null
    : game.kindsMet
      ? { ok: true, text: `✓ ${game.kinds} 种商品` }
      : { ok: false, text: `${game.kinds} / ${game.kindsGoal} 种商品` },
)

function onRestart(): void {
  game.restart()
}
</script>

<template>
  <div v-if="game.level" class="sticky top-0 z-20 border-b border-ink-700 bg-ink-950/95 backdrop-blur">
    <div class="mx-auto max-w-3xl px-4 pt-3 pb-2">
      <div class="flex items-start justify-between gap-2">
        <div class="flex min-w-0 items-start gap-2.5">
          <button
            type="button"
            class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-700 text-base text-paper-300 transition hover:bg-ink-600"
            aria-label="返回选关"
            @click="router.push('/levels')"
          >
            ←
          </button>
          <div class="min-w-0">
            <div class="text-xs tracking-wider text-paper-500">
              第 {{ game.level.index }} 关 · {{ game.level.name }} · 目标 {{ goalText }}
            </div>
            <div class="tabular text-2xl font-bold text-gold-300 sm:text-3xl">
              {{ balanceText }}
            </div>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="rounded-md bg-gold-600/15 px-2 py-1 text-xs text-gold-300 transition hover:bg-gold-600/25"
              @click="emit('openTrophy')"
            >
              🏆 {{ game.itemCount }}
            </button>
            <button
              type="button"
              class="rounded-md bg-ink-700 px-2 py-1 text-xs text-paper-300 transition hover:bg-ink-600"
              @click="onRestart"
            >
              ↻ 重开
            </button>
          </div>
          <span
            v-if="game.remainingSec !== null"
            class="tabular text-lg font-bold"
            :class="timerClass"
          >
            {{ game.remainingSec }}s
          </span>
          <span v-else class="tabular text-xs text-paper-500">{{ elapsed }}</span>
        </div>
      </div>

      <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div
          class="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300 transition-all duration-500"
          :style="{ width: `${progress * 100}%` }"
        />
      </div>

      <div class="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
        <span
          class="rounded-full px-2 py-0.5"
          :class="spendChip.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-ink-800 text-paper-300'"
        >
          {{ spendChip.text }}
        </span>
        <span
          v-if="kindsChip"
          class="rounded-full px-2 py-0.5"
          :class="kindsChip.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-ink-800 text-paper-300'"
        >
          {{ kindsChip.text }}
        </span>
        <span class="ml-auto hidden truncate rounded-full bg-ink-800 px-2 py-0.5 text-paper-500 sm:inline">
          📋 {{ game.level.ruleText }}
        </span>
      </div>

      <div
        v-if="game.spendMet && !game.kindsMet"
        class="mt-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1.5 text-xs leading-relaxed text-amber-300"
      >
        钱已基本花光，但商品种类不足（还差 {{ game.kindsGoal - game.kinds }} 种）。
        从 🏆 战利品卖出部分商品腾出预算，多买几种便宜的即可过关。
      </div>

      <div
        v-if="game.level?.constraints.interestPerSecPct"
        class="mt-1.5 flex items-center gap-2 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300"
      >
        <span class="animate-pulse">📈</span>
        <span>
          利息 +{{ formatMoney(game.interestPerSec, 'abbrev') }}/秒
          <template v-if="game.maintenancePerSec > 0">
            · 维护费 -{{ formatMoney(game.maintenancePerSec, 'abbrev') }}/秒
          </template>
        </span>
      </div>
    </div>
  </div>
</template>
