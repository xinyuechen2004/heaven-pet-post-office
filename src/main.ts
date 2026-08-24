// 兼容低版本浏览器（Chrome < 99 / Safari < 16）不支持 CanvasRenderingContext2D.roundRect 的问题
// 该 polyfill 必须在任何 canvas 使用之前执行，因此放在最顶部

import 'canvas-roundrect-polyfill'

import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// AI-DO-NOT-MODIFY-THIS-CODE-START
app.config.errorHandler = (e) => {
  console.error(e);
  window?.aegisV2?.error(e);
}
// AI-DO-NOT-MODIFY-THIS-CODE-END

app.mount('#app')
