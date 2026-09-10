<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from 'reka-ui'
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'
import { useProgressStore } from '@/stores/progress'
import { formatMoney, schoolAnchor } from '@/utils/money'
import { formatDuration } from '@/composables/useCountUp'
import { renderSettlementCard } from '@/utils/shareCard'
import { PRODUCTS } from '@/data/products'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  next: []
  retry: []
}>()

const game = useGameStore()
const settings = useSettingsStore()
const progress = useProgressStore()

const shareImg = ref('')

const openModel = computed({
  get: () => props.open,
  set: (v: boolean) => {
    if (!v) emit('close')
  },
})

const hasNext = computed(() => Boolean(game.level?.next))
const moneyMode = computed(() => settings.settings.numberFormat)
const durationText = computed(() => formatDuration(game.elapsedMs))

const isTimed = computed(() => game.level?.timed ?? false)
const isFinalLevel = computed(() => game.level?.id === 'l5')
const resultTitle = computed(() => {
  if (isTimed.value) return game.exactZero ? '满分！全花光了！' : '时间到！'
  return game.exactZero ? '一分不剩！' : '花光了！'
})
const finalLevelEasterEgg = computed(() =>
  '你刚刚花光了 $4000 亿。而现实中，首富睡一觉的 8 小时里，账面就可能涨回 1000 亿——比你的一切努力加起来还多。',
)

const shareText = computed(() =>
  `我在《花不完，根本花不完》${game.level?.name ?? ''}花光了 ${formatMoney(game.initial, 'abbrev')}，用了 ${durationText.value}，买了 ${game.itemCount} 件商品。`,
)

const showImmersiveGuide = computed(() => {
  if (game.level?.id !== 'l5' || progress.save.guidedImmersive) return false
  const seen = progress.save.seenProducts.length / PRODUCTS.length
  const collected = progress.collectionCount / PRODUCTS.length
  return seen >= 0.3 || collected >= 0.5
})

function enableImmersive(): void {
  settings.setPreset('immersive')
  progress.markGuided()
}

function generateCard(): void {
  shareImg.value = renderSettlementCard({
    levelName: `${game.level?.name ?? ''} · ${game.level?.subtitle ?? ''}`,
    spent: game.spent,
    items: game.itemCount,
    kinds: game.kinds,
    durationText: durationText.value,
    topCategories: game.topCategories.map((c) => ({ name: c.name, amount: c.amount })),
    exactZero: game.exactZero,
  })
}

function downloadCard(): void {
  if (!shareImg.value) return
  const a = document.createElement('a')
  a.href = shareImg.value
  a.download = '花不完战报.png'
  a.click()
}

async function copyShare(): Promise<void> {
  try {
    await navigator.clipboard.writeText(shareText.value)
  } catch {
    /* clipboard unavailable */
  }
}
</script>

<template>
  <DialogRoot v-model:open="openModel">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/70" />
      <DialogContent class="fixed left-1/2 top-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gold-600/40 bg-ink-900 p-5 outline-none">
        <DialogTitle class="text-center text-lg font-bold text-gold-300">
          {{ resultTitle }}
        </DialogTitle>
        <DialogDescription class="mt-1 text-center text-xs text-paper-500">
          {{ game.level?.name }} · {{ game.level?.ruleText }}
        </DialogDescription>

        <div
          v-if="isTimed && !game.exactZero"
          class="mt-3 rounded-lg bg-ink-800 p-3 text-center"
        >
          <span class="tabular text-2xl font-bold text-gold-300">
            {{ (game.spendRatio * 100).toFixed(1) }}%
          </span>
          <span class="ml-1 text-xs text-paper-500">已花掉</span>
        </div>

        <div v-if="game.exactZero && !isTimed" class="mt-2 rounded-full bg-gold-600/15 py-1 text-center text-xs font-medium text-gold-300">
          🏅 荣誉达成：余额精确归零
        </div>

        <div
          v-if="isFinalLevel"
          class="mt-3 rounded-lg border border-ink-500 bg-ink-950/60 p-3 text-center text-[0.8125rem] leading-relaxed text-paper-300"
        >
          {{ finalLevelEasterEgg }}
        </div>

        <div class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-paper-500">花费总额</span>
            <span class="tabular font-bold text-gold-300">{{ formatMoney(game.spent, moneyMode) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-paper-500">商品件数 / 种类</span>
            <span class="tabular text-paper-100">{{ game.itemCount }} 件 / {{ game.kinds }} 种</span>
          </div>
          <div class="flex justify-between">
            <span class="text-paper-500">用时</span>
            <span class="tabular text-paper-100">{{ formatDuration(Date.now() - game.startedAt) }}</span>
          </div>
        </div>

        <div class="mt-4 rounded-lg bg-ink-800 p-3">
          <div class="text-[0.6875rem] tracking-wider text-paper-500">消费结构</div>
          <div v-for="c in game.topCategories.slice(0, 3)" :key="c.id" class="mt-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-paper-300">{{ c.name }}</span>
              <span class="tabular text-paper-500">{{ formatMoney(c.amount, 'abbrev') }}</span>
            </div>
            <div class="mt-0.5 h-1 overflow-hidden rounded-full bg-ink-700">
              <div
                class="h-full rounded-full bg-gold-500"
                :style="{ width: `${game.spent > 0 ? (c.amount / game.spent) * 100 : 0}%` }"
              />
            </div>
          </div>
          <div class="mt-2 text-xs text-paper-500">{{ schoolAnchor(game.spent) }}</div>
        </div>

        <div class="mt-3 rounded-lg bg-ink-800 p-3">
          <div class="text-[0.6875rem] tracking-wider text-paper-500">消费清单（按金额排序）</div>
          <div
            v-for="entry in game.trophyList.slice(0, 5)"
            :key="entry.product.id"
            class="mt-1.5 flex items-center justify-between gap-2 text-xs"
          >
            <span class="truncate text-paper-300">{{ entry.product.icon }} {{ entry.product.name }} ×{{ entry.qty }}</span>
            <span class="tabular shrink-0 text-paper-500">{{ formatMoney(entry.subtotal, 'abbrev') }}</span>
          </div>
          <div v-if="game.trophyList.length > 5" class="mt-1 text-[0.6875rem] text-paper-500">
            …等共 {{ game.kinds }} 种 {{ game.itemCount }} 件
          </div>
        </div>

        <div v-if="settings.settings.narrativeEnding" class="mt-3 rounded-lg border border-gold-600/30 bg-gold-600/5 p-3 text-[0.8125rem] leading-relaxed text-paper-300">
          <template v-if="game.kinds <= 3">你把几乎所有的钱砸在了同一种东西上——专注，也是一种人生态度。</template>
          <template v-else-if="(game.topCategories[0]?.amount ?? 0) / Math.max(1, game.spent) > 0.7">你的消费高度集中于一个类别：{{ game.topCategories[0]?.name }}。收藏家人格觉醒。</template>
          <template v-else>你的购物车横跨 {{ game.kinds }} 个类别——世界很大，你都想要看看。</template>
        </div>

        <div
          v-if="showImmersiveGuide"
          class="mt-3 rounded-xl border border-gold-600/40 bg-gold-600/5 p-3"
        >
          <div class="text-[0.8125rem] leading-relaxed text-paper-300">
            你对这 {{ PRODUCTS.length }} 件商品的了解已经超过大多数人。要开启
            <span class="font-semibold text-gold-300">沉浸模式</span>，看看每件商品背后的双视角与深度科普吗？
          </div>
          <div class="mt-2 flex gap-2">
            <button
              type="button"
              class="flex-1 rounded-lg bg-gold-600 py-1.5 text-[0.8125rem] font-semibold text-ink-950 transition hover:bg-gold-500"
              @click="enableImmersive"
            >
              开启沉浸模式
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg bg-ink-700 py-1.5 text-[0.8125rem] text-paper-300 transition hover:bg-ink-600"
              @click="progress.markGuided()"
            >
              下次再说
            </button>
          </div>
        </div>

        <div v-if="shareImg" class="mt-3">
          <img :src="shareImg" alt="分享战报" class="w-full rounded-xl border border-ink-600" />
          <button
            type="button"
            class="mt-2 w-full rounded-xl bg-ink-700 py-2 text-xs text-paper-300 transition hover:bg-ink-600"
            @click="downloadCard"
          >
            保存图片
          </button>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <button
            v-if="hasNext"
            type="button"
            class="col-span-2 rounded-xl bg-gold-600 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-500"
            @click="emit('next')"
          >
            下一关 →
          </button>
          <button
            type="button"
            class="rounded-xl bg-ink-700 py-2 text-xs text-paper-300 transition hover:bg-ink-600"
            @click="emit('retry')"
          >
            再玩一次
          </button>
          <button
            type="button"
            class="rounded-xl bg-ink-700 py-2 text-xs text-paper-300 transition hover:bg-ink-600"
            @click="generateCard"
          >
            生成分享图
          </button>
        </div>
        <button
          type="button"
          class="mt-2 w-full py-1 text-xs text-paper-500 transition hover:text-paper-300"
          @click="copyShare"
        >
          或复制文字战报
        </button>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
