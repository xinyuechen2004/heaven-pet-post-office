<template>
  <div class="min-h-screen bg-cream flex flex-col px-6 py-8">
    <!-- 返回 -->
    <router-link to="/" class="flex items-center gap-1 text-warm-orange text-sm mb-6 w-fit">
      <ArrowLeft class="w-4 h-4" />
      返回
    </router-link>

    <div v-if="postcard" class="flex-1 flex flex-col items-center max-w-sm mx-auto w-full">
      <!-- 明信片容器 -->
      <div class="w-full perspective-1000 mb-8">
        <div
          class="relative w-full transition-transform duration-700"
          :class="isFlipped ? 'rotate-y-180' : ''"
          style="transform-style: preserve-3d;"
        >
          <!-- 正面 -->
          <div class="w-full rounded-card overflow-hidden bg-white" style="backface-visibility: hidden;">
            <!-- AI 生成的场景图 -->
            <div v-if="postcard.sceneImage" class="w-full aspect-[4/3]">
              <img :src="postcard.sceneImage" class="w-full h-full object-cover" alt="" />
            </div>
            <!-- 兜底：CSS 场景 + 头像贴纸 -->
            <template v-else>
              <PostcardIllustration :type="postcard.illustration">
                <div
                  class="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white/80
                         flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="store.petProfile?.avatar"
                    :src="store.petProfile.avatar"
                    class="w-full h-full object-cover"
                    alt=""
                  />
                  <span v-else class="text-xl">🐾</span>
                </div>
              </PostcardIllustration>
            </template>
            <!-- 邮票 -->
            <div v-if="!postcard.sceneImage" class="absolute top-3 right-3 bg-white/85 rounded px-2 py-1 text-[10px] text-mid-gray">
              {{ postcard.stamp }}
            </div>
          </div>

          <!-- 背面 -->
          <div
            class="absolute inset-0 w-full rounded-card bg-white p-6 flex flex-col"
            style="backface-visibility: hidden; transform: rotateY(180deg);"
            :class="isFlipped ? 'pointer-events-auto' : 'pointer-events-none'"
          >
            <!-- 信纸纹理线条 -->
            <div class="flex-1 flex flex-col gap-4">
              <p class="text-[14px] leading-relaxed text-deep-gray text-balance">
                {{ postcard.frontText }}
              </p>
            </div>

            <!-- 邮戳/地点/日期 -->
            <div class="border-t border-[rgba(51,51,51,0.08)] pt-4 mt-auto">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-14 h-14 flex items-center justify-center">
                  <svg viewBox="0 0 60 60" class="w-14 h-14" xmlns="http://www.w3.org/2000/svg">
                    <!-- 外圈波浪边框 -->
                    <circle cx="30" cy="30" r="27" fill="none" stroke="#C4A882" stroke-width="1.8" stroke-dasharray="3 2.5" />
                    <circle cx="30" cy="30" r="24" fill="none" stroke="#D4B896" stroke-width="0.6" />
                    <!-- 内圈 -->
                    <circle cx="30" cy="30" r="20" fill="none" stroke="#C4A882" stroke-width="0.5" opacity="0.6" />
                    <!-- 日期 -->
                    <text x="30" y="24" text-anchor="middle" font-size="5.5" fill="#A0896E" font-family="serif">{{ formatPostmarkDate(postcard.date) }}</text>
                    <!-- 分隔线 -->
                    <line x1="14" y1="28" x2="46" y2="28" stroke="#C4A882" stroke-width="0.4" opacity="0.5" />
                    <!-- 地点 -->
                    <text x="30" y="34" text-anchor="middle" font-size="5.5" fill="#A0896E" font-family="serif">天堂邮局</text>
                    <!-- 星星装饰 -->
                    <text x="30" y="43" text-anchor="middle" font-size="7" fill="#D4A574">✦</text>
                  </svg>
                  </div>
                  <div>
                    <p class="text-xs text-mid-gray">{{ postcard.location }}</p>
                    <p class="text-[10px] text-faint-gray">{{ formatDate(postcard.date) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 翻面提示 -->
      <button
        class="text-sm text-soft-gray flex items-center gap-1 mb-8 active:scale-95 transition-transform"
        @click="isFlipped = !isFlipped"
      >
        <RotateCw class="w-4 h-4" />
        {{ isFlipped ? '翻回正面' : '翻到背面' }}
      </button>

      <!-- 操作按钮 -->
      <div class="w-full flex gap-3">
        <button
          class="flex-1 py-3 rounded-btn border border-[rgba(51,51,51,0.12)] text-sm text-deep-gray
                 active:scale-95 transition-transform duration-200 flex items-center justify-center gap-2"
          @click="handleSave"
        >
          <Heart class="w-4 h-4" :class="postcard.isFavorite ? 'fill-warm-orange text-warm-orange' : ''" />
          {{ postcard.isFavorite ? '已收藏' : '收藏' }}
        </button>
        <router-link
          to="/write-star"
          class="flex-1 py-3 rounded-btn bg-warm-orange text-white text-sm font-medium
                 active:scale-95 transition-transform duration-200 flex items-center justify-center gap-2"
        >
          <Sparkles class="w-4 h-4" />
          写星星回应
        </router-link>
      </div>
    </div>

    <!-- 未找到 -->
    <div v-else class="flex-1 flex items-center justify-center">
      <p class="text-soft-gray text-sm">明信片找不到了</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, RotateCw, Heart, Sparkles } from 'lucide-vue-next'
import { useAppStore } from '../stores/app'
import PostcardIllustration from '../components/PostcardIllustration.vue'

const route = useRoute()
const store = useAppStore()
const isFlipped = ref(false)

const postcardId = route.params.id as string
const postcard = ref(store.postcards.find(p => p.id === postcardId) || null)

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function formatPostmarkDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function handleSave() {
  if (postcard.value) {
    store.toggleFavorite(postcard.value.id)
  }
}

onMounted(() => {
  if (postcard.value) {
    store.markPostcardRead(postcard.value.id)
  }
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
