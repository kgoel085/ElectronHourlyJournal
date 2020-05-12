<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <v-layout row wrap>
          <v-flex xs12>
            <router-view class="ma-1"></router-view>
          </v-flex>
        </v-layout>
        <v-overlay :value="loadingState">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapGetters } from 'vuex'
export default {
  name: 'App',

  components: {},

  data: () => ({
    //
  }),
  computed: {
    ...mapGetters([
      'loadingState'
    ])
  },
  mounted () {
    // Server saved the data
    ipcRenderer.on('data:saved', (event, date) => {
      this.$store.dispatch('fetchUserData', date)
      this.$store.commit('setLoadingDataState', false)
    })
    ipcRenderer.on('data:fetched', (event, data) => {
      if (data && data !== 'undefined') {
        this.$store.commit('setCurrentDateData', (data && data.constructor === Array && data.length > 0) ? data[0] : data)
      }
      this.$store.commit('setLoadingDataState', false)
    })
  }
}
</script>
