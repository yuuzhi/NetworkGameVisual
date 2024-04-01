import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ECharts from 'vue-echarts' // 在 webpack 环境下指向 components/ECharts.vue
import './assets/css/all.css'
import 'echarts/lib/component/dataZoom/history'
import ngraph from 'ngraph.graph'
import * as echarts from 'echarts'
// 手动引入 ECharts 各模块来减小打包体积
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/tooltip'

import axios from 'axios'

// axios.defaults.baseURL = '/api'
// axios.defaults.headers.post['Content-Type'] = 'application/json'

// 如果需要配合 ECharts 扩展使用，只需要直接引入扩展包即可
// 以 ECharts-GL 为例：
// 需要安装依赖：npm install --save echarts-gl，并添加如下引用
// import 'echarts-gl'

// 注册组件后即可使用
const app = createApp(App)
app.use(store)
  .use(router)
  .use(ElementPlus)
  .use(ECharts)
  .use(ngraph)
app.component('vchart', ECharts)
app.config.globalProperties.$axios = axios
app.mount('#app')
