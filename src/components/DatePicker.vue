<template>
  <v-card flat>
    <v-card-text>
      <v-date-picker landscape reactive full-width show-current v-model="currentSelectedDate"></v-date-picker>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Home',
  data: () => ({}),
  computed: {
    // Get current date
    ...mapGetters([
      'currentDate'
    ]),

    // Manage the user selected date
    currentSelectedDate: {
      get () {
        return this.currentDate
      },
      set (val) {
        this.$store.commit('setCurrentDate', val)
      }
    }
  }
}
</script>

<style>

</style>
