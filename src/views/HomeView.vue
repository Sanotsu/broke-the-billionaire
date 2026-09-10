<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useProgressStore } from '@/stores/progress'
import { PRODUCTS } from '@/data/products'

const router = useRouter()
const progress = useProgressStore()

function start(): void {
  router.push('/levels')
}
</script>

<template>
  <div class="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
    <div class="w-full max-w-sm text-center">
      <div class="text-5xl">💰</div>
      <h1 class="mt-4 text-3xl font-bold tracking-wide text-gold-300">
        花不完，根本花不完
      </h1>
      <p class="mt-2 text-sm text-paper-500">
        你以为的奢侈，只是别人的利息。
      </p>

      <p class="mt-6 text-[0.8125rem] leading-relaxed text-paper-300">
        恭喜你获得一次体验顶级财富的机会。<br />
        目标只有一个：把钱花光。<br />
        你会发现，花钱比你想象的难多了。
      </p>

      <div class="mt-8 space-y-2.5">
        <button
          type="button"
          class="w-full rounded-xl bg-gold-600 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition hover:bg-gold-500"
          @click="start"
        >
          {{ progress.hasProgress ? '继续游戏' : '开始游戏' }}
        </button>
        <div class="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            class="rounded-xl bg-ink-700 py-2.5 text-xs text-paper-300 transition hover:bg-ink-600"
            @click="router.push('/guess')"
          >
            🎯 猜价格{{ progress.dailyGuessDone ? '' : ' · 今日' }}
          </button>
          <button
            type="button"
            class="rounded-xl bg-ink-700 py-2.5 text-xs text-paper-300 transition hover:bg-ink-600"
            @click="router.push('/achievements')"
          >
            🏅 成就
          </button>
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            class="rounded-xl bg-ink-700 py-2.5 text-xs text-paper-300 transition hover:bg-ink-600"
            @click="router.push('/museum')"
          >
            🏛️ 财富博物馆
          </button>
          <button
            type="button"
            class="rounded-xl bg-ink-700 py-2.5 text-xs text-paper-300 transition hover:bg-ink-600"
            @click="router.push('/settings')"
          >
            ⚙️ 设置
          </button>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-center gap-3 text-[0.6875rem] text-paper-500">
        <span>图鉴已收集 {{ progress.collectionCount }} / {{ PRODUCTS.length }}</span>
      </div>

      <p class="mt-6 text-[0.6875rem] leading-relaxed text-ink-500">
        本游戏价格基于公开资料的近似估算，仅用于体验财富数量级，<br />
        不构成任何消费或投资建议。
      </p>
    </div>
  </div>
</template>
