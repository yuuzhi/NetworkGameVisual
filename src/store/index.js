import { createStore } from 'vuex'

export default createStore({
  state: {
    totalUserCount: 0,
    EdgeData: null
  },
  getters: {},
  mutations: {
    SetTotalUserCount (state, count) {
      state.totalUserCount = count
    },
    SetEdgeData (state, data) {
      state.EdgeData = data
    }
  },
  actions: {},
  modules: {}
})
