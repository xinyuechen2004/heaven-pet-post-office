import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Landing from '../views/Landing.vue'

const router = createRouter({
  /* AI-DO-NOT-MODIFY-THIS-CODE-START */
  history: createWebHashHistory(import.meta.env.BASE_URL),
  /* AI-DO-NOT-MODIFY-THIS-CODE-END */
  routes: [
    {
      path: '/',
      name: 'landing',
      component: Landing,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../views/Onboarding.vue'),
    },
    {
      path: '/write-star',
      name: 'write-star',
      component: () => import('../views/WriteStar.vue'),
    },
    {
      path: '/star-box',
      name: 'star-box',
      component: () => import('../views/StarBox.vue'),
    },
    {
      path: '/postcard/:id',
      name: 'postcard-detail',
      component: () => import('../views/PostcardDetail.vue'),
    },
    {
      path: '/travel-diary',
      name: 'travel-diary',
      component: () => import('../views/TravelDiary.vue'),
    },
  ],
})

// 如果未建档，重定向到建档页
router.beforeEach((to) => {
  const isPublicPage = to.name === 'landing' || to.name === 'onboarding'
  if (isPublicPage) return

  const raw = localStorage.getItem('heaven-diary')
  if (!raw) return { name: 'onboarding' }

  try {
    const data = JSON.parse(raw)
    // 必须同时满足：建档完成 + 宠物资料存在
    if (!data.onboardingCompleted || !data.petProfile) {
      return { name: 'onboarding' }
    }
  } catch {
    return { name: 'onboarding' }
  }
})

export default router
