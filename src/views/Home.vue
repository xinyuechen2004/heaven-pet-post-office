<template>
  <div class="min-h-screen bg-cream flex flex-col items-center px-6 py-8">
    <!-- 顶部：宠物名字和头像 -->
    <div v-if="store.petProfile" class="flex items-center gap-3 mb-6">
      <div class="w-12 h-12 rounded-full bg-linen overflow-hidden flex-shrink-0">
        <img
          v-if="store.petProfile.avatar"
          :src="store.petProfile.avatar"
          class="w-full h-full object-cover"
          alt=""
        />
        <div v-else class="w-full h-full flex items-center justify-center text-xl">🐾</div>
      </div>
      <div>
        <p class="text-sm font-medium text-deep-gray">{{ store.petProfile.name }}</p>
        <p class="text-xs text-soft-gray">{{ store.petProfile.type }}</p>
      </div>
    </div>

    <!-- 温柔许愿瓶 -->
    <div class="relative w-48 h-72 mb-4" ref="bottleRef">
      <svg viewBox="0 0 200 280" class="w-full h-full drop-shadow-lg">
        <defs>
          <!-- 暖色透明玻璃渐变 -->
          <linearGradient id="jarGlass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(175,148,120,0.35)" />
            <stop offset="15%" stop-color="rgba(210,188,160,0.22)" />
            <stop offset="45%" stop-color="rgba(235,222,208,0.12)" />
            <stop offset="80%" stop-color="rgba(210,188,160,0.22)" />
            <stop offset="100%" stop-color="rgba(165,138,110,0.4)" />
          </linearGradient>
          <!-- 瓶内底部叠加 -->
          <radialGradient id="jarBottom" cx="50%" cy="100%" r="55%">
            <stop offset="0%" stop-color="rgba(170,145,120,0.04)" />
            <stop offset="100%" stop-color="rgba(150,122,98,0.15)" />
          </radialGradient>
          <!-- 星星发光 - 增强版 -->
          <filter id="starGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <!-- 瓶子裁切 -->
          <clipPath id="bottleClip">
            <path d="M68,48 L68,72 Q68,88 56,96 Q38,112 34,120 L34,210 Q34,240 100,246 Q166,240 166,210 L166,120 Q162,112 144,96 Q132,88 132,72 L132,48 Z" />
          </clipPath>
        </defs>

        <!-- 软木塞 -->
        <rect x="66" y="4" width="68" height="44" rx="6"
              fill="rgba(185,155,120,0.7)" stroke="rgba(160,130,100,0.5)" stroke-width="1.2" />
        <!-- 木塞纹理 -->
        <line x1="76" y1="12" x2="76" y2="42" stroke="rgba(160,130,100,0.2)" stroke-width="0.8" />
        <line x1="90" y1="10" x2="90" y2="44" stroke="rgba(160,130,100,0.15)" stroke-width="0.6" />
        <line x1="110" y1="10" x2="110" y2="44" stroke="rgba(160,130,100,0.2)" stroke-width="0.8" />
        <line x1="124" y1="12" x2="124" y2="42" stroke="rgba(160,130,100,0.15)" stroke-width="0.6" />
        <!-- 木塞顶面 -->
        <ellipse cx="100" cy="6" rx="34" ry="5" fill="rgba(200,172,138,0.6)" stroke="rgba(160,130,100,0.4)" stroke-width="0.8" />

        <!-- 瓶身 -->
        <path d="M68,48 L68,72 Q68,88 56,96 Q38,112 34,120 L34,210 Q34,240 100,246 Q166,240 166,210 L166,120 Q162,112 144,96 Q132,88 132,72 L132,48 Z"
              fill="url(#jarGlass)" stroke="rgba(155,130,108,0.38)" stroke-width="1.6" />

        <!-- 瓶内底部暗色 -->
        <ellipse cx="100" cy="225" rx="62" ry="16" fill="url(#jarBottom)" />

        <!-- 瓶内星星 -->
        <g clip-path="url(#bottleClip)">
          <g v-for="(star, i) in displayedStars" :key="star.id"
             :transform="`translate(${starPositions[i]?.x ?? 100}, ${starPositions[i]?.y ?? 150}) rotate(${starPositions[i]?.r ?? 0})`"
             filter="url(#starGlow)"
             class="transition-all duration-700">
            <g transform="scale(1.6)">
              <StarShape :color="star.color || '#F4A7A0'" />
            </g>
          </g>
        </g>

        <!-- 左侧高光 -->
        <path d="M42,130 L40,218" stroke="rgba(255,255,255,0.25)" stroke-width="6" fill="none" stroke-linecap="round" />
        <!-- 右侧阴影 -->
        <path d="M158,130 L160,218" stroke="rgba(140,118,95,0.14)" stroke-width="4" fill="none" stroke-linecap="round" />
        <!-- 瓶底弧 -->
        <ellipse cx="100" cy="240" rx="64" ry="6" fill="none" stroke="rgba(140,118,95,0.15)" stroke-width="0.8" />
      </svg>

      <!-- 底座光晕 -->
      <div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-36 h-4 bg-warm-orange/8 rounded-full blur-md" />
    </div>

    <!-- 星星数量 -->
    <p class="text-sm text-soft-gray mb-6">
      瓶子里有 <span class="text-warm-orange font-medium">{{ store.starCount }}</span> 颗星星
    </p>

    <!-- 主按钮：写星星 -->
    <router-link
      to="/write-star"
      class="w-48 h-12 bg-gradient-to-b from-warm-orange to-deep-orange rounded-full
             flex items-center justify-center gap-2 text-white text-sm font-medium
             active:scale-95 transition-transform duration-200 mb-10"
    >
      <Sparkles class="w-4 h-4" />
      写一颗星星
    </router-link>

    <!-- 入口区域 -->
    <div class="w-full max-w-sm space-y-3">
      <!-- 新明信片提示 -->
      <div
        v-if="store.unreadPostcard"
        class="w-full bg-peach-tint rounded-card px-5 py-4 flex items-center gap-3
               animate-fade-in cursor-pointer active:scale-[0.98] transition-transform duration-200"
        @click="goToPostcard(store.unreadPostcard!.id)"
      >
        <Mail class="w-5 h-5 text-warm-orange flex-shrink-0" />
        <div>
          <p class="text-sm font-medium text-warm-orange">有一张远方来的明信片到了</p>
          <p class="text-xs text-soft-gray mt-0.5">{{ store.unreadPostcard.location }}</p>
        </div>
      </div>

      <!-- 远方明信片 -->
      <router-link
        to="/travel-diary"
        class="w-full bg-white/60 rounded-card px-5 py-4 flex items-center gap-3
               active:scale-[0.98] transition-transform duration-200"
      >
        <div class="w-10 h-10 rounded-xl bg-linen flex items-center justify-center flex-shrink-0">
          <BookOpen class="w-5 h-5 text-warm-orange" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-deep-gray">远方明信片</p>
          <p class="text-xs text-soft-gray mt-0.5">
            已收到 {{ store.postcards.length }} 张明信片
          </p>
        </div>
        <ChevronRight class="w-4 h-4 text-faint-gray" />
      </router-link>

      <!-- 查看瓶中的星星 -->
      <router-link
        to="/star-box"
        class="w-full bg-white/60 rounded-card px-5 py-4 flex items-center gap-3
               active:scale-[0.98] transition-transform duration-200"
      >
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
             :style="{ background: store.starCount > 0 ? 'rgba(244,167,160,0.15)' : 'rgba(220,210,200,0.5)' }">
          <StarIcon class="w-5 h-5 text-warm-orange" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-deep-gray">查看瓶中的星星</p>
          <p class="text-xs text-soft-gray mt-0.5">
            已写了 {{ store.starCount }} 颗星星
          </p>
        </div>
        <ChevronRight class="w-4 h-4 text-faint-gray" />
      </router-link>
    </div>

    <div class="flex-1" />

    <!-- 底部文案 -->
    <p class="text-xs text-faint-gray mt-10 mb-4">
      远方的信不会每天到，但它会慢慢来。
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, Mail, BookOpen, ChevronRight, Star as StarIcon } from 'lucide-vue-next'
import { useAppStore } from '../stores/app'
import StarShape from '../components/StarShape.vue'

const router = useRouter()
const store = useAppStore()
const bottleRef = ref<HTMLElement | null>(null)

const displayedStars = computed(() => {
  return store.stars.slice(-24)
})

// 星星从瓶底堆叠
const starPositions = computed(() => {
  const count = displayedStars.value.length
  if (count === 0) return []
  const cols = 4
  const gapX = 26
  const gapY = 20
  const baseX = 52
  const baseY = 224
  return Array.from({ length: count }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const offsetX = (row % 2) * 13
    return {
      x: baseX + col * gapX + offsetX,
      y: baseY - row * gapY,
      r: (i * 47 + 15) % 360,
    }
  })
})

function goToPostcard(id: string) {
  store.markPostcardRead(id)
  router.push({ name: 'postcard-detail', params: { id } })
}

onMounted(() => {
  const newPostcard = store.checkAndGeneratePostcard()
  if (newPostcard) {
    store.generatePostcardText(newPostcard.id)
  }
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeInSlide 0.6s ease-out;
}
@keyframes fadeInSlide {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
