<template>
  <v-layout row wrap class="home">
    <!-- Date picker -->
    <v-flex xs12>
      <DatePicker></DatePicker>
    </v-flex>

    <!-- Date data -->
    <v-flex xs12>
      <TimeBlock></TimeBlock>
    </v-flex>
  </v-layout>
</template>

<script>
const TimeBlock = () => import('@/components/TimeBlock.vue')
const DatePicker = () => import('@/components/DatePicker.vue')

export default {
  name: 'Home',
  data: () => ({}),
  components: {
    TimeBlock,
    DatePicker
  }
}
</script>
