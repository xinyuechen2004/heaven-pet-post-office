<template>
  <div class="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12">
    <div class="max-w-sm w-full">
      <!-- 步骤指示器 -->
      <div class="flex justify-center gap-2 mb-10">
        <div
          v-for="i in totalSteps" :key="i"
          class="h-1.5 rounded-full transition-all duration-500"
          :class="i <= step ? 'bg-warm-orange' : 'bg-sand'"
          :style="{ width: i <= step ? '24px' : '8px' }"
        />
      </div>

      <!-- 步骤 1: 欢迎页 -->
      <template v-if="step === 1">
        <div class="space-y-8 animate-fade-in text-center">
          <div class="text-5xl">🐾</div>
          <h1 class="text-[26px] font-medium leading-relaxed text-deep-gray">
            先让我认识一下 TA
          </h1>
          <p class="text-[15px] leading-relaxed text-mid-gray text-balance">
            上传一张你最喜欢的照片，<br/>我们一起把 TA 的样子留下来。
          </p>
          <button
            class="mt-8 px-8 py-3 bg-warm-orange text-white rounded-btn text-sm font-medium
                   active:scale-95 transition-transform duration-200"
            @click="step = 2"
          >
            开始
          </button>
        </div>
      </template>

      <!-- 步骤 2: 上传照片 -->
      <template v-if="step === 2">
        <div class="space-y-6 animate-fade-in">
          <h2 class="text-[22px] font-medium text-deep-gray text-center">上传 TA 的照片</h2>
          <p class="text-sm text-soft-gray text-center">可以上传 1-5 张，选你最想念的那些瞬间</p>

          <!-- 已选照片网格 -->
          <div class="grid grid-cols-3 gap-3" v-if="photos.length > 0">
            <div
              v-for="(photo, idx) in photos" :key="idx"
              class="aspect-square rounded-xl overflow-hidden relative bg-linen"
            >
              <img :src="photo.preview" class="w-full h-full object-cover" alt="" />
              <button
                class="absolute top-1 right-1 w-5 h-5 rounded-full bg-mid-gray/70 text-white
                       flex items-center justify-center"
                @click="removePhoto(idx)"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
            <!-- 添加按钮 -->
            <button
              v-if="photos.length < 5"
              class="aspect-square rounded-xl border-2 border-dashed border-faint-gray
                     bg-linen/50 flex flex-col items-center justify-center gap-1
                     active:scale-95 transition-transform duration-200"
              @click="handlePickPhotos"
            >
              <Camera class="w-6 h-6 text-soft-gray" />
              <span class="text-xs text-faint-gray">添加</span>
            </button>
          </div>

          <!-- 空状态上传区 -->
          <div
            v-else
            class="aspect-[4/3] rounded-2xl border-2 border-dashed border-faint-gray
                   bg-linen/50 flex flex-col items-center justify-center gap-3
                   cursor-pointer active:scale-95 transition-transform duration-200"
            @click="handlePickPhotos"
          >
            <Camera class="w-10 h-10 text-soft-gray" />
            <div class="text-center">
              <p class="text-sm text-soft-gray">点击上传照片</p>
              <p class="text-xs text-faint-gray mt-1">支持 1-5 张</p>
            </div>
          </div>

          <p v-if="uploadError" class="text-sm text-dusty-rose text-center">{{ uploadError }}</p>
          <div class="flex gap-4 justify-center pt-4">
            <button
              class="px-6 py-2.5 text-sm text-deep-gray border border-[rgba(51,51,51,0.12)] rounded-btn
                     active:scale-95 transition-transform duration-200"
              @click="step = 1"
            >
              返回
            </button>
            <button
              class="px-6 py-2.5 bg-warm-orange text-white rounded-btn text-sm font-medium
                     active:scale-95 transition-transform duration-200
                     disabled:opacity-40"
              :disabled="photos.length === 0"
              @click="startGenerateAvatar"
            >
              生成 TA 的样子
            </button>
          </div>
        </div>
      </template>

      <!-- 步骤 3: AI 生成头像 -->
      <template v-if="step === 3">
        <div class="space-y-6 animate-fade-in text-center">
          <h2 class="text-[22px] font-medium text-deep-gray">正在帮 TA 画像...</h2>

          <!-- 加载状态 -->
          <div v-if="generating" class="py-12 space-y-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-linen flex items-center justify-center">
              <Loader2 class="w-8 h-8 text-warm-orange animate-spin" />
            </div>
            <p class="text-sm text-soft-gray">{{ generatingText }}</p>
            <p v-if="genError" class="text-sm text-dusty-rose">{{ genError }}</p>
            <button
              v-if="genError"
              class="px-6 py-2 bg-warm-orange text-white rounded-btn text-sm
                     active:scale-95 transition-transform duration-200"
              @click="retryGenerate"
            >
              重新生成
            </button>
          </div>

          <!-- 生成结果 -->
          <div v-else-if="avatarResult" class="space-y-6">
            <div class="relative mx-auto w-48 h-48 rounded-3xl overflow-hidden bg-linen">
              <img :src="avatarResult" class="w-full h-full object-contain" alt="" />
            </div>
            <p class="text-xs text-faint-gray">内容由 AI 生成</p>
            <p v-if="genError" class="text-sm text-dusty-rose leading-relaxed">
              {{ genError }}
            </p>

            <div class="flex gap-4 justify-center pt-4">
              <button
                class="px-6 py-2.5 text-sm text-deep-gray border border-[rgba(51,51,51,0.12)] rounded-btn
                       active:scale-95 transition-transform duration-200"
                @click="step = 2"
              >
                重新上传
              </button>
              <button
                class="px-6 py-2.5 bg-warm-orange text-white rounded-btn text-sm font-medium
                       active:scale-95 transition-transform duration-200"
                @click="step = 4"
              >
                继续调整
              </button>
            </div>
          </div>

          <!-- 生成失败 -->
          <div v-else class="py-12 space-y-6">
            <div class="w-20 h-20 mx-auto rounded-full bg-peach-tint flex items-center justify-center">
              <span class="text-2xl">!</span>
            </div>
            <p class="text-sm text-dusty-rose leading-relaxed">
              {{ genError || 'AI 画像没有生成成功，请重试。' }}
            </p>
            <div class="flex gap-4 justify-center pt-2">
              <button
                class="px-6 py-2.5 text-sm text-deep-gray border border-[rgba(51,51,51,0.12)] rounded-btn
                       active:scale-95 transition-transform duration-200"
                @click="step = 2"
              >
                重新上传
              </button>
              <button
                class="px-6 py-2.5 bg-warm-orange text-white rounded-btn text-sm font-medium
                       active:scale-95 transition-transform duration-200"
                @click="retryGenerate"
              >
                重新生成
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- 步骤 4: 微调 -->
      <template v-if="step === 4">
        <div class="space-y-6 animate-fade-in">
          <h2 class="text-[22px] font-medium text-deep-gray text-center">再看看，TA 是这个样子吗？</h2>

          <div v-if="avatarResult" class="mx-auto w-40 h-40 rounded-3xl overflow-hidden bg-linen">
            <img :src="avatarResult" class="w-full h-full object-contain" alt="" />
          </div>

          <div class="bg-peach-tint rounded-card px-4 py-3 text-center">
            <p class="text-xs text-warm-orange leading-relaxed">
              如果画像已经很像 TA，下面的选项<strong>不需要选</strong>。<br/>
              只有当画像的某个特征不符时，才需要调整对应的选项。
            </p>
          </div>

          <!-- 自然语言输入 -->
          <div class="space-y-1">
            <textarea
              v-model="fineTuneText"
              class="w-full bg-white/60 rounded-card p-4 text-sm text-deep-gray
                     placeholder-faint-gray outline-none resize-none
                     focus:ring-1 focus:ring-warm-orange transition-all duration-200"
              placeholder="比如：左耳有个小缺口、尾巴尖是白色的、鼻子旁边有一块黑斑..."
              rows="3"
            />
          </div>

          <!-- 预设选项 -->
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="opt in fineTuneOptions" :key="opt.key"
                class="bg-white/60 rounded-xl px-3 py-2.5"
              >
                <p class="text-xs text-soft-gray mb-1">{{ opt.label }}</p>
                <div class="flex flex-wrap gap-1">
                  <button
                    v-for="v in opt.values" :key="v"
                    class="px-2.5 py-1 text-xs rounded-full transition-all duration-200"
                    :class="fineTuneState[opt.key] === v
                      ? 'bg-warm-orange text-white'
                      : 'bg-linen text-mid-gray'"
                    @click="fineTuneState[opt.key] = fineTuneState[opt.key] === v ? '' : v"
                  >
                    {{ v }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 微调生成状态 -->
          <div v-if="tuning" class="flex items-center justify-center gap-2 py-4">
            <Loader2 class="w-4 h-4 text-warm-orange animate-spin" />
            <span class="text-sm text-soft-gray">正在调整...</span>
          </div>
          <p v-if="tuneError" class="text-sm text-dusty-rose text-center">{{ tuneError }}</p>

          <div class="flex gap-4 justify-center pt-2">
            <button
              class="px-6 py-2.5 text-sm text-deep-gray border border-[rgba(51,51,51,0.12)] rounded-btn
                     active:scale-95 transition-transform duration-200"
              @click="step = 3"
            >
              返回
            </button>
            <button
              :disabled="tuning"
              class="px-6 py-2.5 bg-warm-orange text-white rounded-btn text-sm font-medium
                     active:scale-95 transition-transform duration-200 disabled:opacity-40"
              @click="handleFineTune"
            >
              {{ fineTuneText.trim() || hasFineTuneChanges ? '应用调整' : '不需要调整，继续' }}
            </button>
          </div>
        </div>
      </template>

      <!-- 步骤 5: 四视角角色卡 -->
      <template v-if="step === 5">
        <div class="space-y-6 animate-fade-in">
          <h2 class="text-[22px] font-medium text-deep-gray text-center">
            {{ generatingCards ? '正在生成 TA 的各个视角...' : '这是 TA 的样子' }}
          </h2>

          <div v-if="generatingCards" class="py-8 space-y-5">
            <div class="w-16 h-16 mx-auto rounded-full bg-linen flex items-center justify-center">
              <Loader2 class="w-7 h-7 text-warm-orange animate-spin" />
            </div>
            <p class="text-sm text-soft-gray text-center">AI 正在从不同角度认识 TA</p>
            <!-- 进度条 -->
            <div class="w-full space-y-2">
              <div class="w-full bg-linen rounded-full h-2.5 overflow-hidden">
                <div
                  class="h-full bg-warm-orange rounded-full transition-all duration-700 ease-out"
                  :style="{ width: `${Math.round((cardProgress / 4) * 100)}%` }"
                />
              </div>
              <p class="text-xs text-faint-gray text-center">正在生成第 {{ cardProgress }}/4 张</p>
            </div>
            <p v-if="cardError" class="text-sm text-dusty-rose text-center">{{ cardError }}</p>
            <button
              v-if="cardError"
              class="px-6 py-2 bg-warm-orange text-white rounded-btn text-sm mx-auto block
                     active:scale-95 transition-transform duration-200"
              @click="generateCharacterCards"
            >
              重试
            </button>
          </div>

          <!-- 四视角网格 -->
          <div v-else class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="(label, idx) in cardLabels" :key="idx"
                class="aspect-square rounded-xl overflow-hidden relative"
                :class="characterCards[idx] ? 'bg-linen/30' : 'bg-linen'"
              >
                <img
                  v-if="characterCards[idx]"
                  :src="characterCards[idx]"
                  class="w-full h-full object-cover"
                  alt=""
                />
                <div v-else class="w-full h-full flex items-center justify-center text-xs text-soft-gray">
                  {{ label }}
                </div>
              </div>
            </div>
            <p v-if="cardError" class="text-sm text-dusty-rose text-center leading-relaxed">{{ cardError }}</p>
            <button
              v-if="cardError"
              class="px-6 py-2 bg-warm-orange text-white rounded-btn text-sm mx-auto block
                     active:scale-95 transition-transform duration-200"
              @click="generateCharacterCards"
            >
              重新生成四视角
            </button>
          </div>

          <p v-if="!generatingCards && !tuneMode" class="text-xs text-faint-gray text-center">内容由 AI 生成</p>

          <!-- 正常模式：操作按钮 -->
          <div v-if="!generatingCards && !tuneMode" class="flex gap-4 justify-center pt-4">
            <button
              class="px-6 py-2.5 text-sm text-deep-gray border border-[rgba(51,51,51,0.12)] rounded-btn
                     active:scale-95 transition-transform duration-200"
              @click="tuneMode = 'select'"
            >
              还想再调一下
            </button>
            <button
              :disabled="!hasCompleteCharacterCards"
              class="px-6 py-2.5 bg-warm-orange text-white rounded-btn text-sm font-medium
                     active:scale-95 transition-transform duration-200 disabled:opacity-40"
              @click="step = 6"
            >
              这就是 TA
            </button>
          </div>

          <!-- 调优模式：选择要调整的视角 -->
          <div v-if="tuneMode === 'select'" class="space-y-5">
            <p class="text-sm text-deep-gray text-center">选择要调整的视角（可多选）</p>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="(label, idx) in cardLabels" :key="idx"
                class="aspect-square rounded-xl overflow-hidden relative
                       border-2 transition-all duration-200"
                :class="selectedPerspectives.includes(idx) ? 'border-warm-orange shadow-lg' : 'border-transparent'"
                @click="togglePerspective(idx)"
              >
                <img
                  v-if="characterCards[idx]"
                  :src="characterCards[idx]"
                  class="w-full h-full object-cover bg-linen/30"
                  alt=""
                />
                <div v-else class="w-full h-full flex items-center justify-center text-xs text-soft-gray bg-linen">
                  {{ label }}
                </div>
                <div
                  v-if="selectedPerspectives.includes(idx)"
                  class="absolute top-2 right-2 w-5 h-5 rounded-full bg-warm-orange flex items-center justify-center"
                >
                  <span class="text-white text-xs font-bold">✓</span>
                </div>
              </button>
            </div>
            <div class="flex gap-4 justify-center pt-2">
              <button
                class="px-6 py-2.5 text-sm text-deep-gray border border-[rgba(51,51,51,0.12)] rounded-btn
                       active:scale-95 transition-transform duration-200"
                @click="tuneMode = null; selectedPerspectives = []"
              >
                返回
              </button>
              <button
                :disabled="selectedPerspectives.length === 0"
                class="px-6 py-2.5 bg-warm-orange text-white rounded-btn text-sm font-medium
                       active:scale-95 transition-transform duration-200 disabled:opacity-40"
                @click="tuneMode = 'prompt'"
              >
                确认
              </button>
            </div>
          </div>

          <!-- 调优模式：输入调整描述 -->
          <div v-if="tuneMode === 'prompt'" class="space-y-5">
            <p class="text-sm text-deep-gray text-center">
              我会按你的描述重做一整套四视角，<br/>让四张图保持同一种风格。
            </p>
            <textarea
              v-model="tunePrompt"
              class="w-full bg-white/60 rounded-card p-4 text-sm text-deep-gray
                     placeholder-faint-gray outline-none resize-none
                     focus:ring-1 focus:ring-warm-orange transition-all duration-200"
              placeholder="比如：尾巴再长一点、耳朵更圆一些、整体的毛色偏浅..."
              rows="4"
            />
            <p v-if="tuneGenError" class="text-sm text-dusty-rose text-center">{{ tuneGenError }}</p>
            <div class="flex gap-4 justify-center pt-2">
              <button
                class="px-6 py-2.5 text-sm text-deep-gray border border-[rgba(51,51,51,0.12)] rounded-btn
                       active:scale-95 transition-transform duration-200"
                @click="tuneMode = 'select'"
              >
                返回
              </button>
              <button
                :disabled="!tunePrompt.trim()"
                class="px-6 py-2.5 bg-warm-orange text-white rounded-btn text-sm font-medium
                       active:scale-95 transition-transform duration-200 disabled:opacity-40"
                @click="regenerateSelectedCards"
              >
                重做一整套
              </button>
            </div>
          </div>

          <!-- 调优模式：生成中 -->
          <div v-if="tuneMode === 'generating'" class="py-8 space-y-5">
            <div class="w-16 h-16 mx-auto rounded-full bg-linen flex items-center justify-center">
              <Loader2 class="w-7 h-7 text-warm-orange animate-spin" />
            </div>
            <p class="text-sm text-soft-gray text-center">正在按你的描述重新生成...</p>
            <p v-if="tuneGenError" class="text-sm text-dusty-rose text-center">{{ tuneGenError }}</p>
          </div>
        </div>
      </template>

      <!-- 步骤 6: 填写信息 -->
      <template v-if="step === 6">
        <div class="space-y-5 animate-fade-in text-left">
          <h2 class="text-[22px] font-medium text-deep-gray text-center">关于 TA</h2>

          <div class="space-y-1">
            <label class="text-xs text-soft-gray">TA 的名字</label>
            <input
              v-model="form.name"
              class="w-full bg-linen rounded-2xl px-4 py-3 text-sm text-deep-gray
                     placeholder-faint-gray outline-none focus:ring-1 focus:ring-warm-orange
                     transition-all duration-200"
              placeholder="比如：小咪、旺财"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs text-soft-gray">TA 是什么小动物</label>
            <input
              v-model="form.type"
              class="w-full bg-linen rounded-2xl px-4 py-3 text-sm text-deep-gray
                     placeholder-faint-gray outline-none focus:ring-1 focus:ring-warm-orange
                     transition-all duration-200"
              placeholder="比如：猫、狗、兔子"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs text-soft-gray">性格标签（最多 3 个）</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <button
                v-for="tag in presetTags" :key="tag"
                class="px-3 py-1.5 text-xs rounded-full border transition-all duration-200"
                :class="form.personalityTags.includes(tag)
                  ? 'bg-warm-orange text-white border-warm-orange'
                  : 'bg-linen text-mid-gray border-transparent'"
                :disabled="form.personalityTags.length >= 3 && !form.personalityTags.includes(tag)"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
            <input
              v-model="customTag"
              class="w-full bg-linen rounded-2xl px-4 py-3 text-sm text-deep-gray
                     placeholder-faint-gray outline-none focus:ring-1 focus:ring-warm-orange
                     transition-all duration-200"
              placeholder="或自定义标签"
              @keyup.enter="addCustomTag"
            />
          </div>

          <div class="flex gap-4 justify-center pt-2">
            <button
              class="px-6 py-2.5 text-sm text-deep-gray border border-[rgba(51,51,51,0.12)] rounded-btn
                     active:scale-95 transition-transform duration-200"
              @click="step = 5"
            >
              返回
            </button>
            <button
              class="px-8 py-3 bg-gradient-to-b from-warm-orange to-deep-orange text-white
                     rounded-full text-sm font-medium
                     active:scale-95 transition-transform duration-200
                     disabled:opacity-40"
              :disabled="!form.name || !form.type || preparingPostcard"
              @click="handleComplete"
            >
              {{ preparingPostcard ? '正在准备...' : '我认出来了' }}
            </button>
            <p v-if="prepareError" class="text-sm text-dusty-rose text-center mt-3">{{ prepareError }}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, X, Loader2 } from 'lucide-vue-next'
import { useAppStore, SCENE_PROMPTS, type PetFeatures } from '../stores/app'
import { pickImages } from '../utils/mediaPicker'
import { imageGenImage, pollImageGenImage } from '../utils/imageApi'

const router = useRouter()
const store = useAppStore()

const totalSteps = 6
const step = ref(1)

// 照片上传
const photos = ref<{ preview: string; base64: string }[]>([])
const uploadError = ref('')

// AI 生成
const generating = ref(false)
const generatingText = ref('AI 正在观察 TA 的样子...')
const genError = ref('')
const avatarResult = ref<string | null>(null)
const initialAvatar = ref<string | null>(null) // 第一版头像，不受微调影响

// 微调
const fineTuneText = ref('')
const tuning = ref(false)
const tuneError = ref('')
const fineTuneState = reactive<Record<string, string>>({
  pattern: '',
  earShape: '',
  eyeColor: '',
  bodyType: '',
})

const fineTuneOptions = [
  { key: 'pattern', label: '花纹', values: ['纯色', '条纹', '斑点', '渐层', '三花'] },
  { key: 'earShape', label: '耳朵', values: ['立耳', '折耳', '圆耳', '尖耳', '一立一折'] },
  { key: 'eyeColor', label: '眼睛', values: ['琥珀色', '蓝色', '绿色', '黄色', '异瞳'] },
  { key: 'bodyType', label: '体型', values: ['圆润', '修长', '健壮', '娇小', '毛茸茸'] },
]

const hasFineTuneChanges = computed(() => {
  return Object.values(fineTuneState).some(v => v !== '') || fineTuneText.value.trim() !== ''
})

// 四视角
const generatingCards = ref(false)
const cardError = ref('')
const cardProgress = ref(0)
const characterCards = ref<string[]>([])
const cardLabels = ['微侧正坐', '侧面站着', '跑动玩耍', '向右趴着']
const hasCompleteCharacterCards = computed(() => characterCards.value.length === 4 && characterCards.value.every(Boolean))
// 调优模式（步骤5内）
const tuneMode = ref<'select' | 'prompt' | 'generating' | null>(null)
const selectedPerspectives = ref<number[]>([])
const tunePrompt = ref('')
const tuneGenError = ref('')

const preparingPostcard = ref(false)
const prepareError = ref('')

function splitImageGrid(dataUrl: string, rows = 2, cols = 2): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const cellWidth = Math.floor(img.width / cols)
      const cellHeight = Math.floor(img.height / rows)
      const cards: string[] = []

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const canvas = document.createElement('canvas')
          canvas.width = cellWidth
          canvas.height = cellHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('浏览器无法切分四视角图片'))
            return
          }
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, cellWidth, cellHeight)
          ctx.drawImage(
            img,
            col * cellWidth,
            row * cellHeight,
            cellWidth,
            cellHeight,
            0,
            0,
            cellWidth,
            cellHeight,
          )
          cards.push(canvas.toDataURL('image/jpeg', 0.92))
        }
      }
      resolve(cards)
    }
    img.onerror = () => reject(new Error('四视角图片读取失败'))
    img.src = dataUrl
  })
}

function cropDarkFrame(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const sourceCanvas = document.createElement('canvas')
      sourceCanvas.width = img.width
      sourceCanvas.height = img.height
      const sourceCtx = sourceCanvas.getContext('2d')
      if (!sourceCtx) {
        resolve(dataUrl)
        return
      }
      sourceCtx.drawImage(img, 0, 0)
      const pixels = sourceCtx.getImageData(0, 0, img.width, img.height).data

      const isDarkColumn = (x: number) => {
        let dark = 0
        for (let y = 0; y < img.height; y++) {
          const i = (y * img.width + x) * 4
          const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
          if (brightness < 34) dark++
        }
        return dark / img.height > 0.82
      }

      const isDarkRow = (y: number) => {
        let dark = 0
        for (let x = 0; x < img.width; x++) {
          const i = (y * img.width + x) * 4
          const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
          if (brightness < 34) dark++
        }
        return dark / img.width > 0.82
      }

      let left = 0
      let right = img.width - 1
      let top = 0
      let bottom = img.height - 1
      while (left < right && isDarkColumn(left)) left++
      while (right > left && isDarkColumn(right)) right--
      while (top < bottom && isDarkRow(top)) top++
      while (bottom > top && isDarkRow(bottom)) bottom--

      left = Math.max(0, left - 2)
      top = Math.max(0, top - 2)
      right = Math.min(img.width - 1, right + 2)
      bottom = Math.min(img.height - 1, bottom + 2)

      const croppedWidth = right - left + 1
      const croppedHeight = bottom - top + 1
      const changedEnough = croppedWidth < img.width - 12 || croppedHeight < img.height - 12
      if (!changedEnough || croppedWidth < img.width * 0.35 || croppedHeight < img.height * 0.35) {
        resolve(dataUrl)
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = croppedWidth
      canvas.height = croppedHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, left, top, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight)
      resolve(canvas.toDataURL('image/jpeg', 0.94))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

// 宠物信息
const customTag = ref('')
const presetTags = ['温柔', '贪吃', '调皮', '粘人', '安静', '勇敢', '好奇', '聪明', '慵懒']
const form = reactive({
  name: '',
  type: '',
  personalityTags: [] as string[],
})

function toggleTag(tag: string) {
  const idx = form.personalityTags.indexOf(tag)
  if (idx >= 0) form.personalityTags.splice(idx, 1)
  else if (form.personalityTags.length < 3) form.personalityTags.push(tag)
}

function addCustomTag() {
  const tag = customTag.value.trim()
  if (tag && form.personalityTags.length < 3 && !form.personalityTags.includes(tag)) {
    form.personalityTags.push(tag)
  }
  customTag.value = ''
}

async function handlePickPhotos() {
  uploadError.value = ''
  try {
    const remaining = 5 - photos.value.length
    const files = await pickImages(remaining)
    for (const file of files) {
      if (file.previewUrl && photos.value.length < 5) {
        try {
          const compressed = await store.compressImage(file.previewUrl)
          photos.value.push({ preview: file.previewUrl, base64: compressed })
        } catch {
          uploadError.value = '图片压缩失败，可能是图片格式不支持'
        }
      }
    }
  } catch {
    uploadError.value = '选取照片失败，请检查权限设置后重试'
  }
}

function removePhoto(idx: number) {
  photos.value.splice(idx, 1)
}

function friendlyImageError(e: any, fallback = 'AI 图片没有生成成功，请稍后再试。') {
  const message = e?.message || ''
  if (message.includes('超时') || message.includes('timeout')) {
    return 'AI 生成这次排队太久了。请等一分钟后再重新生成，不要连续点击，避免重复消耗额度。'
  }
  return message ? `${fallback.replace('请稍后再试。', '')}：${message}` : fallback
}

async function startGenerateAvatar() {
  step.value = 3
  generating.value = true
  genError.value = ''
  await generateAvatar()
}

async function generateAvatar() {
  try {
    const mainPhoto = photos.value[0].base64
    const prompt = `根据参考照片生成一张方形画布里的彩色写实宠物半身肖像插画，不是圆形头像贴纸。宠物头部、双耳、脖子和照片中真实存在的配饰必须完整出现在画面里，四周留少量浅色背景，不要裁切耳朵。严格保持原图真实比例：眼睛大小、眼距、脸型、耳朵角度、鼻口位置、胖瘦、年龄感、真实毛色、花纹位置。只保留照片里真实存在的配饰，禁止新增铃铛、吊坠、牌子、项圈或蝴蝶结。线条清晰但完整全彩上色，有自然毛发纹理，不要夸张可爱化。禁止黑白线稿、素描、铅笔稿、美化、萌化、大眼、圆脸、幼态、Q版、3D、拟人、夸张表情、白色描边、贴纸边、文字、水印。`
    const taskId = await imageGenImage(prompt, mainPhoto)
    generatingText.value = '正在勾勒 TA 的轮廓...'
    const result = await pollImageGenImage(taskId)
    avatarResult.value = result
    initialAvatar.value = result // 保存第一版头像
  } catch (e: any) {
    avatarResult.value = null
    initialAvatar.value = null
    genError.value = friendlyImageError(e, 'AI 画像没有生成成功，请稍后再试。')
  } finally {
    generating.value = false
  }
}

function retryGenerate() {
  generating.value = true
  genError.value = ''
  generateAvatar()
}

async function handleFineTune() {
  if (!fineTuneText.value.trim() && !hasFineTuneChanges.value) {
    step.value = 5
    generateCharacterCards()
    return
  }

  tuning.value = true
  tuneError.value = ''
  try {
    let prompt = '在保持同一只宠物身份完全一致的前提下，调整这张彩色写实宠物插画头像，'
    if (fineTuneText.value.trim()) {
      prompt += fineTuneText.value.trim() + '。'
    }
    const changes: string[] = []
    for (const [key, val] of Object.entries(fineTuneState)) {
      if (val) {
        const opt = fineTuneOptions.find(o => o.key === key)
        if (opt) changes.push(`${opt.label}改为${val}`)
      }
    }
    if (changes.length) prompt += changes.join('，') + '。'
    prompt += '保持彩色写实宠物插画风格，只按参考图修正。线条清晰但必须完整全彩上色。保留眼睛大小、眼距、脸型、耳朵角度、鼻口位置、胖瘦、年龄感、毛色、花纹位置和照片中真实存在的配饰。只保留照片里真实存在的配饰，禁止新增铃铛、吊坠、牌子、项圈或蝴蝶结。禁止黑白线稿、素描、铅笔稿、美化、萌化、大眼、圆脸、幼态、Q版、3D、白色描边、贴纸边。'

    const taskId = await imageGenImage(prompt, avatarResult.value!)
    const result = await pollImageGenImage(taskId)
    avatarResult.value = result
    step.value = 5
    generateCharacterCards()
  } catch (e: any) {
    tuneError.value = e.message || '调整失败，请稍后再试'
  } finally {
    tuning.value = false
  }
}

async function generateCharacterCards() {
  generatingCards.value = true
  cardError.value = ''
  cardProgress.value = 0
  characterCards.value = []
  try {
    const styleRef = avatarResult.value || photos.value[0]?.base64
    const lightStyleRef = await store.compressImage(styleRef!, 768)
    const prompt = `以参考图中的同一只宠物为唯一身份锚点，生成一张 2x2 四宫格姿态参考图。四格必须是同一只宠物、同一画风、同一毛色花纹、同一体型比例，不要画成四只不同动物。保持原物种、品种感、年龄感、胖瘦、头身比例、五官比例、耳朵/四肢/尾巴比例、毛色、花纹/斑点/渐层/特殊标记和真实存在的配饰。四格姿态：微侧正坐、侧面站立、自然小跑、侧身趴着。每格只画宠物本体，完整头到尾，纯白背景，自然边缘。风格：清晰彩色写实插画，可融入后续明信片场景。禁止改变物种/品种/毛色/花纹/体型/五官，禁止新增配饰，禁止贴纸感、任何描边、荧光边、抠图边、底座、阴影垫、道具、文字、边框、黑白线稿、3D、怪物化、萌化、大眼幼态。`

    const taskId = await imageGenImage(prompt, lightStyleRef)
    const sheet = await pollImageGenImage(taskId)
    const generatedCards = await splitImageGrid(sheet, 2, 2)
    cardProgress.value = generatedCards.length
    if (generatedCards.length !== 4) {
      characterCards.value = []
      cardError.value = `四视角需要完整生成 4 张，目前成功 ${generatedCards.length}/4。请重试，或先返回调整头像描述。`
      return
    }
    characterCards.value = generatedCards
  } catch (e: any) {
    cardError.value = friendlyImageError(e, '四视角没有生成成功，请稍后再试。')
  } finally {
    generatingCards.value = false
  }
}

function togglePerspective(idx: number) {
  const i = selectedPerspectives.value.indexOf(idx)
  if (i >= 0) {
    selectedPerspectives.value.splice(i, 1)
  } else {
    selectedPerspectives.value.push(idx)
  }
}

async function regenerateSelectedCards() {
  tuneMode.value = 'generating'
  tuneGenError.value = ''
  const styleRef = avatarResult.value || photos.value[0]?.base64
  const photoRef = photos.value[0]?.base64
  const extraRefs = photoRef && photoRef !== styleRef ? [photoRef] : []

  try {
    cardProgress.value = 0
    characterCards.value = []
    const prompt = `参考图1是已经确认的宠物头像和画风，必须以参考图1为主，延续它的线条粗细、上色方式、毛发质感、脸部特征和项圈；参考图2如有，只用于校准真实身份特征。重新生成一张 2x2 四宫格宠物角色设定图，并应用这个修改要求：${tunePrompt.value.trim()}。四格必须是同一只宠物、同一画师、同一线条、同一上色、同一头身比例、同一年龄感。风格：彩色写实插画，线条清晰但必须完整全彩上色。严格保留真实特征：眼睛大小和眼距、脸型、耳朵角度、鼻口比例、胖瘦身材、真实毛色、花纹位置、项圈。四格顺序：左上微侧正坐，右上侧面站着，左下自然小跑，右下侧身趴着。每格只出现宠物本体和项圈，完整头到尾，比例一致，纯白背景。禁止白色描边、贴纸边、外轮廓光边、毯子、垫子、地面、椭圆阴影、装饰物、道具、背景、文字、标签、边框、黑白线稿、素描、铅笔稿、填色书效果、美化、萌化、大眼、圆脸、幼态、Q版、3D、水印。`
    const taskId = await imageGenImage(prompt, styleRef!, extraRefs)
    const sheet = await pollImageGenImage(taskId)
    characterCards.value = await splitImageGrid(sheet, 2, 2)
    cardProgress.value = characterCards.value.length
    if (characterCards.value.length !== 4) throw new Error('四视角没有完整生成，请重试')
    tuneMode.value = null
    tunePrompt.value = ''
    selectedPerspectives.value = []
  } catch (e: any) {
    tuneGenError.value = e.message || '生成失败'
    tuneMode.value = 'prompt'
  }
}

function getBestPerspectiveForScene(illustration: string): number {
  const mapping: Record<string, number> = {
    'warm-meadow': 3,       // 趴着晒太阳 - 舒服
    'post-office': 0,       // 微侧正坐 - 安静坐在邮局
    'forest-mailbox': 1,    // 侧面站着 - 在森林邮筒旁
    'star-lighthouse': 1,   // 侧面站着 - 远眺灯塔
    'flower-path': 2,       // 跑动玩耍 - 在花路上跑
    'moon-station': 0,      // 微侧正坐 - 安静等车
    'glass-lake': 1,        // 侧面站着 - 看湖面倒影
    'sunny-windowsill': 3,  // 趴着 - 在窗台晒太阳
    'windchime-garden': 2,  // 跑动玩耍 - 在花园里玩
    'star-boat': 0,         // 微侧正坐 - 坐在船里
  }
  return mapping[illustration] ?? 0
}

async function generatePostcardScene(postcardId: string, charCards: string[]): Promise<string | null> {
  if (charCards.length === 0) return null
  const postcard = store.postcards.find(p => p.id === postcardId)
  if (!postcard) return null

  const sceneDesc = SCENE_PROMPTS[postcard.illustration] || '在温暖梦幻的自然场景中'
  const bestIdx = getBestPerspectiveForScene(postcard.illustration)
  const refCard = charCards[bestIdx] || charCards[0]
  const prompt = `生成一张完整横向 4:3 明信片正面插画，画面必须铺满整个画布：${sceneDesc}。必须直接生成横向场景，不要生成竖图后放进横向黑底里。这是一张温柔、治愈、让人安心的宠物旅行明信片，不是宠物肖像照、遗照、凝视镜头的特写或恐怖氛围图。将参考图中的同一只宠物自然放进场景里，宠物面积约占画面 15%-22%，必须是全身或大半身，位于画面中景，不要占据画面中心巨大凝视用户。宠物应在场景中做轻松日常的小动作：侧身看风景、闻花、散步、趴在暖光里、抬头看星星，但不要正面直勾勾盯着镜头。必须保留宠物身份特征：眼睛大小、眼距、脸型、头身比例、胖瘦、年龄感、毛色、花纹位置、眼睛颜色、耳朵和真实存在的配饰，不能换成另一只动物。整体是统一的温柔动画电影插画风格，带一点真实毛发结构，但不要照片级写实、不要油亮皮毛、不要玻璃眼、不要模糊糊的 3D 渲染。色彩清透、明亮、柔和，光线温暖安全，有空气感和故事感。禁止阴森、压迫、诡异、恐怖、孤魂感、空洞凝视、巨大正脸、过度真实、油画厚涂、黑底、外框、边框、文字、水印、翅膀、光环、黑白线稿。`

  try {
    const taskId = await imageGenImage(prompt, refCard)
    const result = await pollImageGenImage(taskId)
    return cropDarkFrame(result)
  } catch {
    return null
  }
}

async function handleComplete() {
  if (!hasCompleteCharacterCards.value) {
    step.value = 5
    cardError.value = '需要先完整生成 4 张视角图，才能完成建档。'
    return
  }

  preparingPostcard.value = true
  prepareError.value = ''
  try {
    const features: PetFeatures = {
    furColor: '',
    pattern: fineTuneState.pattern || '',
    earShape: fineTuneState.earShape || '',
    eyeColor: fineTuneState.eyeColor || '',
    bodyType: fineTuneState.bodyType || '',
    specialFeatures: fineTuneText.value.trim(),
  }

  // 压缩大图避免 localStorage 溢出导致静默失败
  const compressedAvatar = initialAvatar.value
    ? await store.compressImage(initialAvatar.value)
    : null
  const compressedCards = await Promise.all(
    characterCards.value.map(c => store.compressImage(c))
  )

  store.savePetProfile({
    name: form.name,
    type: form.type,
    personalityTags: [...form.personalityTags],
    avatar: compressedAvatar,
    characterCards: compressedCards,
    features,
    createdAt: new Date().toISOString(),
  })

  const postcard = store.generatePostcard()

  // 并行：生成文案 + 生成场景图
  const textPromise = store.generatePostcardText(postcard.id)
  const sceneImage = await generatePostcardScene(postcard.id, compressedCards)
  if (sceneImage) {
    const compressed = await store.compressImage(sceneImage, 768)
    store.updatePostcardScene(postcard.id, compressed)
  }
  await textPromise

  preparingPostcard.value = false
  router.push({ name: 'postcard-detail', params: { id: postcard.id } })
  } catch (e: any) {
    prepareError.value = e.message || '生成失败，请重试'
    preparingPostcard.value = false
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
