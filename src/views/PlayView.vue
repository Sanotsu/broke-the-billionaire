<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { CategoryId, Product } from '@/types'
import GameHUD from '@/components/GameHUD.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductDrawer from '@/components/ProductDrawer.vue'
import SettlementSheet from '@/components/SettlementSheet.vue'
import TrophyPanel from '@/components/TrophyPanel.vue'
import { LEVEL_MAP } from '@/data/levels'
import { PRODUCTS } from '@/data/products'
import { CATEGORIES } from '@/data/categories'
import { evaluateAchievements } from '@/data/achievements'
import { useGameStore } from '@/stores/game'
import { useProgressStore } from '@/stores/progress'
import { useToastStore } from '@/stores/toast'

const props = defineProps<{
  levelId: string
}>()

const router = useRouter()
const game = useGameStore()
const progress = useProgressStore()
const toast = useToastStore()

const activeCategory = ref<CategoryId | 'all'>('all')
const drawerProduct = ref<Product | null>(null)
const settlementOpen = ref(false)
const trophyOpen = ref(false)
const currentPage = ref(1)

const PAGE_SIZE = 12

const level = computed(() => LEVEL_MAP[props.levelId])

const visibleProducts = computed(() => {
  const sorted = [...PRODUCTS].sort((a, b) => a.price - b.price)
  if (game.level?.constraints.consumableOnly) return sorted.filter((p) => p.consumable)
  return sorted
})

const filteredProducts = computed(() =>
  activeCategory.value === 'all'
    ? visibleProducts.value
    : visibleProducts.value.filter((p) => p.category === activeCategory.value),
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProducts.value.length / PAGE_SIZE)),
)

const pagedProducts = computed(() =>
  filteredProducts.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE),
)

watch(activeCategory, () => {
  currentPage.value = 1
})

function goPage(p: number): void {
  currentPage.value = Math.min(Math.max(1, p), totalPages.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function checkAchievements(): void {
  const fresh = evaluateAchievements({ game, progress })
  const granted = progress.grantAchievements(fresh.map((a) => a.id))
  const grantedSet = new Set(granted)
  for (const ach of fresh) {
    if (grantedSet.has(ach.id)) toast.push(ach.icon, ach.name, ach.desc)
  }
}

onMounted(() => {
  if (!level.value || !progress.isUnlocked(level.value.id)) {
    router.replace('/levels')
    return
  }
  if (game.level?.id !== level.value.id) game.start(level.value)
  checkAchievements()
})

onUnmounted(() => {
  game.stopClock()
})

watch(
  () => game.owned,
  () => checkAchievements(),
  { deep: true },
)

watch(
  () => game.cleared,
  (cleared) => {
    if (!cleared || game.settled) return
    game.settled = true
    game.stopClock()
    finishLevel()
  },
)

watch(
  () => game.expired,
  (expired) => {
    if (!expired || settlementOpen.value) return
    settlementOpen.value = true
  },
)

function finishLevel(): void {
  const result = game.buildResult()
  if (result && level.value) {
    progress.recordResult(level.value.id, result)
    progress.syncOwned(game.owned)
    for (const unlockId of level.value.unlocks ?? []) progress.unlock(unlockId)
    if (level.value.next) progress.unlock(level.value.next)
  }
  checkAchievements()
  settlementOpen.value = true
}

function goNext(): void {
  settlementOpen.value = false
  const next = level.value?.next
  if (next) {
    const cfg = LEVEL_MAP[next]
    if (cfg) game.start(cfg)
    router.replace(`/play/${next}`)
  } else {
    router.replace('/levels')
  }
}

function retry(): void {
  settlementOpen.value = false
  game.restart()
}
</script>

<template>
  <div class="min-h-dvh">
    <GameHUD @open-trophy="trophyOpen = true" />

    <main class="mx-auto max-w-3xl px-4 pb-16 pt-3">
      <div class="-mx-4 mb-3 overflow-x-auto px-4">
        <div class="flex w-max gap-2">
          <button
            type="button"
            class="rounded-full px-3 py-1 text-xs whitespace-nowrap transition"
            :class="activeCategory === 'all' ? 'bg-gold-600 text-ink-950 font-medium' : 'bg-ink-800 text-paper-300 hover:bg-ink-700'"
            @click="activeCategory = 'all'"
          >
            全部
          </button>
          <button
            v-for="cat in CATEGORIES"
            :key="cat.id"
            type="button"
            class="rounded-full px-3 py-1 text-xs whitespace-nowrap transition"
            :class="activeCategory === cat.id ? 'bg-gold-600 text-ink-950 font-medium' : 'bg-ink-800 text-paper-300 hover:bg-ink-700'"
            @click="activeCategory = cat.id"
          >
            {{ cat.icon }} {{ cat.name }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        <ProductCard
          v-for="product in pagedProducts"
          :key="product.id"
          :product="product"
          @open="drawerProduct = $event"
        />
      </div>

      <div
        v-if="totalPages > 1"
        class="mt-5 flex items-center justify-center gap-4 pb-2"
      >
        <button
          type="button"
          class="rounded-lg bg-ink-700 px-3.5 py-2 text-sm text-paper-300 transition enabled:hover:bg-ink-600 disabled:opacity-30"
          :disabled="currentPage === 1"
          @click="goPage(currentPage - 1)"
        >
          ‹ 上一页
        </button>
        <span class="tabular text-sm text-paper-300">{{ currentPage }} / {{ totalPages }}</span>
        <button
          type="button"
          class="rounded-lg bg-ink-700 px-3.5 py-2 text-sm text-paper-300 transition enabled:hover:bg-ink-600 disabled:opacity-30"
          :disabled="currentPage === totalPages"
          @click="goPage(currentPage + 1)"
        >
          下一页 ›
        </button>
      </div>
      <div v-else class="h-4" />
    </main>

    <ProductDrawer :product="drawerProduct" @update:product="drawerProduct = $event" />

    <TrophyPanel v-model:open="trophyOpen" />

    <SettlementSheet
      :open="settlementOpen"
      @close="settlementOpen = false"
      @next="goNext"
      @retry="retry"
    />
  </div>
</template>
