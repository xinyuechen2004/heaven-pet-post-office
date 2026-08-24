<template>
  <div class="min-h-screen bg-cream flex flex-col px-6 py-8">
    <!-- 返回 -->
    <router-link to="/" class="flex items-center gap-1 text-warm-orange text-sm mb-6 w-fit">
      <ArrowLeft class="w-4 h-4" />
      返回
    </router-link>

    <h1 class="text-[22px] font-medium text-deep-gray mb-2">写给 TA 的星星</h1>
    <p class="text-xs text-soft-gray mb-8">每颗星星都是一句想说的话，点开看看</p>

    <!-- 空态 -->
    <div v-if="store.starCount === 0" class="flex-1 flex flex-col items-center justify-center">
      <div class="w-16 h-16 rounded-full bg-linen flex items-center justify-center mb-4">
        <StarIcon class="w-7 h-7 text-soft-gray" />
      </div>
      <p class="text-sm text-soft-gray mb-6">瓶子里还没有星星</p>
      <router-link
        to="/write-star"
        class="px-6 py-3 bg-warm-orange text-white rounded-full text-sm font-medium
               active:scale-95 transition-transform duration-200"
      >
        写一颗星星
      </router-link>
    </div>

    <!-- 按天分组的星星板块 -->
    <div v-else class="flex-1 max-w-sm mx-auto w-full space-y-6">
      <div v-for="day in dayGroups" :key="day.date" class="bg-white/40 rounded-card px-4 py-4">
        <!-- 日期标题 -->
        <div class="flex items-center gap-2 mb-3">
          <div class="w-1.5 h-1.5 rounded-full bg-warm-orange/50" />
          <span class="text-xs text-soft-gray font-medium">{{ day.label }}</span>
          <span class="text-xs text-faint-gray">· {{ day.stars.length }} 颗</span>
        </div>

        <!-- 星星小卡片行 -->
        <div class="flex flex-wrap gap-2.5">
          <button
            v-for="star in day.stars" :key="star.id"
            class="transition-all duration-200 active:scale-90"
            :style="{ filter: `drop-shadow(0 0 4px ${(star.color || '#F4A7A0')}50)` }"
            @click="openStar(star)"
            aria-label="查看星星"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" :fill="star.color || '#F4A7A0'">
              <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
            </svg>
          </button>
        </div>
      </div>
      <div class="h-8" />
    </div>

    <!-- 纸条弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="activeStar"
          class="fixed inset-0 bg-[rgba(51,51,51,0.3)] flex items-center justify-center z-50 px-6"
          @click.self="activeStar = null"
        >
          <div
            class="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-xl
                   animate-scale-in"
          >
            <!-- 颜色顶条 -->
            <div class="h-1.5 w-full" :style="{ backgroundColor: activeStar.color || '#F4A7A0' }" />

            <div class="px-6 py-6">
              <!-- 日期和类型 -->
              <div class="flex items-center gap-3 mb-4">
                <span class="text-xs text-faint-gray">{{ formatDate(activeStar.createdAt) }}</span>
                <span class="text-xs text-soft-gray">{{ typeLabels[activeStar.type] }}</span>
              </div>

              <!-- 文字内容 -->
              <p class="text-sm text-deep-gray leading-relaxed mb-4 text-balance">
                {{ activeStar.text }}
              </p>

              <!-- 照片 -->
              <div v-if="activeStar.photo" class="mb-4">
                <img :src="activeStar.photo" class="w-full rounded-card object-cover" alt="" />
              </div>

              <!-- 底部按钮 -->
              <div class="flex justify-end pt-2">
                <button
                  class="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm text-warm-orange
                         bg-warm-orange/8 active:scale-95 transition-transform duration-200"
                  @click="activeStar = null"
                >
                  <ArrowDown class="w-3.5 h-3.5" />
                  放回瓶子
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Star as StarIcon, ArrowDown } from 'lucide-vue-next'
import { useAppStore } from '../stores/app'
import type { Star } from '../stores/app'

const store = useAppStore()
const activeStar = ref<Star | null>(null)

// 按天分组
const dayGroups = computed(() => {
  const groups: { date: string; label: string; stars: Star[] }[] = []
  const sorted = [...store.stars].reverse()
  for (const star of sorted) {
    const d = new Date(star.createdAt)
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    let group = groups.find(g => g.date === dateKey)
    if (!group) {
      group = {
        date: dateKey,
        label: formatDate(star.createdAt),
        stars: [],
      }
      groups.push(group)
    }
    group.stars.push(star)
  }
  return groups
})

const typeLabels: Record<string, string> = {
  'missing': '想你了',
  'little-thing': '今天的小事',
  'unsaid': '没说完的话',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function openStar(star: Star) {
  activeStar.value = star
}
</script>

<style scoped>
.modal-enter-active { transition: opacity 0.25s ease; }
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
