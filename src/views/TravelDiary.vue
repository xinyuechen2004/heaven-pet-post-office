<template>
  <div class="min-h-screen bg-cream flex flex-col px-6 py-8">
    <!-- 返回 -->
    <router-link to="/" class="flex items-center gap-1 text-warm-orange text-sm mb-6 w-fit">
      <ArrowLeft class="w-4 h-4" />
      返回
    </router-link>

    <h1 class="text-[22px] font-medium text-deep-gray mb-8">远方来信</h1>

    <!-- Tab 切换 -->
    <div class="flex gap-1 bg-white/40 rounded-full p-1 mb-6 max-w-sm w-full mx-auto">
      <button
        class="flex-1 py-2 rounded-full text-sm transition-all duration-200"
        :class="activeTab === 'all' ? 'bg-white text-deep-gray font-medium shadow-sm' : 'text-soft-gray'"
        @click="activeTab = 'all'"
      >
        所有来信
      </button>
      <button
        class="flex-1 py-2 rounded-full text-sm transition-all duration-200 relative"
        :class="activeTab === 'favorites' ? 'bg-white text-deep-gray font-medium shadow-sm' : 'text-soft-gray'"
        @click="activeTab = 'favorites'"
      >
        已收藏
        <span v-if="store.favoritePostcards.length > 0" class="ml-1 text-xs text-warm-orange">{{ store.favoritePostcards.length }}</span>
      </button>
    </div>

    <!-- 明信片列表 -->
    <div v-if="filteredPostcards.length > 0" class="flex-1 space-y-4">
      <div
        v-for="postcard in filteredPostcards" :key="postcard.id"
        class="bg-white/60 rounded-card overflow-hidden cursor-pointer
               active:scale-[0.98] transition-transform duration-200"
        @click="goToDetail(postcard.id)"
      >
        <div class="flex gap-4 p-4">
          <!-- 缩略图 -->
          <div class="w-24 h-18 rounded-xl overflow-hidden flex-shrink-0 bg-linen">
            <img
              v-if="postcard.sceneImage"
              :src="postcard.sceneImage"
              class="w-full h-full object-cover"
              alt=""
            />
            <PostcardIllustration v-else :type="postcard.illustration" />
          </div>
          <!-- 信息 -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-deep-gray truncate">{{ postcard.location }}</p>
            <p class="text-xs text-soft-gray mt-1">{{ formatDate(postcard.date) }}</p>
            <p class="text-xs text-faint-gray mt-2 line-clamp-2">{{ postcard.frontText }}</p>
          </div>
          <!-- 收藏 -->
          <button
            class="flex-shrink-0 w-8 h-8 flex items-center justify-center
                   active:scale-90 transition-transform"
            @click.stop="store.toggleFavorite(postcard.id)"
            aria-label="收藏"
          >
            <Heart
              class="w-5 h-5 transition-colors"
              :class="postcard.isFavorite ? 'fill-warm-orange text-warm-orange' : 'text-faint-gray'"
            />
          </button>
        </div>
      </div>

      <!-- 底部留白 -->
      <div class="h-20 flex items-center justify-center">
        <p class="text-xs text-faint-gray">明信片会偶尔抵达，不用等待。</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex-1 flex flex-col items-center justify-center gap-4">
      <div class="w-16 h-16 rounded-full bg-linen flex items-center justify-center">
        <Mail class="w-7 h-7 text-faint-gray" />
      </div>
      <p class="text-sm text-soft-gray">
        {{ activeTab === 'favorites' ? '还没有收藏明信片' : '还没有收到明信片' }}
      </p>
      <p class="text-xs text-faint-gray">写下第一颗星星后，远方的回信就会抵达。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Heart, Mail } from 'lucide-vue-next'
import { useAppStore } from '../stores/app'
import PostcardIllustration from '../components/PostcardIllustration.vue'

const router = useRouter()
const store = useAppStore()
const activeTab = ref<'all' | 'favorites'>('all')

const filteredPostcards = computed(() => {
  return activeTab.value === 'favorites'
    ? store.postcards.filter(p => p.isFavorite)
    : store.postcards
})

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function goToDetail(id: string) {
  router.push({ name: 'postcard-detail', params: { id } })
}
</script>
