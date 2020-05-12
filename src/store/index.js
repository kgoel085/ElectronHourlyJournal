import Vue from 'vue'
import Vuex from 'vuex'
import { ipcRenderer } from 'electron'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loadingData: false,
    currentDate: new Date().toISOString().substr(0, 10), // Current Date for the calender
    currentDateData: null // Stores the saved data for the selected date
  },
  getters: {
    currentDate: state => state.currentDate, // Get current date
    currentDateData: state => state.currentDateData, // Get current date saved data
    loadingState: state => state.loadingData // Returns the state whether data loaded or not
  },
  mutations: {
    // Set the current date
    setCurrentDate (state, date = null) {
      if (date) {
        state.currentDate = date
        state.currentDateData = null
      }
    },

    // Store the saved data
    setCurrentDateData (state, data = {}) {
      if (data && data.constructor === Object && Object.keys(data).length > 0) {
        state.currentDateData = data
        state.loadingData = false
      } else state.currentDateData = null
    },

    // Shows a loader for loading data
    setLoadingDataState (state, currentState = false) {
      state.loadingData = currentState
    }
  },
  actions: {
    // Save the user data in a file
    saveUserData ({ commit }, userData = []) {
      commit('setLoadingDataState', true)
      ipcRenderer.send('save:data', userData)
    },

    fetchUserData ({ commit }, dataDate = null) {
      commit('setLoadingDataState', true)
      ipcRenderer.send('fetch:data', dataDate)
    }
  },
  modules: {}
})
