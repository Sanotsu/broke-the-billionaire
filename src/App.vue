<script setup lang="ts">
import { watchEffect } from 'vue'
import { RouterView } from 'vue-router'
import ToastHost from '@/components/ToastHost.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

watchEffect(() => {
  document.documentElement.classList.toggle(
    'btb-lg',
    settingsStore.settings.fontSize === 'large',
  )
})
</script>

<template>
  <RouterView />
  <ToastHost />
</template>
