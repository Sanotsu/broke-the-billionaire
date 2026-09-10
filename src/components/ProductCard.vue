<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product } from '@/types'
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'
import { formatMoney, workTimeAnchor } from '@/utils/money'
import { CATEGORY_MAP } from '@/data/categories'
import ProductImage from '@/components/ProductImage.vue'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  open: [product: Product]
}>()

const game = useGameStore()
const settings = useSettingsStore()

const shakeKey = ref(0)
const bought = ref(false)

const ownedQty = computed(() => game.owned[props.product.id] ?? 0)
const buyState = computed(() => game.isBuyable(props.product))
const category = computed(() => CATEGORY_MAP[props.product.category])

const cap = computed(() => {
  const c = game.effectiveMaxQty(props.product)
  return Number.isFinite(c) ? c : Number.POSITIVE_INFINITY
})
const showBatchRow = computed(() => cap.value > 1)
const showTen = computed(() => cap.value >= 10)
const showHundred = computed(() => cap.value >= 100)

const priceText = computed(() => formatMoney(props.product.price, settings.settings.numberFormat))
const anchorText = computed(() =>
  settings.settings.anchorLine ? workTimeAnchor(props.product.price) : '',
)

function buyOne(): void {
  const n = game.buy(props.product.id, 1)
  if (n > 0) {
    bought.value = true
    setTimeout(() => (bought.value = false), 250)
  } else {
    shakeKey.value++
  }
}

function buyBatch(mult: number): void {
  const want = mult === -1 ? game.maxAffordable(props.product) : mult
  const n = game.buy(props.product.id, want)
  if (n === 0) shakeKey.value++
  else {
    bought.value = true
    setTimeout(() => (bought.value = false), 250)
  }
}

function sellOne(): void {
  game.sell(props.product.id, 1)
}
</script>

<template>
  <div
    :key="shakeKey"
    class="group flex flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-800 transition"
    :class="[shakeKey ? 'shake' : '', bought ? 'border-gold-600/60' : '']"
  >
    <button
      type="button"
      class="flex flex-1 flex-col items-start gap-1 bg-gradient-to-br p-3 text-left"
      :class="category.gradient"
      @click="emit('open', product)"
    >
      <div class="flex h-12 w-full items-start justify-between">
        <div class="h-10 w-10 shrink-0">
          <ProductImage :product-id="product.id" :icon="product.icon" :alt="product.name" />
        </div>
        <span
          v-if="!buyState.ok && ownedQty === 0"
          class="rounded bg-ink-950/70 px-1.5 py-0.5 text-[0.6875rem] text-paper-500"
        >
          {{ buyState.reason }}
        </span>
      </div>
      <span class="line-clamp-2 text-sm font-medium leading-snug text-paper-100">
        {{ product.name }}
      </span>
      <span class="tabular text-sm font-bold text-gold-300">{{ priceText }}</span>
      <span v-if="anchorText" class="text-xs text-paper-500">{{ anchorText }}</span>
    </button>

    <div class="border-t border-ink-700">
      <div class="flex items-stretch">
        <button
          type="button"
          class="w-9 shrink-0 text-sm text-paper-300 transition enabled:hover:bg-ink-700 disabled:opacity-30"
          :disabled="ownedQty === 0"
          aria-label="卖出一件"
          @click="sellOne"
        >
          −
        </button>
        <span class="tabular flex w-10 items-center justify-center border-x border-ink-700 text-xs text-gold-300">
          {{ ownedQty > 0 ? `×${ownedQty}` : '' }}
        </span>
        <button
          type="button"
          class="flex-1 py-2 text-[0.8125rem] font-medium text-gold-300 transition enabled:hover:bg-ink-700 disabled:opacity-30"
          :disabled="!buyState.ok"
          @click="buyOne"
        >
          买 1 件
        </button>
      </div>
      <div v-if="showBatchRow" class="flex items-stretch border-t border-ink-700/60">
        <button
          v-if="showTen"
          type="button"
          class="flex-1 py-1.5 text-xs text-paper-300 transition enabled:hover:bg-ink-700 disabled:opacity-30"
          :disabled="!buyState.ok"
          @click="buyBatch(10)"
        >
          +10
        </button>
        <button
          v-if="showHundred"
          type="button"
          class="flex-1 py-1.5 text-xs text-paper-300 transition enabled:hover:bg-ink-700 disabled:opacity-30"
          :disabled="!buyState.ok"
          @click="buyBatch(100)"
        >
          +100
        </button>
        <button
          type="button"
          class="flex-1 py-1.5 text-xs text-paper-300 transition enabled:hover:bg-ink-700 disabled:opacity-30"
          :disabled="!buyState.ok"
          @click="buyBatch(-1)"
        >
          Max
        </button>
      </div>
    </div>
  </div>
</template>
