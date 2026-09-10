<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  title: string
  backTo?: string
}>()

const router = useRouter()

function goBack(): void {
  if (props.backTo) router.push(props.backTo)
  else router.push('/')
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-ink-700 bg-ink-950/90 backdrop-blur">
    <div class="mx-auto flex h-12 max-w-3xl items-center gap-3 px-4">
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-700 text-paper-300 transition hover:bg-ink-600"
        aria-label="返回"
        @click="goBack"
      >
        ←
      </button>
      <h1 class="text-sm font-semibold tracking-wide text-paper-100">{{ title }}</h1>
      <slot name="action" />
    </div>
  </header>
</template>
