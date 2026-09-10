<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  AlertDialogRoot,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from 'reka-ui'
import type { Product, ProductDeepDive } from '@/types'
import { useGameStore } from '@/stores/game'
import { useSettingsStore } from '@/stores/settings'
import { formatMoney, workTimeAnchor } from '@/utils/money'
import { CATEGORY_MAP } from '@/data/categories'
import ProductImage from '@/components/ProductImage.vue'

const DEEP_SECTIONS: { key: keyof ProductDeepDive; icon: string; label: string }[] = [
  { key: 'why', icon: '💰', label: '它为什么贵' },
  { key: 'hardToBuy', icon: '🚫', label: '有钱也未必买得到' },
  { key: 'hiddenCost', icon: '🧾', label: '买完之后还要花多少' },
  { key: 'history', icon: '🏛️', label: '历史与文化' },
  { key: 'trivia', icon: '💡', label: '冷知识' },
]

const props = defineProps<{
  product: Product | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:product': [product: Product | null]
}>()

const game = useGameStore()
const settings = useSettingsStore()
const confirmOpen = ref(false)
const pendingQty = ref(0)

const open = computed({
  get: () => props.product !== null,
  set: (v: boolean) => {
    if (!v) emit('update:product', null)
  },
})

const basisLabel: Record<string, string> = {
  auction: '拍卖成交',
  retail: '官方售价',
  estimate: '估算',
  record: '纪录',
  valuation: '非卖品估值',
}

const LARGE_PURCHASE = 1_000_000_000

function buy(qty: number): void {
  if (!props.product) return
  const capped = Math.min(qty, game.maxAffordable(props.product))
  if (capped <= 0) return
  const cost = capped * props.product.price
  if (cost >= LARGE_PURCHASE && settings.settings.confirmLargePurchase) {
    pendingQty.value = capped
    confirmOpen.value = true
    return
  }
  game.buy(props.product.id, capped)
}

function confirmBuy(): void {
  if (!props.product) return
  game.buy(props.product.id, pendingQty.value)
  confirmOpen.value = false
}

function sellAll(): void {
  if (!props.product) return
  game.sell(props.product.id, Number.POSITIVE_INFINITY)
}

function ownedQty(): number {
  if (!props.product) return 0
  return game.owned[props.product.id] ?? 0
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]" />
      <DialogContent
        class="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-ink-600 bg-ink-900 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none sm:inset-0 sm:mx-auto sm:my-auto sm:h-fit sm:max-h-[86vh] sm:w-[30rem] sm:rounded-2xl sm:border sm:pb-4"
      >
        <div v-if="product" class="mx-auto max-w-2xl px-5 pt-2">
          <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-ink-600" />

          <div class="flex items-start gap-3">
            <div class="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-800">
              <ProductImage :product-id="product.id" :icon="product.icon" :alt="product.name" />
            </div>
            <div class="min-w-0 flex-1">
              <DialogTitle class="text-base font-semibold text-paper-100">
                {{ product.name }}
              </DialogTitle>
              <DialogDescription class="mt-0.5 text-xs text-paper-500">
                {{ CATEGORY_MAP[product.category].name }} · {{ basisLabel[product.priceBasis] }} ·
                {{ product.priceYear }} · {{ product.priceSource }}
              </DialogDescription>
            </div>
          </div>

          <div class="mt-3 flex items-baseline justify-between">
            <span class="tabular text-2xl font-bold text-gold-300">
              {{ formatMoney(product.price, settings.settings.numberFormat) }}
            </span>
            <span v-if="settings.settings.anchorLine" class="text-xs text-paper-500">
              {{ workTimeAnchor(product.price) }}
            </span>
          </div>

          <p v-if="settings.settings.coldFacts" class="mt-3 text-sm leading-relaxed text-paper-300">
            {{ product.blurb }}
          </p>

          <div v-if="settings.settings.perspectives && (product.perspectives?.normal || product.perspectives?.rich)" class="mt-3 grid gap-2 sm:grid-cols-2">
            <div class="rounded-lg bg-ink-800 p-3">
              <div class="text-[0.6875rem] tracking-wider text-paper-500">普通人视角</div>
              <div class="mt-1 text-[0.8125rem] leading-relaxed text-paper-300">
                {{ product.perspectives?.normal }}
              </div>
            </div>
            <div class="rounded-lg bg-ink-800 p-3">
              <div class="text-[0.6875rem] tracking-wider text-paper-500">富豪视角</div>
              <div class="mt-1 text-[0.8125rem] leading-relaxed text-paper-300">
                {{ product.perspectives?.rich }}
              </div>
            </div>
          </div>

          <div
            v-if="settings.settings.deepDive && product.deepDive"
            class="mt-3 space-y-2.5 rounded-lg border border-gold-600/30 bg-gold-600/5 p-3"
          >
            <div class="text-[0.6875rem] tracking-wider text-gold-500">深度科普</div>
            <template v-for="section in DEEP_SECTIONS" :key="section.key">
              <div v-if="product.deepDive?.[section.key]">
                <div class="text-xs font-semibold text-paper-100">
                  {{ section.icon }} {{ section.label }}
                </div>
                <p class="mt-0.5 text-[0.8125rem] leading-relaxed text-paper-300">
                  {{ product.deepDive?.[section.key] }}
                </p>
              </div>
            </template>
          </div>

          <div v-if="product.maintenancePerYear" class="mt-3 text-xs text-paper-500">
            年维护费约 {{ formatMoney(product.maintenancePerYear, 'abbrev') }}——买得起，更要养得起。
          </div>

          <div v-if="!readonly" class="mt-4 grid grid-cols-4 gap-2 pb-2">
            <button
              type="button"
              class="rounded-lg bg-ink-700 py-2 text-xs text-paper-300 transition enabled:hover:bg-ink-600 disabled:opacity-30"
              :disabled="ownedQty() === 0"
              @click="sellAll"
            >
              全部卖出
            </button>
            <button
              type="button"
              class="rounded-lg bg-gold-600 py-2 text-xs font-medium text-ink-950 transition enabled:hover:bg-gold-500 disabled:opacity-30"
              :disabled="!game.isBuyable(product).ok"
              @click="buy(1)"
            >
              买 1 件
            </button>
            <button
              type="button"
              class="rounded-lg bg-gold-600 py-2 text-xs font-medium text-ink-950 transition enabled:hover:bg-gold-500 disabled:opacity-30"
              :disabled="!game.isBuyable(product).ok"
              @click="buy(10)"
            >
              买 10 件
            </button>
            <button
              type="button"
              class="rounded-lg bg-gold-600 py-2 text-xs font-medium text-ink-950 transition enabled:hover:bg-gold-500 disabled:opacity-30"
              :disabled="!game.isBuyable(product).ok"
              @click="buy(game.maxAffordable(product))"
            >
              Max
            </button>
          </div>
          <div v-else class="h-2" />
        </div>
      </DialogContent>

      <AlertDialogRoot v-model:open="confirmOpen">
        <AlertDialogPortal>
          <AlertDialogOverlay class="fixed inset-0 z-[60] bg-black/70" />
          <AlertDialogContent
            class="fixed left-1/2 top-1/2 z-[61] w-[min(92vw,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gold-600/40 bg-ink-900 p-5 outline-none"
          >
            <AlertDialogTitle class="text-center text-base font-bold text-gold-300">
              确认这笔大额消费？
            </AlertDialogTitle>
            <AlertDialogDescription class="mt-2 text-center text-[0.8125rem] leading-relaxed text-paper-300">
              即将购入「{{ product?.name }}」×{{ pendingQty }}，<br />
              合计
              <span class="tabular font-bold text-gold-300">
                {{ formatMoney((product?.price ?? 0) * pendingQty, 'abbrev') }}
              </span>。
            </AlertDialogDescription>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <AlertDialogCancel
                class="cursor-pointer rounded-xl bg-ink-700 py-2 text-xs text-paper-300 transition hover:bg-ink-600"
              >
                再想想
              </AlertDialogCancel>
              <AlertDialogAction
                class="cursor-pointer rounded-xl bg-gold-600 py-2 text-xs font-semibold text-ink-950 transition hover:bg-gold-500"
                @click="confirmBuy"
              >
                买！
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialogRoot>
    </DialogPortal>
  </DialogRoot>
</template>
