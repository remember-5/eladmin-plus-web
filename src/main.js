import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css'

import Element from 'element-ui'

// 数据字典
import dict from './components/Dict'

// 权限指令
import checkPer from '@/utils/permission'
import permission from './components/Permission'
import './assets/styles/element-variables.scss'
// global css
import './assets/styles/index.scss'

import App from './App'
import store from './store'
import router from './router/routers'

import './assets/icons' // icon
import './router/index' // permission control
import 'echarts-gl'
// 代码高亮
import VueHighlightJS from 'vue-highlightjs'
import '@/assets/styles/atom-one-dark.scss'

Vue.use(checkPer)
Vue.use(permission)
Vue.use(VueHighlightJS)
Vue.use(dict)
Vue.use(Element, {
  size: Cookies.get('size') || 'small' // set element-ui default size
})

Vue.config.productionTip = false
Vue.prototype.$baseUrl = process.env.VUE_APP_BASE_API

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
