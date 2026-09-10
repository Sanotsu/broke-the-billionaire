<script setup lang="ts">
import { computed, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ProductImage from '@/components/ProductImage.vue'
import type { Product } from '@/types'
import { buildDailyQuestion, buildRandomQuestion, type GuessQuestion } from '@/data/guess'
import { CATEGORY_MAP } from '@/data/categories'
import { useProgressStore } from '@/stores/progress'
import { useSettingsStore } from '@/stores/settings'
import { evaluateAchievements } from '@/data/achievements'
import { useGameStore } from '@/stores/game'
import { useToastStore } from '@/stores/toast'
import { formatMoney } from '@/utils/money'

const progress = useProgressStore()
const settings = useSettingsStore()
const game = useGameStore()
const toast = useToastStore()

const question = ref<GuessQuestion>(
  progress.dailyGuessDone ? buildRandomQuestion() : buildDailyQuestion(),
)
const picked = ref<Product | null>(null)
const isDaily = ref(!progress.dailyGuessDone)

const revealed = computed(() => picked.value !== null)

const correct = computed(() => {
  if (!picked.value) return false
  const { a, b } = question.value
  return a.price > b.price ? picked.value === a : picked.value === b
})

const guess = computed(() => progress.save.guess)
const accuracy = computed(() =>
  guess.value.totalPlayed > 0
    ? Math.round((guess.value.totalCorrect / guess.value.totalPlayed) * 100)
    : 0,
)

function pick(p: Product): void {
  if (revealed.value) return
  picked.value = p
  const isCorrect = aHigher() ? p === question.value.a : p === question.value.b
  progress.recordGuess(isCorrect)
  if (isDaily.value) {
    progress.markDailyGuessDone()
    isDaily.value = false
  }
  const fresh = evaluateAchievements({ game, progress })
  const granted = progress.grantAchievements(fresh.map((a) => a.id))
  const grantedSet = new Set(granted)
  for (const ach of fresh) {
    if (grantedSet.has(ach.id)) toast.push(ach.icon, ach.name, ach.desc)
  }
}

function aHigher(): boolean {
  return question.value.a.price > question.value.b.price
}

function next(): void {
  question.value = buildRandomQuestion()
  picked.value = null
}
</script>

<template>
  <div class="min-h-dvh">
    <AppHeader title="猜价格" />
    <main class="mx-auto max-w-xl px-4 py-5">
      <div class="mb-4 flex items-center justify-between text-xs">
        <span class="rounded-full px-2.5 py-1" :class="isDaily ? 'bg-gold-600/15 text-gold-300' : 'bg-ink-800 text-paper-300'">
          {{ isDaily ? '🌅 每日一题' : '🎯 练习模式' }}
        </span>
        <span class="tabular text-paper-500">
          🔥 连击 {{ guess.streak }} · 最佳 {{ guess.bestStreak }} · 正确率 {{ accuracy }}%
        </span>
      </div>

      <div class="grid grid-cols-2 items-stretch gap-3">
        <button
          v-for="side in (['a', 'b'] as const)"
          :key="side"
          type="button"
          class="flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition"
          :class="[
            revealed
              ? picked === question[side]
                ? correct
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-red-500 bg-red-500/10'
                : 'border-ink-600 bg-ink-900 opacity-60'
              : 'border-ink-600 bg-ink-800 hover:border-gold-600/60 active:scale-[0.98]',
          ]"
          :disabled="revealed"
          @click="pick(question[side])"
        >
          <div class="h-14 w-14">
            <ProductImage :product-id="question[side].id" :icon="question[side].icon" :alt="question[side].name" />
          </div>
          <span class="text-sm font-medium leading-snug text-paper-100">
            {{ question[side].name }}
          </span>
          <span class="text-[0.6875rem] text-paper-500">{{ CATEGORY_MAP[question[side].category].name }}</span>
          <span v-if="revealed" class="tabular mt-1 text-base font-bold" :class="picked === question[side] ? 'text-paper-100' : 'text-gold-300'">
            {{ formatMoney(question[side].price, settings.settings.numberFormat) }}
          </span>
          <span v-else class="mt-1 text-xs text-paper-500">猜猜价格？</span>
        </button>
      </div>

      <div v-if="revealed" class="mt-4">
        <div class="rounded-xl border border-ink-600 bg-ink-800 p-4 text-center">
          <div class="text-base font-bold" :class="correct ? 'text-emerald-400' : 'text-red-400'">
            {{ correct ? '🎯 答对了！' : '😱 居然是反的！' }}
          </div>
          <p class="mt-2 text-[0.8125rem] leading-relaxed text-paper-300">
            {{ (aHigher() ? question.a : question.b).blurb }}
          </p>
          <div class="mt-2 text-[0.6875rem] text-paper-500">
            价格依据：{{ (aHigher() ? question.a : question.b).priceSource }}（{{ (aHigher() ? question.a : question.b).priceYear }}）
          </div>
        </div>
        <button
          type="button"
          class="mt-3 w-full rounded-xl bg-gold-600 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-500"
          @click="next"
        >
          下一对 →
        </button>
      </div>

      <p class="mt-6 text-center text-xs leading-relaxed text-paper-500">
        全部价格来自拍卖成交记录与官方售价。<br />
        认知偏差被戳中的那一刻，就是涨见识的时候。
      </p>
    </main>
  </div>
</template>
