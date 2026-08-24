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
            <div class="relative mx-auto w-48 h-48 rounded-full overflow-hidden bg-linen">
              <img :src="avatarResult" class="w-full h-full object-cover" alt="" />
            </div>
            <p class="text-xs text-faint-gray">内容由 AI 生成</p>

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
        </div>
      </template>

      <!-- 步骤 4: 微调 -->
      <template v-if="step === 4">
        <div class="space-y-6 animate-fade-in">
          <h2 class="text-[22px] font-medium text-deep-gray text-center">再看看，TA 是这个样子吗？</h2>

          <div v-if="avatarResult" class="mx-auto w-40 h-40 rounded-full overflow-hidden bg-linen">
            <img :src="avatarResult" class="w-full h-full object-cover" alt="" />
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

      <!-- 步骤 5: 三视角角色卡 -->
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
          <div v-else class="grid grid-cols-2 gap-3">
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
              class="px-6 py-2.5 bg-warm-orange text-white rounded-btn text-sm font-medium
                     active:scale-95 transition-transform duration-200"
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
              已选择 {{ selectedPerspectives.length }} 个视角，<br/>想怎么调整？
            </p>
            <textarea
              v-model="tunePrompt"
              class="w-full bg-white/60 rounded-card p-4 text-sm text-deep-gray
                     placeholder-faint-gray outline-none resize-none
                     focus:ring-1 focus:ring-warm-orange transition-all duration-200"
              placeholder="比如：尾巴再长一点、耳朵更圆一些、整体的毛色偏浅..."
              rows="4"
            />
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
                开始生成
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

// 三视角
const generatingCards = ref(false)
const cardError = ref('')
const cardProgress = ref(0)
const characterCards = ref<string[]>([])
const cardLabels = ['微侧正坐', '侧面站着', '跑动玩耍', '向右趴着']
// 调优模式（步骤5内）
const tuneMode = ref<'select' | 'prompt' | 'generating' | null>(null)
const selectedPerspectives = ref<number[]>([])
const tunePrompt = ref('')
const tuneGenError = ref('')

const preparingPostcard = ref(false)
const prepareError = ref('')

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

async function startGenerateAvatar() {
  step.value = 3
  generating.value = true
  genError.value = ''
  await generateAvatar()
}

async function generateAvatar() {
  try {
    const mainPhoto = photos.value[0].base64
    const prompt = `将这张宠物照片转换成温暖柔和的卡通风格插画头像。风格要求：柔和手绘感、暖色调、简约但不幼稚、保留原宠物的关键外貌特征、圆润可爱的线条。背景为柔和的奶油色渐变。不要添加翅膀、光环或任何天使元素。`
    const taskId = await imageGenImage(prompt, mainPhoto)
    generatingText.value = '正在勾勒 TA 的轮廓...'
    const result = await pollImageGenImage(taskId)
    avatarResult.value = result
    initialAvatar.value = result // 保存第一版头像
  } catch (e: any) {
    genError.value = e.message || '生成失败，请稍后再试'
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
    let prompt = '调整这张宠物卡通形象，'
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
    prompt += '保持温暖柔和的卡通风格，暖色调。'

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
  try {
    const refImage = photos.value[0]?.base64 || avatarResult.value!
    const basePrompt = `基于参考图生成这只宠物的卡通全身形象，完整展示从头到尾巴的整只动物，严格保持参考图中动物的种类和外貌特征一致，温暖柔和的手绘卡通风格，暖色调，透明背景`

    const views = [
      `${basePrompt}，微微侧身坐着，身体稍微转向一侧，能看到侧脸和身体侧面，不是正面的也不是完全侧面的，全身完整包括尾巴`,
      `${basePrompt}，侧面站着，从侧面看全身站立姿势，完整展示身体和尾巴`,
      `${basePrompt}，典型动态姿势，在欢快地奔跑或跳跃，动作舒展自然充满活力，全身完整展现`,
      `${basePrompt}，身体朝右侧趴着，头在右边，全身舒展趴在地上，前爪向前自然伸展，后腿自然弯曲，尾巴完整可见`,
    ]

    const results: (string | null)[] = [null, null, null, null]

    // 并发限制为 2 个，单张失败不影响其他
    for (let batch = 0; batch < views.length; batch += 2) {
      const batchPrompts = views.slice(batch, batch + 2)
      // 用 allSettled 避免单张失败导致整批失败
      const taskIdResults = await Promise.allSettled(batchPrompts.map(p => imageGenImage(p, refImage)))
      const pollTasks = taskIdResults.map(r =>
        r.status === 'fulfilled' ? pollImageGenImage(r.value).catch(() => null) : Promise.resolve(null)
      )
      const settled = await Promise.allSettled(pollTasks)
      settled.forEach((r, j) => {
        if (r.status === 'fulfilled' && r.value) {
          results[batch + j] = r.value
        }
        cardProgress.value++
      })
    }

    const filtered = results.filter(Boolean) as string[]
    if (filtered.length === 0) {
      cardError.value = '所有视角生成失败，请重试'
      characterCards.value = []
    } else {
      // 补齐到 4 张：缺失的用已有图片填充
      const filled: string[] = []
      for (let i = 0; i < 4; i++) {
        if (results[i]) filled.push(results[i]!)
        else filled.push(filtered[i % filtered.length])
      }
      characterCards.value = filled
    }
  } catch (e: any) {
    cardError.value = e.message || '生成失败'
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
  const refImage = photos.value[0]?.base64 || avatarResult.value!
  const basePrompt = `基于参考图生成这只宠物的卡通全身形象，完整展示从头到尾巴的整只动物，严格保持参考图中动物的种类和外貌特征一致，温暖柔和的手绘卡通风格，暖色调，透明背景`

  const viewPrompts = [
    `${basePrompt}，微微侧身坐着，身体稍微转向一侧，能看到侧脸和身体侧面，不是正面的也不是完全侧面的，全身完整包括尾巴`,
    `${basePrompt}，侧面站着，从侧面看全身站立姿势，完整展示身体和尾巴`,
    `${basePrompt}，典型动态姿势，在欢快地奔跑或跳跃，动作舒展自然充满活力，全身完整展现`,
    `${basePrompt}，身体朝右侧趴着，头在右边，全身舒展趴在地上，前爪向前自然伸展，后腿自然弯曲，尾巴完整可见`,
  ]

  try {
    for (const i of selectedPerspectives.value) {
      try {
        const prompt = `${viewPrompts[i]}。${tunePrompt.value.trim()}`
        const taskId = await imageGenImage(prompt, characterCards.value[i] || refImage)
        const result = await pollImageGenImage(taskId)
        characterCards.value[i] = result
      } catch {
        // 单个视角失败不影响其他
      }
    }
  } catch (e: any) {
    tuneGenError.value = e.message || '生成失败'
  }

  tuneMode.value = null
  tunePrompt.value = ''
  selectedPerspectives.value = []
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
  const prompt = `将参考图中的宠物完整地放在以下场景中：${sceneDesc}。保留参考图中宠物的所有特征（毛色、体型、姿势、细节），宠物在画面中最多占四分之一，是画面中一个精致小巧的身影，自然融入场景之中。场景环绕包裹在它周围，整体温暖明亮的插画风格，柔和色调，画面安全温馨美好`

  try {
    const taskId = await imageGenImage(prompt, refCard)
    const result = await pollImageGenImage(taskId)
    return result
  } catch {
    return null
  }
}

async function handleComplete() {
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
