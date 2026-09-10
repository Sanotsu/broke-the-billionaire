<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { LEVELS } from '@/data/levels'
import { useProgressStore } from '@/stores/progress'
import { formatMoney } from '@/utils/money'

const router = useRouter()
const progress = useProgressStore()

function enter(levelId: string, unlocked: boolean): void {
  if (!unlocked) return
  router.push(`/play/${levelId}`)
}
</script>

<template>
  <div class="min-h-dvh">
    <AppHeader title="选择关卡" />
    <main class="mx-auto max-w-3xl px-4 py-5">
      <div class="space-y-3">
        <button
          v-for="level in LEVELS"
          :key="level.id"
          type="button"
          class="w-full rounded-xl border p-4 text-left transition"
          :class="
            progress.isUnlocked(level.id)
              ? 'border-ink-600 bg-ink-800 hover:border-gold-600/50'
              : 'border-ink-700 bg-ink-900 opacity-50'
          "
          @click="enter(level.id, progress.isUnlocked(level.id))"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span
                class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                :class="level.sandbox ? 'bg-cyan-500/15 text-cyan-300' : 'bg-gold-600/15 text-gold-300'"
              >
                {{ level.sandbox ? '∞' : level.index }}
              </span>
              <div>
                <div class="text-sm font-semibold text-paper-100">
                  {{ level.name }}
                  <span v-if="level.sandbox" class="ml-1 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[0.6875rem] text-cyan-300">
                    沙盒
                  </span>
                </div>
                <div class="tabular mt-0.5 text-xs text-paper-500">{{ level.subtitle }}</div>
              </div>
            </div>
            <span class="text-xs text-paper-500">
              {{ progress.isUnlocked(level.id) ? (progress.save.results[level.id] ? '已通关 · 重玩' : '进入') : '🔒 未解锁' }}
            </span>
          </div>
          <div class="mt-2 rounded-lg bg-ink-950/50 px-2.5 py-1.5 text-xs text-paper-300">
            📋 规则：{{ level.ruleText }}
          </div>
          <ul v-if="level.ruleDetail" class="mt-1.5 space-y-0.5">
            <li v-for="(rule, i) in level.ruleDetail" :key="i" class="text-[0.6875rem] text-paper-500">
              · {{ rule }}
            </li>
          </ul>
          <div v-if="progress.save.results[level.id]" class="tabular mt-1.5 text-[0.6875rem] text-paper-500">
            最佳战绩：{{ formatMoney(progress.save.results[level.id].spent, 'abbrev') }} ·
            {{ progress.save.results[level.id].kinds }} 种商品
          </div>
        </button>
      </div>
    </main>
  </div>
</template>
