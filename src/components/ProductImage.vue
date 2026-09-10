<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  productId: string
  icon: string
  alt: string
}>()

const failed = ref(false)

watch(
  () => props.productId,
  () => {
    failed.value = false
  },
)
</script>

<template>
  <img
    v-if="!failed"
    :src="`/images/products/${productId}.webp`"
    :alt="alt"
    loading="lazy"
    class="h-full w-full object-contain"
    @error="failed = true"
  />
  <span v-else class="flex h-full w-full items-center justify-center leading-none">
    {{ icon }}
  </span>
</template>
