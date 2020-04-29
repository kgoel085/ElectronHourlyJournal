<template>
  <v-card>
    <v-card-title class="primary white--text">
      <span class="text-sm-center">{{selectedDate}}</span>
    </v-card-title>
    <v-card-text>
      <!-- Config Row -->
      <v-layout row wrap>
        <v-flex class="grow">
          <v-select :items="hoursSelectPickerArr" item-text="title" item-value="value" v-model="startingHour" label="Day starts at" class="ma-2" :key="startingHour"></v-select>
        </v-flex>
        <v-flex class="grow">
          <v-select :items="hoursSelectPickerArr" item-text="title" item-value="value"  v-model="endHour" label="Day ends at" class="ma-2" :key="endHour"></v-select>
        </v-flex>
        <v-flex class="grow">
          <v-select :items="intervals" v-model="selectedInterval" label="Interval for blocks" class="ma-2"></v-select>
        </v-flex>
      </v-layout>

      <v-layout row wrap>
        <template v-if="!canStartDay">
          <v-flex xs12>
            <v-alert type='info' :value="true" full-width>
              Please select all the fields above to start
            </v-alert>
          </v-flex>
        </template>
        <template v-else>
          <v-flex xs12>
            <v-list three-line>
              <v-list-item v-for="block in timeBlocks" :key="block.startVal">
                <v-list-item-content>
                  <v-list-item-title v-text="block.title"></v-list-item-title>
                  <v-list-item-subtitle>
                    <v-textarea v-model="block.val"></v-textarea>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-flex>
        </template>
      </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data: () => ({
    timeBlocks: [],
    intervals: [5, 10, 15, 30],
    startingHour: null,
    endHour: null,
    selectedInterval: null
  }),
  computed: {
    ...mapGetters([
      'currentDate'
    ]),

    // Current formatted date
    selectedDate () {
      return this.getFormat(this.currentDate)
    },

    // Hours select picker value
    hoursSelectPickerArr () {
      let startTime = new Date()
      startTime.setHours(0, 0, 0, 0)

      const endTime = new Date()
      endTime.setHours(23, 59, 59, 999)

      const returnArr = []
      while (startTime.getTime() < endTime.getTime()) {
        const endBlock = new Date()
        endBlock.setHours(startTime.getHours() + 1, startTime.getMinutes(), startTime.getSeconds(), startTime.getMilliseconds())

        returnArr.push({ title: endBlock.toLocaleTimeString(), value: endBlock.getHours() })
        startTime = endBlock
      }

      return returnArr
    },

    // Check if all the values are present to star a day
    canStartDay () {
      if (this.startingHour && this.endHour && this.selectedInterval) {
        this.createTimeBlocks()
        return true
      }
      return false
    }
  },
  methods: {
    // Create format from provided date
    getFormat (dateString = null, formatArr = []) {
      if (!formatArr || formatArr.length === 0) formatArr = ['m', '/', 'd', '/', 'Y']

      const returnArr = []
      const dateFormats = this.getFormatsFromDateObj(new Date(dateString))
      formatArr.forEach(format => {
        const formatValObj = dateFormats.find(obj => obj.format === format)
        if (formatValObj) returnArr.push(formatValObj.val)
        else returnArr.push(format)
      })

      return returnArr.join('')
    },

    // Get date values for constant date format variables
    getFormatsFromDateObj (dateObj = null) {
      const returnArr = []
      const formatArr = [
        { format: 'y', method: 'getFullYear', val: null },
        { format: 'm', method: 'getMonth', val: null },
        { format: 'd', method: 'getDate', val: null },
        { format: 'Y', method: 'getFullYear', val: null },
        { format: 'M', method: 'getMonth', val: null },
        { format: 'D', method: 'getDate', val: null }
      ]

      formatArr.forEach(formatObj => {
        const { format, method } = formatObj
        const dateVal = dateObj[method]()

        returnArr.push({ format, val: dateVal })
      })

      return returnArr
    },

    // Create time slots based on the provided configurations
    createTimeBlocks () {
      this.timeBlocks = [] // Reset time blocks

      // Validate values
      if (this.startingHour > this.endHour || this.endHour < this.startingHour) {
        this.endHour = null
        this.endHour = this.startingHour + 1
      }

      console.log(this.startingHour, this.endHour)

      // Set the starting & end limits
      let start = new Date()
      start.setHours(this.startingHour, 0, 0, 0)

      const end = new Date()
      end.setHours(this.endHour, 59, 59, 999)

      while (start.getTime() <= end.getTime()) {
        // Create time interval blocks
        const endBlock = new Date()
        endBlock.setHours(start.getHours() + 1, start.getMinutes(), start.getSeconds(), start.getMilliseconds())
        const blockId = `${start.getTime()}_${endBlock.getTime()}`

        while (start.getTime() < endBlock.getTime()) {
          const intervalDate = new Date()
          intervalDate.setHours(start.getHours(), start.getMinutes() + this.selectedInterval, start.getSeconds(), start.getMilliseconds())
          this.timeBlocks.push({ blockId, startVal: start.getTime(), endVal: intervalDate.getTime(), title: `${start.toLocaleTimeString()} - ${intervalDate.toLocaleTimeString()}`, val: null })

          start = intervalDate
        }
        start = endBlock
      }
    }
  },
  mounted () {
    // this.createTimeBlocks()
  }
}
</script>

<style>

</style>
