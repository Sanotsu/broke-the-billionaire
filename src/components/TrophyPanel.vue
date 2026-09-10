<script setup lang="ts">
import { computed } from 'vue'
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
import { formatMoney } from '@/utils/money'
import ProductImage from '@/components/ProductImage.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
}>()

const game = useGameStore()
const settings = useSettingsStore()

const openModel = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

const entries = computed(() => game.trophyList)
const moneyMode = computed(() => settings.settings.numberFormat)
</script>

<template>
  <DialogRoot v-model:open="openModel">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]" />
      <DialogContent
        class="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-ink-600 bg-ink-900 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none sm:inset-0 sm:mx-auto sm:my-auto sm:h-fit sm:max-h-[80vh] sm:w-[30rem] sm:rounded-2xl sm:border sm:pb-4"
      >
        <div class="mx-auto max-w-2xl px-5 pt-2">
          <div class="mx-auto mb-2 h-1 w-10 rounded-full bg-ink-600" />
          <DialogTitle class="flex items-baseline justify-between">
            <span class="text-base font-semibold text-paper-100">🏆 我的战利品</span>
            <span class="tabular text-xs text-paper-500">
              {{ game.itemCount }} 件 · {{ game.kinds }} 种
            </span>
          </DialogTitle>
          <DialogDescription class="mt-1 text-xs text-paper-500">
            已花掉 {{ formatMoney(game.spent, moneyMode) }} · 全部可原价卖出
          </DialogDescription>

          <div v-if="entries.length === 0" class="py-10 text-center text-sm text-paper-500">
            还什么都没买——先去逛逛吧
          </div>

          <ul v-else class="mt-3 divide-y divide-ink-700">
            <li v-for="entry in entries" :key="entry.product.id" class="flex items-center gap-3 py-2.5">
              <div class="h-9 w-9 shrink-0">
                <ProductImage :product-id="entry.product.id" :icon="entry.product.icon" :alt="entry.product.name" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="truncate text-sm text-paper-100">{{ entry.product.name }}</div>
                <div class="tabular text-xs text-paper-500">
                  单价 {{ formatMoney(entry.product.price, 'abbrev') }}
                </div>
              </div>
              <div class="tabular text-right">
                <div class="text-sm font-medium text-gold-300">
                  ×{{ entry.qty }}
                </div>
                <div class="text-xs text-paper-500">
                  {{ formatMoney(entry.subtotal, 'abbrev') }}
                </div>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg bg-ink-700 px-2 py-1.5 text-xs text-paper-300 transition hover:bg-ink-600"
                @click="game.sell(entry.product.id, entry.qty)"
              >
                全卖
              </button>
            </li>
          </ul>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
