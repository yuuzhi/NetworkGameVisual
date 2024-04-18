import { createStore } from 'vuex'

export default createStore({
  state: {
    totalUserCount: 0
  },
  getters: {},
  mutations: {
    SetTotalUserCount (state, count) {
      state.totalUserCount = count
    }
  },
  actions: {},
  modules: {}
})
