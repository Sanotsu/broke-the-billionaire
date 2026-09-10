<script setup lang="ts">
import { computed, ref } from 'vue'
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import AppHeader from '@/components/AppHeader.vue'
import { useSettingsStore } from '@/stores/settings'
import { useProgressStore } from '@/stores/progress'
import type { InfoPreset } from '@/types'

const settingsStore = useSettingsStore()
const progressStore = useProgressStore()

const presets: { id: InfoPreset; name: string; desc: string }[] = [
  { id: 'minimal', name: '极简模式', desc: '只有价格和购买，纯解谜' },
  { id: 'standard', name: '标准模式', desc: '价格换算 + 冷知识' },
  { id: 'immersive', name: '沉浸模式', desc: '双视角 + 深度科普 + 叙事结局' },
]

const toggles = computed(() => [
  { key: 'anchorLine' as const, label: '换算锚点', desc: '购买时显示「= 普通人工作 X 年」' },
  { key: 'coldFacts' as const, label: '冷知识', desc: '商品卡片与详情中的一句话科普' },
  { key: 'perspectives' as const, label: '双视角对照', desc: '普通人视角 / 富豪视角' },
  { key: 'deepDive' as const, label: '深度科普', desc: '部分商品的长文介绍' },
  { key: 'narrativeEnding' as const, label: '叙事结局', desc: '结算页消费人格点评' },
  { key: 'confirmLargePurchase' as const, label: '大额购买确认', desc: '1 亿美元以上购买时显示确认' },
])

const confirmReset = ref(false)

function resetProgress(): void {
  progressStore.resetAll()
  confirmReset.value = false
}
</script>

<template>
  <div class="min-h-dvh">
    <AppHeader title="设置" />
    <main class="mx-auto max-w-3xl space-y-6 px-4 py-5">
      <section>
        <h2 class="mb-2 text-xs font-semibold tracking-wider text-paper-500">信息密度</h2>
        <div class="grid gap-2 sm:grid-cols-3">
          <button
            v-for="preset in presets"
            :key="preset.id"
            type="button"
            class="rounded-xl border p-3 text-left transition"
            :class="
              settingsStore.settings.infoPreset === preset.id
                ? 'border-gold-600 bg-gold-600/10'
                : 'border-ink-600 bg-ink-800 hover:border-ink-500'
            "
            @click="settingsStore.setPreset(preset.id)"
          >
            <div class="text-sm font-semibold" :class="settingsStore.settings.infoPreset === preset.id ? 'text-gold-300' : 'text-paper-100'">
              {{ preset.name }}
            </div>
            <div class="mt-1 text-xs leading-snug text-paper-500">{{ preset.desc }}</div>
          </button>
        </div>
      </section>

      <section>
        <h2 class="mb-2 text-xs font-semibold tracking-wider text-paper-500">细项开关</h2>
        <div class="divide-y divide-ink-700 overflow-hidden rounded-xl border border-ink-600 bg-ink-800">
          <div v-for="item in toggles" :key="item.key" class="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <div class="text-sm text-paper-100">{{ item.label }}</div>
              <div class="mt-0.5 text-xs text-paper-500">{{ item.desc }}</div>
            </div>
            <SwitchRoot
              :model-value="settingsStore.settings[item.key]"
              class="relative h-6 w-11 shrink-0 rounded-full bg-ink-600 transition data-[state=checked]:bg-gold-600"
              @update:model-value="(v: boolean) => settingsStore.patch({ [item.key]: v })"
            >
              <SwitchThumb
                class="block h-5 w-5 translate-x-0.5 rounded-full bg-paper-100 transition-transform data-[state=checked]:translate-x-[1.375rem]"
              />
            </SwitchRoot>
          </div>
        </div>
      </section>

      <section>
        <h2 class="mb-2 text-xs font-semibold tracking-wider text-paper-500">字号</h2>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-xl border py-2.5 text-sm transition"
            :class="settingsStore.settings.fontSize === 'normal' ? 'border-gold-600 bg-gold-600/10 text-gold-300' : 'border-ink-600 bg-ink-800 text-paper-300'"
            @click="settingsStore.patch({ fontSize: 'normal' })"
          >
            标准
          </button>
          <button
            type="button"
            class="text-base rounded-xl border py-2.5 transition"
            :class="settingsStore.settings.fontSize === 'large' ? 'border-gold-600 bg-gold-600/10 font-semibold text-gold-300' : 'border-ink-600 bg-ink-800 text-paper-300'"
            @click="settingsStore.patch({ fontSize: 'large' })"
          >
            大字
          </button>
        </div>
      </section>

      <section>
        <h2 class="mb-2 text-xs font-semibold tracking-wider text-paper-500">数字格式</h2>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="rounded-xl border py-2.5 text-sm transition"
            :class="settingsStore.settings.numberFormat === 'full' ? 'border-gold-600 bg-gold-600/10 text-gold-300' : 'border-ink-600 bg-ink-800 text-paper-300'"
            @click="settingsStore.patch({ numberFormat: 'full' })"
          >
            完整 $396,000,000,000
          </button>
          <button
            type="button"
            class="rounded-xl border py-2.5 text-sm transition"
            :class="settingsStore.settings.numberFormat === 'abbrev' ? 'border-gold-600 bg-gold-600/10 text-gold-300' : 'border-ink-600 bg-ink-800 text-paper-300'"
            @click="settingsStore.patch({ numberFormat: 'abbrev' })"
          >
            缩写 $396B
          </button>
        </div>
      </section>

      <section>
        <h2 class="mb-2 text-xs font-semibold tracking-wider text-paper-500">数据管理</h2>
        <div class="rounded-xl border border-red-900/50 bg-red-950/20 p-4">
          <div class="text-sm text-paper-100">重置全部进度</div>
          <div class="mt-1 text-xs text-paper-500">
            清除关卡进度、图鉴收集与成就，设置保留。
          </div>
          <button
            v-if="!confirmReset"
            type="button"
            class="mt-3 rounded-lg bg-red-900/60 px-3 py-1.5 text-[0.8125rem] text-red-200 transition hover:bg-red-900"
            @click="confirmReset = true"
          >
            重置…
          </button>
          <div v-else class="mt-3 flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg bg-red-800 px-3 py-1.5 text-[0.8125rem] text-white transition hover:bg-red-700"
              @click="resetProgress"
            >
              确认清空
            </button>
            <button
              type="button"
              class="rounded-lg bg-ink-700 px-3 py-1.5 text-[0.8125rem] text-paper-300 transition hover:bg-ink-600"
              @click="confirmReset = false"
            >
              取消
            </button>
          </div>
        </div>
      </section>

      <p class="pb-8 text-center text-[0.6875rem] leading-relaxed text-ink-500">
        本游戏价格基于公开资料的近似估算，仅用于体验财富数量级。<br />
        存档保存在本地浏览器中。
      </p>
    </main>
  </div>
</template>
