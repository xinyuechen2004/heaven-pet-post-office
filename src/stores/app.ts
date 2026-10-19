import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateAiText } from '../utils/textApi'
import { cropDarkFrame, imageGenImage, pollImageGenImage } from '../utils/imageApi'

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
  'post-office': '一间坐落在云边的小木邮局，门口挂着小小的铜铃，窗内亮着暖黄色灯光，四周有柔软云朵和清澈天空',
  'cloud-post-office': '云边的小邮局，木制的小房子坐落在软绵绵的云朵上，温暖的阳光透过云层洒下金色光芒',
  'star-lighthouse': '星星下的灯塔，蓝紫色夜空清透明亮，灯塔发出温暖的橘黄色光芒，海浪轻柔，整体安心治愈',
  'flower-path': '开满花的小路，两边是温柔色彩的花朵，阳光透过花瓣洒下斑驳光影，小路延伸到远方',
  'moon-station': '月光车站，浅蓝紫夜色里有暖黄色站灯，周围是安静田野和微光萤火虫，温柔明亮，不阴森',
  'glass-lake': '玻璃般的湖边，水面平静如镜倒映着天空，湖边有小野花和柔软的青草，阳光温暖',
  'sunny-windowsill': '晒太阳的窗台，温暖的阳光洒满木制窗台，窗外是温柔的花园景色，安静惬意',
  'windchime-garden': '风铃花园，挂着彩色玻璃风铃，微风吹过时轻轻摇曳，花园里开满温柔色彩的花朵',
  'star-boat': '星星小船，一艘小木船漂浮在倒映星空的湖面上，船里装着发光的星星，夜色清透柔和，温柔宁静',
  'forest-mailbox': '森林中的小邮筒，阳光透过树叶洒下斑驳光影，一个可爱的邮筒静静立在林间空地，周围有小蘑菇和野花，温暖明亮',
}

const SCENE_COMPOSITIONS: Record<string, string> = {
  'warm-meadow': '宠物在画面左下角小小地侧身趴在草地里，像正在晒太阳；不要看镜头',
  'post-office': '宠物在画面右下角的小邮局门边安静坐着，像刚把信送到；不要看镜头',
  'forest-mailbox': '宠物在画面左下角靠近邮筒闻一朵小花，身体很小，森林占据绝大部分画面',
  'star-lighthouse': '宠物在画面左下角背对或侧对镜头坐着看远处灯塔和海面，像一个小小剪影',
  'flower-path': '宠物在画面右下角沿花路向远处慢慢走，环境和道路占据绝大部分画面',
  'moon-station': '宠物在画面左下角的站台长椅旁安静坐着，月光车站是画面主体',
  'glass-lake': '宠物在画面右下角湖边低头看水面倒影，湖水和远景占据绝大部分画面',
  'sunny-windowsill': '宠物在画面左下角窗台一端小小地蜷卧晒太阳，窗外花园是画面主体',
  'windchime-garden': '宠物在画面右下角花丛边抬头看风铃，花园占据绝大部分画面',
  'star-boat': '宠物小小地坐在画面左下方的小船一角，望向湖面和星空，不要看镜头',
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

const SCENE_TEXTS: Record<string, string> = {
  'warm-meadow': '草叶被太阳晒得暖暖的，我找了一块最柔软的地方趴下来，听风从耳边慢慢走过去。',
  'post-office': '小邮局的铜铃轻轻响了一声，我在窗边看着信封一封封盖上邮戳，也认真挑了一张寄给你。',
  'forest-mailbox': '森林里的邮筒旁长了几朵小蘑菇，我绕着它们闻了好一会儿，才想起还要把今天的见闻寄出去。',
  'star-lighthouse': '灯塔的光一圈圈掠过海面，我坐在高处看了很久，远处的小船像慢慢移动的星星。',
  'flower-path': '这条小路两边都是花，走过时花瓣会轻轻碰到我。我挑了开得最好的一段路，想让你也看看。',
  'moon-station': '月光车站只有一盏暖灯，我坐在长椅边听远处的车轮声，夜风很轻，一点也不冷。',
  'glass-lake': '湖面像一块安静的玻璃，我低头时看见自己的影子也在看我，水边的小草被风吹得一晃一晃。',
  'sunny-windowsill': '今天的窗台刚好晒到太阳，我换了好几个姿势，最后把最暖的位置留给了尾巴。',
  'windchime-garden': '花园里的风铃一响，我就抬头找声音从哪里来。追了半天，才发现风比我跑得快。',
  'star-boat': '小船载着几颗发亮的星星慢慢往前走，水面没有浪，我靠着船边看它们一颗颗倒映下来。',
}

function buildFallbackPostcardText(petName = 'TA', illustration = 'warm-meadow') {
  const sceneText = SCENE_TEXTS[illustration] || SCENE_TEXTS['warm-meadow']
  return `我是${petName}。${sceneText}我在这里好好旅行，也会把遇见的小事慢慢写给你。`
}

function bestPerspectiveForScene(illustration: string): number {
  const mapping: Record<string, number> = {
    'warm-meadow': 3,
    'post-office': 0,
    'forest-mailbox': 1,
    'star-lighthouse': 1,
    'flower-path': 2,
    'moon-station': 0,
    'glass-lake': 1,
    'sunny-windowsill': 3,
    'windchime-garden': 2,
    'star-boat': 0,
  }
  return mapping[illustration] ?? 0
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
  const postcardGenerationInProgress = ref(false)

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
        // 旧版本曾把图片生成失败的空卡直接保存；这些并不是有效来信。
        postcards.value = (data.postcards || []).filter((p: Postcard) => p.sceneImage && p.frontText?.trim())
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

  function createPostcardDraft(): Postcard {
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
    return postcard
  }

  function postcardTextPrompt(postcard: Postcard): string {
    const pet = petProfile.value!
    const traits = pet.personalityTags.length > 0 ? pet.personalityTags.join('、') : '乖巧可爱'
    const recentStars = stars.value.slice(-3).map(s => s.text.trim()).filter(Boolean)
    const previousTexts = postcards.value.slice(-3).map(p => p.frontText.trim()).filter(Boolean)
    const memoryContext = recentStars.length > 0
      ? `主人最近写下过这些片段：${recentStars.map((text, index) => `${index + 1}. ${text}`).join('；')}。可以自然回应其中一个细节，但不要逐句复述。`
      : '主人还没有写下新的星星，这封信只记录旅途中的一个具体小发现。'
    const avoidContext = previousTexts.length > 0
      ? `以下是最近来信，请避免重复它们的场景、句式和安慰话：${previousTexts.join('｜')}`
      : ''

    return `你是一只名叫“${pet.name}”的${pet.type}，性格是${traits}。你正在“${postcard.location}”旅行，要给远方的主人写一张明信片。

${memoryContext}
${avoidContext}

请写70—120字的中文正文：
- 第一人称，只写一个具体、可想象的小场景或动作
- 符合${pet.type}的真实习性和“${traits}”的性格
- 克制、自然、有生活感，不堆砌“温暖、安心、美好”等形容词
- 让主人感到TA在继续旅行和生活，但不要说教，不要要求主人“放下”或“好起来”
- 不以“亲爱的主人”开头，不出现死亡、离别、天堂、等你来，也不邀请主人前往
- 不要复用“这里很安静、光也很暖、慢慢走走看看、请放心”等模板句
- 只输出正文，不加标题、引号或说明`
  }

  async function createPostcardText(postcard: Postcard): Promise<string> {
    const pet = petProfile.value
    if (!pet) throw new Error('还没有完成宠物建档')
    try {
      const text = await generateAiText(postcardTextPrompt(postcard))
      const cleaned = text.trim().replace(/[【（]邮戳位置[】）]/g, '')
      return cleaned || buildFallbackPostcardText(pet.name, postcard.illustration)
    } catch {
      return buildFallbackPostcardText(pet.name, postcard.illustration)
    }
  }

  async function generatePostcardText(postcardId: string): Promise<void> {
    const postcard = postcards.value.find(p => p.id === postcardId)
    if (!postcard || !petProfile.value) return

    postcard.frontText = await createPostcardText(postcard)
    saveToStorage()
  }

  async function createPostcardScene(postcard: Postcard): Promise<string> {
    const cards = petProfile.value?.characterCards || []
    if (cards.length === 0) throw new Error('缺少宠物形象资料，暂时无法生成来信')
    const refCard = cards[bestPerspectiveForScene(postcard.illustration)] || cards[0]
    const sceneDesc = SCENE_PROMPTS[postcard.illustration] || '在温暖明亮的自然场景中'
    const composition = SCENE_COMPOSITIONS[postcard.illustration] || '宠物在画面左下角做一个自然的小动作，不要看镜头'
    const prompt = `生成一张完整横向4:3旅行明信片插画，画面铺满整个画布：${sceneDesc}。这是一张“宠物去了哪里、在那里怎么玩”的环境叙事图，不是宠物肖像。风景和空间必须是绝对主体，占画面约90%；宠物只是角落里偶然被看见的小小身影，占整个画面约6%-10%，完整全身，不得超过12%。具体构图：${composition}。宠物必须远离画面中心，不得放大，不得正面凝视镜头，不得用宠物身体遮挡主要风景。参考图只用于保持同一只宠物的脸型、体型、年龄感、毛色、花纹、眼睛颜色、耳朵和真实配饰。整体为清透、明亮、柔和的二维半写实动画电影插画，有自然毛发层次和丰富环境细节，但明确不是摄影照片或3D渲染。构图要有明显的近景、中景和远景，让主人第一眼先看到TA旅行的地方，第二眼才在角落发现TA。禁止宠物特写、巨大正脸、居中宠物、直视镜头、摄影棚构图、黑底、留白、边框、竖图嵌入横图、文字、水印、翅膀、光环、遗照感、阴森感、恐怖感、宠物贴纸、白色描边、喜羊羊式萌宠风格、3D塑料感。`
    const taskId = await imageGenImage(prompt, refCard)
    const result = await pollImageGenImage(taskId)
    return cropDarkFrame(result)
  }

  async function generateCompletePostcard(): Promise<Postcard> {
    if (postcardGenerationInProgress.value) throw new Error('明信片正在路上')
    postcardGenerationInProgress.value = true
    try {
      const postcard = createPostcardDraft()
      const [frontText, rawScene] = await Promise.all([
        createPostcardText(postcard),
        createPostcardScene(postcard),
      ])
      const sceneImage = await compressImage(rawScene, 768)
      if (!sceneImage) throw new Error('明信片图片没有生成成功，请稍后再试')
      postcard.frontText = frontText
      postcard.sceneImage = sceneImage
      postcards.value.push(postcard)
      unreadPostcardId.value = postcard.id
      saveToStorage()
      return postcard
    } finally {
      postcardGenerationInProgress.value = false
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

  function shouldGeneratePostcard(): boolean {
    if (!onboardingCompleted.value || postcardGenerationInProgress.value) return false

    const pcCount = postcards.value.length
    const petDate = petProfile.value?.createdAt
      ? new Date(petProfile.value.createdAt).getTime()
      : Date.now()
    const daysSincePet = (Date.now() - petDate) / (1000 * 60 * 60 * 24)

    // 第1天：建档后立刻来
    if (pcCount === 0) return true

    // 第2天：第二张
    if (pcCount === 1 && daysSincePet >= 2) return true

    // 第4天：第三张
    if (pcCount === 2 && daysSincePet >= 4) return true

    if (pcCount >= 3) {
      const last = postcards.value.reduce((a, b) =>
        new Date(a.createdAt) > new Date(b.createdAt) ? a : b
      )
      const daysSinceLast = (Date.now() - new Date(last.createdAt).getTime()) / (1000 * 60 * 60 * 24)

      // 第5-20天：每隔3-5天随机
      if (daysSincePet <= 20) {
        if (daysSinceLast < 3) return false
        if (daysSinceLast >= 5) return true
        if (Math.random() < (daysSinceLast - 3) / 2) return true
      }
      // 第21天以后：每隔5-7天随机
      else if (daysSincePet <= 30) {
        if (daysSinceLast < 5) return false
        if (daysSinceLast >= 7) return true
        if (Math.random() < (daysSinceLast - 5) / 2) return true
      }
      // 30天以后：每隔7-10天随机
      else {
        if (daysSinceLast < 7) return false
        if (daysSinceLast >= 10) return true
        if (Math.random() < (daysSinceLast - 7) / 3) return true
      }
    }

    return false
  }

  function resetAllData() {
    localStorage.removeItem('heaven-diary')
    petProfile.value = null
    stars.value = []
    postcards.value = []
    onboardingCompleted.value = false
    unreadPostcardId.value = null
  }

  loadFromStorage()

  return {
    petProfile,
    stars,
    postcards,
    onboardingCompleted,
    unreadPostcardId,
    postcardGenerationInProgress,
    hasPet,
    starCount,
    favoritePostcards,
    unreadPostcard,
    savePetProfile,
    addStar,
    generateCompletePostcard,
    toggleFavorite,
    markPostcardRead,
    updatePostcardScene,
    shouldGeneratePostcard,
    generatePostcardText,
    loadFromStorage,
    compressImage,
    resetAllData,
  }
})
