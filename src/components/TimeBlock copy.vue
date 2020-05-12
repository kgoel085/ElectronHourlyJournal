<template>
  <v-card>
    <v-card-title class="primary white--text">
      <span class="text-sm-center">{{selectedDate}}</span>
      <v-spacer></v-spacer>
      <v-btn text class="success" v-if="canStartDay" @click="saveData">Save</v-btn>
    </v-card-title>
    <v-card-text>
      <!-- Config Row -->
      <v-layout row wrap>
        <v-flex class="grow">
          <v-select :items="hoursSelectPickerArr" item-text="title" item-value="value" v-model="currentDateData.startingHour" label="Day starts at" class="ma-2" :key="currentDateData.startingHour"></v-select>
        </v-flex>
        <v-flex class="grow">
          <v-select :items="hoursSelectPickerArr" item-text="title" item-value="value"  v-model="currentDateData.endHour" label="Day ends at" class="ma-2" :key="currentDateData.endHour"></v-select>
        </v-flex>
        <v-flex class="grow">
          <v-select :items="intervals" v-model="currentDateData.selectedInterval" label="Interval for blocks" class="ma-2"></v-select>
        </v-flex>
      </v-layout>

      <v-layout row wrap :key="selectedDate">
        {{currentDateDataObj}}
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
              <v-list-item v-for="block in currentDateData.timeBlocks" :key="block.id">
                <v-list-item-content>
                  <v-list-item-title v-text="block.title"></v-list-item-title>
                  <v-list-item-subtitle>
                    {{block}}
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
import { v4 as uuidv4 } from 'uuid'
export default {
  data: () => ({
    intervals: [5, 10, 15, 30, 60],
    dateData: {
      timeBlocks: [],
      startingHour: null,
      endHour: null,
      selectedInterval: null
    }
  }),
  computed: {
    ...mapGetters({
      currentDate: 'currentDate',
      currentDateDataObj: 'currentDateData'
    }),

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
      if (this.currentDateData.startingHour && this.currentDateData.endHour && this.currentDateData.selectedInterval) {
        this.createTimeBlocks()
        return true
      }
      return false
    },

    // Current date data
    currentDateData () {
      return this.dateData
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
      const timeBlocks = [] // Reset time blocks

      // Validate values
      if (this.dateData.startingHour > this.dateData.endHour || this.dateData.endHour < this.dateData.startingHour) {
        this.dateData.endHour = null
        this.dateData.endHour = this.dateData.startingHour + 1
      }

      // Set the starting & end limits
      let start = new Date()
      start.setHours(this.dateData.startingHour, 0, 0, 0)

      const end = new Date()
      end.setHours(this.dateData.endHour, 59, 59, 999)

      while (start.getHours() < end.getHours()) {
        // Create time interval blocks
        const endBlock = new Date()
        endBlock.setHours(start.getHours() + 1, start.getMinutes(), start.getSeconds(), start.getMilliseconds())
        const blockId = `${start.getHours()}_${endBlock.getHours()}`

        while (start.getTime() < endBlock.getTime()) {
          const intervalDate = new Date()
          intervalDate.setHours(start.getHours(), start.getMinutes() + this.dateData.selectedInterval, start.getSeconds(), start.getMilliseconds())
          timeBlocks.push({ id: uuidv4(), time: blockId, startVal: start.getTime(), endVal: intervalDate.getTime(), title: `${start.toLocaleTimeString()} - ${intervalDate.toLocaleTimeString()}`, val: null })

          start = intervalDate
        }
        start = endBlock
      }

      if (timeBlocks.length > 0) this.dateData.timeBlocks = timeBlocks
    },

    // Save the current date data
    saveData () {
      // Set the starting & end limits
      let start = new Date()
      start.setHours(this.dateData.startingHour, 0, 0, 0)

      const end = new Date()
      end.setHours(this.dateData.endHour, 59, 59, 999)

      const finalData = {
        date: this.currentDate,
        data: [],
        time: {
          start: this.dateData.startingHour,
          end: this.dateData.endHour,
          interval: this.dateData.selectedInterval
        },
        isSaved: false
      }

      // Parse data based on selected range
      while (start.getHours() < end.getHours()) {
        const startTimeBlock = start
        const endTimeBlock = new Date()
        endTimeBlock.setHours(start.getHours() + 1, start.getMinutes(), start.getSeconds(), start.getMilliseconds())

        // Find / Create time data object
        let findTimeObj = finalData.data.find(obj => {
          const objKeys = Object.keys(obj)
          if (objKeys.includes('time')) {
            const timeKeys = Object.keys(obj.time)
            if (timeKeys.includes('start') && timeKeys.includes('end') && startTimeBlock.getHours() >= timeKeys.start && timeKeys.end <= endTimeBlock.getHours()) return obj
          }
        })

        if (!findTimeObj) findTimeObj = { time: { start: parseInt(startTimeBlock.getHours()), end: parseInt(endTimeBlock.getHours()) }, data: [] }

        // Next, Find if user has input any data in between
        const thisBlockData = this.dateData.timeBlocks.filter(obj => {
          const { time } = obj
          const [startVal, endVal] = time.split('_')
          if (startVal >= startTimeBlock.getHours() && endVal <= endTimeBlock.getHours()) return obj
        })

        if (thisBlockData && thisBlockData.constructor === Array && thisBlockData.length > 0) {
          thisBlockData.forEach(obj => {
            const { val } = obj
            if (val && typeof val === 'string' && val.length > 0) findTimeObj.data.push(obj)
          })
        }
        finalData.data.push(findTimeObj)

        start = endTimeBlock
      }

      this.$store.dispatch('saveUserData', finalData) // Send the request to save the data
    }
  },
  mounted () {
    // this.createTimeBlocks()
  }
}
</script>

<style>

</style>
