<template>
  <div class="min-h-screen bg-cream px-6 py-10 flex flex-col items-center">
    <div class="w-full max-w-sm flex-1 flex flex-col">
      <div class="flex-1 flex flex-col justify-center">
        <div class="relative mx-auto mb-8 w-44 h-44">
          <div class="absolute inset-0 rounded-full bg-peach-tint blur-2xl opacity-70" />
          <div class="relative w-full h-full rounded-[40px] bg-white/70 shadow-sm flex items-center justify-center">
            <div class="text-center">
              <div class="text-5xl mb-3">💌</div>
              <div class="flex justify-center gap-1">
                <span class="text-xl">⭐</span>
                <span class="text-xl">🐾</span>
                <span class="text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        <p class="text-xs text-warm-orange text-center tracking-[0.28em] mb-4">
          HEAVEN PET POST OFFICE
        </p>
        <h1 class="text-[30px] font-medium text-deep-gray text-center leading-tight mb-5">
          天堂宠物邮局
        </h1>
        <p class="text-[15px] leading-8 text-mid-gray text-center mb-8">
          给离开的 TA 建一个小小邮局。<br />
          你可以把想念写成星星，放进瓶子里；<br />
          TA 会从远方，偶尔寄回一张明信片。
        </p>

        <div class="space-y-3 mb-9">
          <div
            v-for="item in features"
            :key="item.title"
            class="bg-white/60 rounded-2xl px-4 py-3 flex gap-3 items-start"
          >
            <div class="w-8 h-8 rounded-xl bg-linen flex items-center justify-center flex-shrink-0">
              {{ item.icon }}
            </div>
            <div>
              <p class="text-sm font-medium text-deep-gray">{{ item.title }}</p>
              <p class="text-xs text-soft-gray leading-relaxed mt-1">{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <router-link
          :to="hasPet ? '/home' : '/onboarding'"
          class="w-full h-12 bg-gradient-to-b from-warm-orange to-deep-orange rounded-full
                 flex items-center justify-center text-white text-sm font-medium
                 active:scale-95 transition-transform duration-200"
        >
          {{ hasPet ? '进入我的星星瓶' : '开始建立 TA 的邮局' }}
        </router-link>

        <p class="text-xs text-faint-gray text-center leading-relaxed mt-5">
          它不是聊天机器人，也不是复活。<br />
          只是一个温柔保存想念的地方。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const hasPet = computed(() => store.onboardingCompleted && !!store.petProfile)

const features = [
  {
    icon: '⭐',
    title: '写一颗星星',
    desc: '把没说完的话、感谢、道歉或今天的小事写下来。',
  },
  {
    icon: '🍶',
    title: '放进星星瓶',
    desc: '每一份想念都会被好好收起来，而不是消失。',
  },
  {
    icon: '💌',
    title: '收到远方明信片',
    desc: '宠物会以旅行来信的方式，温柔回应你的想念。',
  },
]
</script>
