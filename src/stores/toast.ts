import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface ToastItem {
  id: number
  icon: string
  name: string
  desc?: string
}

let seq = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([])

  function push(icon: string, name: string, desc?: string): void {
    const id = ++seq
    toasts.value.push({ id, icon, name, desc })
    setTimeout(() => dismiss(id), 3600)
  }

  function dismiss(id: number): void {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, push, dismiss }
})
