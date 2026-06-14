import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { MotionPlugin } from '@vueuse/motion'
import './style.css'

// 初始化AOS动画库
import AOS from 'aos'
import 'aos/dist/aos.css'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(MotionPlugin)

// 在应用挂载后初始化AOS
app.mount('#app')
AOS.init({
  duration: 800,
  easing: 'ease-out-cubic',
  once: true,
  offset: 120
})