<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import { ACHIEVEMENTS } from '@/data/achievements'
import { useProgressStore } from '@/stores/progress'

const progress = useProgressStore()

const unlocked = (id: string) => progress.save.achievements.includes(id)
const count = ACHIEVEMENTS.filter((a) => unlocked(a.id)).length
</script>

<template>
  <div class="min-h-dvh">
    <AppHeader title="成就" />
    <main class="mx-auto max-w-3xl px-4 py-5">
      <div class="mb-4 flex items-center justify-between rounded-xl border border-ink-600 bg-ink-800 px-4 py-3">
        <span class="text-sm text-paper-300">已解锁</span>
        <span class="tabular text-sm font-bold text-gold-300">{{ count }} / {{ ACHIEVEMENTS.length }}</span>
      </div>

      <div class="grid gap-2 sm:grid-cols-2">
        <div
          v-for="ach in ACHIEVEMENTS"
          :key="ach.id"
          class="flex items-center gap-3 rounded-xl border p-3"
          :class="unlocked(ach.id) ? 'border-gold-600/40 bg-gold-600/5' : 'border-ink-700 bg-ink-900'"
        >
          <span class="text-2xl" :class="unlocked(ach.id) ? '' : 'opacity-30 grayscale'">{{ ach.icon }}</span>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-medium" :class="unlocked(ach.id) ? 'text-gold-300' : 'text-paper-300'">
              {{ unlocked(ach.id) ? ach.name : '？？？' }}
            </div>
            <div class="mt-0.5 text-xs leading-snug text-paper-500">{{ ach.desc }}</div>
          </div>
          <span v-if="unlocked(ach.id)" class="text-[0.6875rem] text-gold-500">✓</span>
        </div>
      </div>
    </main>
  </div>
</template>
