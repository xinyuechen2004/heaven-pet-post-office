<template>
  <div class="min-h-screen bg-cream flex flex-col px-6 py-8">
    <!-- 返回 -->
    <router-link to="/home" class="flex items-center gap-1 text-warm-orange text-sm mb-8 w-fit">
      <ArrowLeft class="w-4 h-4" />
      返回
    </router-link>

    <!-- 标题 -->
    <h1 class="text-[22px] font-medium text-deep-gray mb-8">写给 TA 的星星</h1>

    <!-- 星星纸类型选择 -->
    <div class="space-y-3 mb-8">
      <p class="text-xs text-soft-gray mb-1">选择星星纸</p>
      <button
        v-for="paper in starPapers" :key="paper.type"
        class="w-full text-left px-5 py-4 rounded-card border transition-all duration-200
               active:scale-[0.98]"
        :class="selectedType === paper.type
          ? 'bg-peach-tint border-warm-orange'
          : 'bg-white/60 border-transparent'"
        @click="selectedType = paper.type"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg">{{ paper.emoji }}</span>
          <div>
            <p class="text-sm font-medium text-deep-gray">{{ paper.label }}</p>
            <p class="text-xs text-soft-gray mt-0.5">{{ paper.hint }}</p>
          </div>
          <div class="ml-auto">
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200"
              :class="selectedType === paper.type
                ? 'border-warm-orange bg-warm-orange'
                : 'border-faint-gray'"
            >
              <Check v-if="selectedType === paper.type" class="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </button>
    </div>

    <!-- 星星纸颜色选择 -->
    <div class="mb-6">
      <p class="text-xs text-soft-gray mb-3">选择星星纸颜色</p>
      <div class="flex gap-2.5 flex-wrap">
        <button
          v-for="c in macaronColors" :key="c"
          class="w-8 h-8 rounded-full border-2 transition-all duration-200 active:scale-90"
          :class="selectedColor === c ? 'border-warm-orange scale-110 shadow-md' : 'border-transparent'"
          :style="{ backgroundColor: c }"
          @click="selectedColor = c"
          aria-label="选择颜色"
        />
      </div>
    </div>

    <!-- 文本输入 -->
    <div class="mb-6">
      <textarea
        ref="textAreaRef"
        v-model="text"
        class="w-full bg-white/60 rounded-card p-5 text-sm text-deep-gray
               placeholder-faint-gray outline-none resize-none
               focus:ring-1 focus:ring-warm-orange transition-all duration-200"
        :placeholder="placeholder"
        rows="4"
        maxlength="500"
      />
      <p class="text-xs text-faint-gray text-right mt-1">{{ text.length }}/500</p>
    </div>

    <!-- 添加照片 -->
    <div class="mb-8">
      <button
        v-if="!photoPreview"
        class="flex items-center gap-2 px-4 py-2.5 rounded-btn text-sm text-soft-gray
               bg-white/60 active:scale-95 transition-transform duration-200"
        @click="handlePickPhoto"
      >
        <Image class="w-4 h-4" />
        添加一张照片（选填）
      </button>
      <div v-else class="relative inline-block">
        <img :src="photoPreview" class="w-24 h-24 rounded-card object-cover" alt="" />
        <button
          class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-mid-gray text-white
                 flex items-center justify-center"
          @click="photoPreview = null; photoBase64 = null"
        >
          <X class="w-3 h-3" />
        </button>
      </div>
    </div>

    <div class="flex-1" />

    <!-- 提交按钮 -->
    <button
      :disabled="!text.trim() || isFolding"
      class="w-full h-12 bg-gradient-to-b from-warm-orange to-deep-orange rounded-full
             flex items-center justify-center gap-2 text-white text-sm font-medium
             active:scale-95 transition-all duration-200
             disabled:opacity-40 mb-6"
      @click="handleFold"
    >
      <Sparkles v-if="!isFolding" class="w-4 h-4" />
      {{ isFolding ? '正在折成星星...' : '折成星星' }}
    </button>

    <!-- 完成态 -->
    <Teleport to="body">
      <Transition name="overlay">
        <div
          v-if="showComplete"
          class="fixed inset-0 bg-cream/95 flex flex-col items-center justify-center z-50 px-8"
          @click="handleCompleteDismiss"
        >
          <!-- 星星坠入瓶子的动画 -->
          <div class="relative w-40 h-56 mb-8">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="star-fall-animation">
                <Star :size="48" class="fill-current" :style="{ color: selectedColor }" />
              </div>
            </div>
            <!-- 许愿瓶轮廓 -->
            <svg viewBox="0 0 140 220" class="absolute inset-0 w-full h-full">
              <!-- 软木塞 -->
              <rect x="46" y="6" width="48" height="34" rx="5"
                    fill="rgba(185,155,120,0.65)" stroke="rgba(160,130,100,0.45)" stroke-width="1" />
              <ellipse cx="70" cy="8" rx="24" ry="4" fill="rgba(200,172,138,0.55)" />
              <!-- 瓶身 -->
              <path d="M48,40 L48,60 Q48,72 40,80 Q28,94 25,100 L25,178 Q25,200 70,206 Q115,200 115,178 L115,100 Q112,94 100,80 Q92,72 92,60 L92,40 Z"
                    fill="rgba(210,190,170,0.35)" stroke="rgba(180,160,140,0.5)" stroke-width="1.4" />
            </svg>
          </div>

          <p class="text-lg font-medium text-deep-gray mb-3">已经放进瓶子里了</p>
          <p class="text-sm text-soft-gray text-center text-balance">
            今晚的星星已经出发了。
          </p>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check, Image, X, Sparkles, Star } from 'lucide-vue-next'
import { useAppStore } from '../stores/app'
import { pickImages } from '../utils/mediaPicker'

const router = useRouter()
const store = useAppStore()

const selectedType = ref<'missing' | 'little-thing' | 'unsaid'>('missing')
const selectedColor = ref('#F4A7A0')
const text = ref('')
const photoPreview = ref<string | null>(null)
const photoBase64 = ref<string | null>(null)
const isFolding = ref(false)
const showComplete = ref(false)

// 马卡龙/莫兰迪色系
const macaronColors = [
  '#F4A7A0', '#F0C5A0', '#E8D0A0', '#B5D8B0', '#A0C8D4',
  '#C4B0D0', '#E0B8C8', '#D4C4A8',
]

const starPapers = [
  { type: 'missing' as const, label: '想你了', hint: '想说的话，再长也可以', emoji: '💫' },
  { type: 'little-thing' as const, label: '今天的小事', hint: '分享今天发生的一件小事', emoji: '🍃' },
  { type: 'unsaid' as const, label: '没说完的话', hint: '那些还没来得及说出口的话', emoji: '📮' },
]

const placeholder = '今天想和 TA 说什么？一句话也可以，很短也没关系。'

async function handlePickPhoto() {
  try {
    const files = await pickImages(1)
    if (files.length === 0) return
    const file = files[0]
    if (file.previewUrl) {
      photoPreview.value = file.previewUrl
      photoBase64.value = await store.compressImage(file.previewUrl)
    }
  } catch {}
}

async function handleFold() {
  if (!text.value.trim() || isFolding.value) return
  isFolding.value = true
  await new Promise(r => setTimeout(r, 1200))
  store.addStar({
    type: selectedType.value,
    text: text.value.trim(),
    photo: photoBase64.value,
    color: selectedColor.value,
  })
  isFolding.value = false
  showComplete.value = true
  window.setTimeout(handleCompleteDismiss, 1800)
}

function handleCompleteDismiss() {
  showComplete.value = false
  router.push({ name: 'home' })
}
</script>

<style scoped>
.overlay-enter-active { transition: opacity 0.5s ease; }
.overlay-leave-active { transition: opacity 0.4s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.star-fall-animation {
  animation: starFall 1.8s ease-in forwards;
}
@keyframes starFall {
  0% { opacity: 0; transform: translateY(-80px) scale(0.3) rotate(0deg); }
  30% { opacity: 1; transform: translateY(-20px) scale(1.2) rotate(90deg); }
  60% { opacity: 1; transform: translateY(40px) scale(0.8) rotate(180deg); }
  100% { opacity: 0; transform: translateY(100px) scale(0.4) rotate(360deg); }
}
</style>
