import { computed, onScopeDispose, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'

export function useCountUp(
  source: Ref<number> | (() => number),
  duration = 400,
): Ref<number> {
  const reactiveSource: Ref<number> =
    typeof source === 'function' ? computed(source) : source
  const display = ref(reactiveSource.value)
  let raf = 0
  let from = reactiveSource.value
  let startT = 0

  watch(reactiveSource, (to) => {
    cancelAnimationFrame(raf)
    from = display.value
    startT = performance.now()
    const step = (t: number) => {
      const p = Math.min(1, (t - startT) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      display.value = Math.round(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
  })

  onScopeDispose(() => cancelAnimationFrame(raf))
  return display
}

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export type { ComputedRef }
