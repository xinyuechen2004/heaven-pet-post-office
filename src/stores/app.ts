import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateAiText } from '../utils/textApi'

export interface PetProfile {
  name: string
  type: string
  personalityTags: string[]
  avatar: string | null
  characterCards: string[]
  features: PetFeatures | null
  createdAt: string
}

export interface PetFeatures {
  furColor: string
  pattern: string
  earShape: string
  eyeColor: string
  bodyType: string
  specialFeatures: string
}

export interface Star {
  id: string
  type: 'missing' | 'little-thing' | 'unsaid'
  text: string
  photo: string | null
  createdAt: string
  color: string
}

export interface Postcard {
  id: string
  illustration: string
  frontText: string
  location: string
  date: string
  stamp: string
  isFavorite: boolean
  createdAt: string
  sceneImage: string | null
}

export const SCENE_PROMPTS: Record<string, string> = {
  'warm-meadow': '在温暖的草地上，阳光洒落绿草如茵，远处有温柔的山丘轮廓，几朵小花点缀其间，明亮安全',
  'cloud-post-office': '云边的小邮局，木制的小房子坐落在软绵绵的云朵上，温暖的阳光透过云层洒下金色光芒',
  'star-lighthouse': '星星下的灯塔，夜空深蓝星光璀璨，灯塔发出温暖的橘黄色光芒，海浪轻柔',
  'flower-path': '开满花的小路，两边是温柔色彩的花朵，阳光透过花瓣洒下斑驳光影，小路延伸到远方',
  'moon-station': '月光下的车站，银色月光洒在站台上，周围是安静的田野，萤火虫在微微发光',
  'glass-lake': '玻璃般的湖边，水面平静如镜倒映着天空，湖边有小野花和柔软的青草，阳光温暖',
  'sunny-windowsill': '晒太阳的窗台，温暖的阳光洒满木制窗台，窗外是温柔的花园景色，安静惬意',
  'windchime-garden': '风铃花园，挂着彩色玻璃风铃，微风吹过时轻轻摇曳，花园里开满温柔色彩的花朵',
  'star-boat': '星星小船，一艘小木船漂浮在倒映星空的湖面上，船里装着发光的星星，温柔宁静',
  'forest-mailbox': '森林中的小邮筒，阳光透过树叶洒下斑驳光影，一个可爱的邮筒静静立在林间空地，周围有小蘑菇和野花，温暖明亮',
}

const POSTCARD_TEMPLATES: Omit<Postcard, 'id' | 'isFavorite' | 'date' | 'createdAt' | 'sceneImage'>[] = [
  { illustration: 'warm-meadow', frontText: '', location: '暖暖草地', stamp: '草地邮局' },
  { illustration: 'post-office', frontText: '', location: '小邮局', stamp: '小邮局' },
  { illustration: 'forest-mailbox', frontText: '', location: '森林邮筒', stamp: '森林邮局' },
  { illustration: 'star-lighthouse', frontText: '', location: '星星灯塔', stamp: '灯塔邮局' },
  { illustration: 'flower-path', frontText: '', location: '花开小路', stamp: '花信邮局' },
  { illustration: 'moon-station', frontText: '', location: '月光车站', stamp: '月光邮局' },
  { illustration: 'glass-lake', frontText: '', location: '玻璃湖边', stamp: '湖水邮局' },
  { illustration: 'sunny-windowsill', frontText: '', location: '晒太阳窗台', stamp: '阳光邮局' },
  { illustration: 'windchime-garden', frontText: '', location: '风铃花园', stamp: '风铃邮局' },
  { illustration: 'star-boat', frontText: '', location: '星星小船', stamp: '星船邮局' },
]

const DATA_VERSION = 11

function buildFallbackPostcardText(petName = 'TA', petType = '宠物', sceneName = '远方') {
  return `我是${petName}，今天到了${sceneName}。这里很安静，光也很暖。我像一只小小的${petType}一样慢慢走走看看，偶尔停下来闻一闻风。请放心，我在这里过得很好，也会把一路上的小事寄给你。`
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function compressImage(dataUrl: string, maxSize: number = 512): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > height) {
        if (width > maxSize) { height *= maxSize / width; width = maxSize }
      } else {
        if (height > maxSize) { width *= maxSize / height; height = maxSize }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(dataUrl); return }
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export const useAppStore = defineStore('app', () => {
  const petProfile = ref<PetProfile | null>(null)
  const stars = ref<Star[]>([])
  const postcards = ref<Postcard[]>([])
  const onboardingCompleted = ref(false)
  const unreadPostcardId = ref<string | null>(null)

  const hasPet = computed(() => !!petProfile.value)
  const starCount = computed(() => stars.value.length)
  const favoritePostcards = computed(() => postcards.value.filter(p => p.isFavorite))
  const unreadPostcard = computed(() => {
    if (!unreadPostcardId.value) return null
    return postcards.value.find(p => p.id === unreadPostcardId.value) || null
  })

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem('heaven-diary')
      if (saved) {
        const data = JSON.parse(saved)
        // 版本不匹配 → 清除旧数据，重新建档
        if (data.dataVersion !== DATA_VERSION) {
          localStorage.removeItem('heaven-diary')
          return
        }
        petProfile.value = data.petProfile || null
        stars.value = data.stars || []
        postcards.value = data.postcards || []
        onboardingCompleted.value = data.onboardingCompleted || false
        unreadPostcardId.value = data.unreadPostcardId || null
      }
    } catch {}
  }

  function saveToStorage() {
    try {
      // 只存储核心数据，不存 base64 图片
      const profile = petProfile.value ? {
        name: petProfile.value.name,
        type: petProfile.value.type,
        personalityTags: petProfile.value.personalityTags,
        avatar: petProfile.value.avatar,
        characterCards: petProfile.value.characterCards,
        features: petProfile.value.features,
        createdAt: petProfile.value.createdAt,
      } : null

      const starsCore = stars.value.map(s => ({
        id: s.id, type: s.type, text: s.text, createdAt: s.createdAt, color: s.color,
        // 不存 photo base64 到主存储
      }))

      localStorage.setItem('heaven-diary', JSON.stringify({
        dataVersion: DATA_VERSION,
        petProfile: profile,
        stars: starsCore,
        postcards: postcards.value,
        onboardingCompleted: onboardingCompleted.value,
        unreadPostcardId: unreadPostcardId.value,
      }))
    } catch {
      // quota exceeded, skip persistence gracefully
    }
  }

  function savePetProfile(profile: PetProfile) {
    petProfile.value = profile
    onboardingCompleted.value = true
    saveToStorage()
  }

  function addStar(star: Omit<Star, 'id' | 'createdAt'>) {
    const newStar: Star = {
      ...star,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    stars.value.push(newStar)
    saveToStorage()
    return newStar
  }

  function generatePostcard(): Postcard {
    const usedIllustrations = postcards.value.map(p => p.illustration)
    const available = POSTCARD_TEMPLATES.filter(t => !usedIllustrations.includes(t.illustration))
    const template = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : POSTCARD_TEMPLATES[Math.floor(Math.random() * POSTCARD_TEMPLATES.length)]

    const postcard: Postcard = {
      id: generateId(),
      ...template,
      isFavorite: false,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      sceneImage: null,
    }
    postcards.value.push(postcard)
    unreadPostcardId.value = postcard.id
    saveToStorage()
    return postcard
  }

  async function generatePostcardText(postcardId: string): Promise<void> {
    const postcard = postcards.value.find(p => p.id === postcardId)
    if (!postcard || !petProfile.value) return

    const pet = petProfile.value
    const traits = pet.personalityTags.length > 0
      ? pet.personalityTags.join('、')
      : '乖巧可爱'
    const sceneName = postcard.location

    const prompt = `你是一只名叫"${pet.name}"的${pet.type}。你的性格是${traits}。你现在在"${sceneName}"这个地方旅行，正在写一张明信片给远方的主人。

请以第一人称写这张明信片的文字（最多150字，留出邮戳位置）：
- 结合${pet.type}的习性来写（比如猫会爬高、追逐光点、揣手；狗会撒欢跑、摇尾巴、闻来嗅去；兔子会蹦跳、耳朵灵敏等）
- 体现出"${traits}"的性格特点
- 描述在这个地方的所见所感
- 文风克制平实，简洁自然，不要过多修饰
- 整体温暖明亮、安心平静，让主人知道你过得很好，帮助主人感到放心和释然
- 不要以"亲爱的主人"开头，不要出现"你来了"、"等你来"等邀请主人的话语
- 不要出现任何伤感、思念、遗憾的话语，不要让主人想起离别`

    try {
      const text = await generateAiText(prompt)
      const cleaned = text.trim().replace(/[【（]邮戳位置[】）]/g, '')
      postcard.frontText = cleaned || buildFallbackPostcardText(pet.name, pet.type, sceneName)
      saveToStorage()
    } catch {
      postcard.frontText = buildFallbackPostcardText(pet.name, pet.type, sceneName)
      saveToStorage()
    }
  }

  function toggleFavorite(postcardId: string) {
    const card = postcards.value.find(p => p.id === postcardId)
    if (card) {
      card.isFavorite = !card.isFavorite
      saveToStorage()
    }
  }

  function markPostcardRead(postcardId: string) {
    if (unreadPostcardId.value === postcardId) {
      unreadPostcardId.value = null
      saveToStorage()
    }
  }

  function updatePostcardScene(postcardId: string, sceneImage: string) {
    const card = postcards.value.find(p => p.id === postcardId)
    if (card) {
      card.sceneImage = sceneImage
      saveToStorage()
    }
  }

  function checkAndGeneratePostcard(): Postcard | null {
    if (!onboardingCompleted.value) return null

    const pcCount = postcards.value.length
    const petDate = petProfile.value?.createdAt
      ? new Date(petProfile.value.createdAt).getTime()
      : Date.now()
    const daysSincePet = (Date.now() - petDate) / (1000 * 60 * 60 * 24)

    // 第1天：建档后立刻来
    if (pcCount === 0) return generatePostcard()

    // 第2天：第二张
    if (pcCount === 1 && daysSincePet >= 2) return generatePostcard()

    // 第4天：第三张
    if (pcCount === 2 && daysSincePet >= 4) return generatePostcard()

    if (pcCount >= 3) {
      const last = postcards.value.reduce((a, b) =>
        new Date(a.createdAt) > new Date(b.createdAt) ? a : b
      )
      const daysSinceLast = (Date.now() - new Date(last.createdAt).getTime()) / (1000 * 60 * 60 * 24)

      // 第5-20天：每隔3-5天随机
      if (daysSincePet <= 20) {
        if (daysSinceLast < 3) return null
        if (daysSinceLast >= 5) return generatePostcard()
        if (Math.random() < (daysSinceLast - 3) / 2) return generatePostcard()
      }
      // 第21天以后：每隔5-7天随机
      else if (daysSincePet <= 30) {
        if (daysSinceLast < 5) return null
        if (daysSinceLast >= 7) return generatePostcard()
        if (Math.random() < (daysSinceLast - 5) / 2) return generatePostcard()
      }
      // 30天以后：每隔7-10天随机
      else {
        if (daysSinceLast < 7) return null
        if (daysSinceLast >= 10) return generatePostcard()
        if (Math.random() < (daysSinceLast - 7) / 3) return generatePostcard()
      }
    }

    return null
  }

  loadFromStorage()

  return {
    petProfile,
    stars,
    postcards,
    onboardingCompleted,
    unreadPostcardId,
    hasPet,
    starCount,
    favoritePostcards,
    unreadPostcard,
    savePetProfile,
    addStar,
    generatePostcard,
    toggleFavorite,
    markPostcardRead,
    updatePostcardScene,
    checkAndGeneratePostcard,
    generatePostcardText,
    loadFromStorage,
    compressImage,
  }
})
