<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import ProductDrawer from '@/components/ProductDrawer.vue'
import ProductImage from '@/components/ProductImage.vue'
import type { Product } from '@/types'
import { CATEGORIES } from '@/data/categories'
import { PRODUCTS } from '@/data/products'
import { useProgressStore } from '@/stores/progress'
import { useSettingsStore } from '@/stores/settings'
import { formatMoney } from '@/utils/money'

const progress = useProgressStore()
const settings = useSettingsStore()
const drawerProduct = ref<Product | null>(null)

function ownCount(id: string): number {
  return progress.save.owned[id] ?? 0
}

function openDetail(product: Product): void {
  drawerProduct.value = product
  progress.markSeen(product.id)
}
</script>

<template>
  <div class="min-h-dvh">
    <AppHeader title="财富博物馆" />
    <main class="mx-auto max-w-3xl px-4 py-5">
      <div class="rounded-xl border border-ink-600 bg-ink-800 p-4">
        <div class="text-sm font-semibold text-gold-300">
          收集进度 {{ progress.collectionCount }} / {{ PRODUCTS.length }}
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-700">
          <div
            class="h-full rounded-full bg-gradient-to-r from-gold-600 to-gold-300"
            :style="{ width: `${(progress.collectionCount / PRODUCTS.length) * 100}%` }"
          />
        </div>
        <div class="mt-2 text-xs text-paper-500">
          花钱的过程，也是参观的过程。点击展品了解它背后的故事。
        </div>
      </div>

      <section v-for="cat in CATEGORIES" :key="cat.id" class="mt-6">
        <h2 class="mb-2 flex items-center gap-2 text-sm font-semibold text-paper-100">
          <span>{{ cat.icon }}</span>{{ cat.name }}
          <span class="text-xs font-normal text-paper-500">
            {{ PRODUCTS.filter((p) => p.category === cat.id && ownCount(p.id) > 0).length }} /
            {{ PRODUCTS.filter((p) => p.category === cat.id).length }}
          </span>
        </h2>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button
            v-for="product in PRODUCTS.filter((p) => p.category === cat.id)"
            :key="product.id"
            type="button"
            class="rounded-xl border p-3 text-left transition hover:border-gold-600/50"
            :class="ownCount(product.id) > 0 ? 'border-ink-600 bg-ink-800' : 'border-ink-700 bg-ink-900 opacity-70'"
            @click="openDetail(product)"
          >
            <div class="flex items-start justify-between">
              <div class="h-9 w-9" :class="ownCount(product.id) === 0 ? 'opacity-40 grayscale' : ''">
                <ProductImage :product-id="product.id" :icon="product.icon" :alt="product.name" />
              </div>
              <span
                v-if="product.maxQty === 0"
                class="rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[0.6875rem] text-purple-300"
              >
                非卖品
              </span>
              <span
                v-else-if="ownCount(product.id) > 0"
                class="tabular rounded-full bg-gold-600/15 px-1.5 py-0.5 text-[0.6875rem] text-gold-300"
              >
                ×{{ ownCount(product.id) }}
              </span>
              <span v-else class="rounded-full bg-ink-700 px-1.5 py-0.5 text-[0.6875rem] text-paper-500">未收藏</span>
            </div>
            <div class="mt-1.5 line-clamp-2 text-[0.8125rem] font-medium leading-snug text-paper-100">
              {{ product.name }}
            </div>
            <div class="tabular mt-1 text-xs text-gold-300">
              {{ formatMoney(product.price, settings.settings.numberFormat) }}
            </div>
          </button>
        </div>
      </section>
    </main>

    <ProductDrawer :product="drawerProduct" readonly @update:product="drawerProduct = $event" />
  </div>
</template>
