import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as echarts from 'echarts'
import VCharts from 'vue-echarts' // 在 webpack 环境下指向 components/ECharts.vue
import './assets/css/all.css'
import ngraph from 'ngraph.graph'
import roam from './components/processingMap/themes/roma.json'
import axios from 'axios'
import ecStat from 'echarts-stat'

require('echarts/lib/component/visualMap')

// 注册组件后即可使用
const app = createApp(App)
app.use(store)
  .use(router)
  .use(ElementPlus)
  .use(VCharts)
  .use(ngraph)
// .use(echarts)
app.config.globalProperties.$echarts = echarts
app.component('vchart', VCharts)
echarts.registerTheme('roam', roam)
app.config.globalProperties.$axios = axios
app.mount('#app')
