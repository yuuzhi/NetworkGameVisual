import { createStore } from 'vuex'

export default createStore({
  state: {
    sankeyMap: false
  },
  getters: {},
  mutations: {
    changeSankeyMap (state) {
      state.sankeyMap = true
    }
  },
  actions: {},
  modules: {}
})
