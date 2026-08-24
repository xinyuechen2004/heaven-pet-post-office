<template>
  <div class="relative w-full aspect-[4/3] rounded-card overflow-hidden" :class="bgClass">
    <!-- 云上的车站 -->
    <template v-if="type === 'cloud-station'">
      <div class="absolute inset-0 bg-gradient-to-b from-[#E8D5F0] via-[#F0E0F5] to-[#F5EDE0]" />
      <div class="absolute top-[15%] left-[10%] w-[30%] h-[20%] bg-white/60 rounded-full blur-sm" />
      <div class="absolute top-[20%] right-[15%] w-[25%] h-[18%] bg-white/50 rounded-full blur-sm" />
      <div class="absolute top-[10%] left-[30%] w-[20%] h-[15%] bg-white/55 rounded-full blur-sm" />
      <div class="absolute bottom-[20%] left-[20%] w-[60%] h-[25%] bg-[#E8D5B0] rounded-card" />
      <div class="absolute bottom-[25%] left-[30%] text-sm">🚂</div>
    </template>

    <!-- 海边灯塔 -->
    <template v-else-if="type === 'lighthouse'">
      <div class="absolute inset-0 bg-gradient-to-b from-[#D4E8F0] via-[#E8D5C8] to-[#F0E0C8]" />
      <div class="absolute bottom-0 w-full h-[35%] bg-gradient-to-t from-[#C8DCE8] to-transparent" />
      <div class="absolute bottom-[30%] w-full h-[5%] bg-[#A8D0E0]" />
      <div class="absolute bottom-[28%] right-[20%] w-[8%] h-[25%] bg-[#F0E8D0] rounded-t-sm" />
      <div class="absolute bottom-[48%] right-[20%] w-[8%] h-[6%] bg-[#FFE4B5] rounded-sm opacity-80" />
      <div class="absolute bottom-[53%] right-[21%] w-[4%] h-[3%] rounded-full bg-[#FFF8DC] opacity-60 animate-pulse" />
      <div class="absolute top-[20%] right-[25%] text-xl opacity-60">🐦</div>
    </template>

    <!-- 开满花的小路 -->
    <template v-else-if="type === 'flower-path'">
      <div class="absolute inset-0 bg-gradient-to-b from-[#F5E0D0] via-[#F0DCD4] to-[#E8D4C8]" />
      <div class="absolute bottom-[12%] w-full h-[8%] bg-[#E0C8B0] rounded-t-full" />
      <div class="absolute bottom-[8%] left-[30%] w-[40%] h-[6%] bg-[#E0C8B0]" />
      <div class="absolute top-[10%] left-[12%] text-base">🌼</div>
      <div class="absolute top-[25%] left-[28%] text-sm">🌸</div>
      <div class="absolute top-[15%] right-[18%] text-base">🌺</div>
      <div class="absolute top-[30%] right-[35%] text-xs">🌷</div>
      <div class="absolute bottom-[20%] left-[18%] text-sm">🌿</div>
      <div class="absolute bottom-[22%] right-[25%] text-sm">🌾</div>
    </template>

    <!-- 星星很多的夜空 -->
    <template v-else-if="type === 'starry-sky'">
      <div class="absolute inset-0 bg-gradient-to-b from-[#1A1A3E] via-[#252550] to-[#353570]" />
      <div class="absolute top-[8%] left-[15%] w-1 h-1 bg-white rounded-full opacity-80" />
      <div class="absolute top-[14%] left-[35%] w-1.5 h-1.5 bg-white rounded-full opacity-90" />
      <div class="absolute top-[6%] left-[55%] w-1 h-1 bg-white rounded-full opacity-70" />
      <div class="absolute top-[18%] left-[25%] w-1 h-1 bg-white rounded-full opacity-80" />
      <div class="absolute top-[10%] left-[70%] w-1.5 h-1.5 bg-white rounded-full opacity-90" />
      <div class="absolute top-[22%] left-[50%] w-1 h-1 bg-white rounded-full opacity-70" />
      <div class="absolute top-[5%] left-[80%] w-1 h-1 bg-white rounded-full opacity-80" />
      <div class="absolute top-[16%] left-[90%] w-1 h-1 bg-white rounded-full opacity-60" />
      <div class="absolute top-[28%] left-[40%] w-1 h-1 bg-white rounded-full opacity-70" />
      <div class="absolute top-[24%] left-[65%] w-1 h-1 bg-white rounded-full opacity-80" />
      <div class="absolute top-[32%] left-[20%] w-[5%] h-[4%] bg-white rounded-full opacity-30 blur-[1px]" />
      <div class="absolute bottom-[15%] w-full h-[20%] bg-[#252550]" />
    </template>

    <!-- 很暖的草地 -->
    <template v-else-if="type === 'warm-meadow'">
      <div class="absolute inset-0 bg-gradient-to-b from-[#E8F0E0] via-[#F0EDD8] to-[#F5EDD0]" />
      <div class="absolute top-[10%] left-[60%] w-12 h-12 rounded-full bg-[#FFF8DC] opacity-80" />
      <div class="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-[#D8E0A8] to-transparent" />
      <div class="absolute bottom-[15%] left-[10%] text-sm">🌱</div>
      <div class="absolute bottom-[18%] left-[30%] text-xs">🌿</div>
      <div class="absolute bottom-[14%] left-[55%] text-sm">🌱</div>
      <div class="absolute bottom-[17%] right-[20%] text-xs">🌿</div>
      <div class="absolute bottom-[8%] left-[20%] text-lg">🍃</div>
      <div class="absolute top-[15%] left-[15%] text-base opacity-60">☁️</div>
    </template>

    <!-- 安静的小镇 -->
    <template v-else-if="type === 'quiet-town'">
      <div class="absolute inset-0 bg-gradient-to-b from-[#E8E0D8] via-[#EDE5DC] to-[#F0E8E0]" />
      <div class="absolute bottom-[18%] w-full h-[25%] bg-[#D8D0C0]" />
      <div class="absolute bottom-[38%] left-[12%] w-[18%] h-[25%] bg-[#E0D4C0] rounded-t-sm" />
      <div class="absolute bottom-[38%] left-[32%] w-[15%] h-[20%] bg-[#E8DCC8] rounded-t-sm" />
      <div class="absolute bottom-[38%] right-[15%] w-[16%] h-[22%] bg-[#E0D4C0] rounded-t-sm" />
      <div class="absolute bottom-[38%] right-[34%] w-[14%] h-[18%] bg-[#E8DCC8] rounded-t-sm" />
      <div class="absolute bottom-[33%] left-[17%] w-[6%] h-[10%] bg-[#FFF8DC] rounded-sm opacity-60" />
      <div class="absolute bottom-[33%] right-[20%] w-[6%] h-[10%] bg-[#FFF8DC] rounded-sm opacity-60" />
      <div class="absolute bottom-[33%] left-[36%] w-[5%] h-[8%] bg-[#FFF0D0] rounded-sm opacity-50" />
      <div class="absolute bottom-[33%] right-[38%] w-[5%] h-[8%] bg-[#FFF0D0] rounded-sm opacity-50" />
    </template>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ type: string }>()

const bgClass = computed(() => {
  const map: Record<string, string> = {
    'cloud-station': 'bg-[#F0E0F5]',
    'lighthouse': 'bg-[#E8D5C8]',
    'flower-path': 'bg-[#F5E0D0]',
    'starry-sky': 'bg-[#252550]',
    'warm-meadow': 'bg-[#F0EDD8]',
    'quiet-town': 'bg-[#EDE5DC]',
  }
  return map[props.type] || 'bg-linen'
})
</script>
