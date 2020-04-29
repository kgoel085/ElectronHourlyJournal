import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentDate: new Date().toISOString().substr(0, 10) // Current Date for the calender
  },
  getters: {
    currentDate: state => state.currentDate // Get current date
  },
  mutations: {
    // Set the current date
    setCurrentDate (state, date = null) {
      if (date) state.currentDate = date
    }
  },
  actions: {
  },
  modules: {
  }
})
