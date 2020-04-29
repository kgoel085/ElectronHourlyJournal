<template>
  <v-app>
    <v-content>
      <v-container fluid>
        <v-layout row wrap>
          <v-flex xs12>
            <router-view class="ma-1"></router-view>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',

  components: {},

  data: () => ({
    //
  })
}
</script>
