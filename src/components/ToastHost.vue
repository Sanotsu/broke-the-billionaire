<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4">
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-for="t in toast.toasts"
        :key="t.id"
        class="pointer-events-auto flex w-full max-w-xs items-center gap-2.5 rounded-xl border border-gold-600/40 bg-ink-800/95 px-3.5 py-2.5 shadow-lg shadow-black/40 backdrop-blur"
        @click="toast.dismiss(t.id)"
      >
        <span class="text-lg">{{ t.icon }}</span>
        <div class="min-w-0">
          <div class="text-[0.8125rem] font-semibold text-gold-300">成就解锁 · {{ t.name }}</div>
          <div v-if="t.desc" class="truncate text-xs text-paper-300">{{ t.desc }}</div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
