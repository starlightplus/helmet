import { createApp } from 'vue'

import App from './views/App.vue'

// 初始化AOS动画库
import AOS from 'aos'
import 'aos/dist/aos.css'

const app = createApp(App)

// 在应用挂载后初始化AOS
app.mount('#app')
AOS.init({
  duration: 800,
  easing: 'ease-out-cubic',
  once: true,
  offset: 120
})