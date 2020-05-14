<template>
  <v-card :loading="loadingState" :key="currentDate">
    <v-card-title>
      <span>{{currentDate}}</span>
      <v-spacer></v-spacer>
      <v-btn text class="success" @click="saveTimeBlocks(false)" :disabled="!userInputFulfilled">Save</v-btn>
    </v-card-title>
    <v-card-text>
      <!-- User input block -->
      <v-layout row wrap>
        <v-flex class="grow">
          <v-select :items="hoursSelectPickerArr" item-text="title" item-value="start" label="Day starts at" class="ma-2" v-model="userSelected.startTime" :readonly="userSavedAlready"></v-select>
        </v-flex>
        <v-flex class="grow">
          <v-select :items="hoursSelectPickerArr" item-text="title" item-value="start" label="Day ends at" class="ma-2" v-model="userSelected.endTime" :readonly="userSavedAlready"></v-select>
        </v-flex>
      </v-layout>

      <!-- User time block -->
      <v-layout row wrap>
        <template v-if="!userInputFulfilled">
          <v-flex xs12>
            <v-alert type='info' :value="true" full-width>
              Please select all the fields above to start
            </v-alert>
          </v-flex>
        </template>
        <template v-else>
          <v-flex xs12>
            <v-list two-line>
              <v-list-item v-for="timeBlock in timeBlocks" :key="timeBlock.id">
                <v-list-item-content>
                  <v-list-item-title v-text="timeBlock.title"></v-list-item-title>
                  <v-list-item-subtitle>
                    <v-textarea v-model="timeBlock.val"></v-textarea>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-flex>
        </template>
      </v-layout>
      <v-layout row wrap>
        <v-dialog v-model="showDialog" persistent max-width="60%">
          <v-card>
            <v-card-title class="headline">Are you sure to save ?</v-card-title>
            <v-card-text>
              <p>Once saved, you can only edit the time block entries. <br></p>
              <v-alert type="warning">
                YOU WILL NOT BE ABLE TO CHANGE THE WORKING HOURS, ONCE YOU SAVED THIS DATA.<br>
                IF UNSURE, PLEASE CANCEL AND THEN TRY AGAIN !
              </v-alert>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error darken-1" text @click="showDialog=!showDialog">Disagree</v-btn>
              <v-btn color="success darken-1" text @click="saveTimeBlocks(true)">Agree</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-card-text>
  </v-card>
</template>
<script>
import { mapGetters } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { ipcRenderer } from 'electron'
export default {
  data: () => ({
    // User input variables
    userSelected: {
      startTime: null,
      endTime: null,
      data: null
    },
    // Show user warning model
    showDialog: false,
    loading: false,
    storeInterval: null
  }),
  computed: {
    ...mapGetters({
      currentDate: 'currentDate', // Current selected date
      currentDateData: 'currentDateData', // User previous data for current date
      loadingState: 'loadingState' // Current loading state
    }),
    hoursSelectPickerArr () { // Returns the time blocks
      return this.createTimeRange()
    },
    userInputFulfilled () {
      const { startTime, endTime } = this.userSelected
      if (parseInt(startTime) >= 0 && parseInt(endTime) > 0 && this.currentDate) {
        this.createTimeBlocks()
        return true
      }

      return false
    },
    userSavedAlready () { // Checks whether user has already saved data once or not
      const dtData = this.currentDateData
      if (dtData && dtData.constructor === Object && Object.keys(dtData).length > 0) {
        if (Object.keys(dtData).includes('isSaved') && dtData.isSaved === true) return true
      }

      return false
    },
    timeBlocks: { // Returns the time blocks based on user input
      get () {
        return this.userSelected.data
      },
      set (val) {
        this.userSelected.data = val
      }
    }
  },
  methods: {
    // Check for initial data
    checkForInitialData () {
      this.userSelected.startTime = null
      this.userSelected.endTime = null
      this.userSelected.data = null

      if (this.currentDateData) {
        this.$store.commit('setLoadingDataState', false)
        const { time } = this.currentDateData
        if (time) {
          this.userSelected.startTime = time.start
          this.userSelected.endTime = time.end

          if (this.storeInterval) {
            clearInterval(this.storeInterval) // Clear the data check interval
          }
        }
      } else {
        this.$store.commit('setLoadingDataState', true)
        this.$store.dispatch('fetchUserData', this.currentDate) // Else fetch data
      }
    },
    // Create time range blocks depending upon inputs
    createTimeRange (startHour = 0, endHour = 23) {
      let startTime = new Date()
      startTime.setHours(startHour, 0, 0, 0)

      const endTime = new Date()
      endTime.setHours(endHour, 59, 59, 999)

      const returnArr = []
      while (startTime.getTime() < endTime.getTime()) {
        const endBlock = new Date()
        endBlock.setHours(startTime.getHours() + 1, startTime.getMinutes(), startTime.getSeconds(), startTime.getMilliseconds())

        returnArr.push({ title: startTime.toLocaleTimeString(), value: endBlock.getHours(), start: startTime.getHours(), end: endBlock.getHours() })
        startTime = endBlock
      }

      return returnArr
    },
    // Create time block for user inputs
    createTimeBlocks () {
      const returnArr = []
      const { startTime, endTime } = this.userSelected
      const timeRange = this.createTimeRange(startTime, endTime)

      if (timeRange && timeRange.constructor === Array && timeRange.length > 0) {
        timeRange.forEach(timeItem => {
          const { start: startBlockHour, end: endBlockHour } = timeItem

          const startBlock = new Date(this.currentDate)
          const endBlock = new Date(this.currentDate)

          startBlock.setHours(startBlockHour, 0)
          endBlock.setHours(endBlockHour, 0)

          // Get data, if any exists for current time block
          const savedValues = this.getTimeBlockData(startBlockHour, endBlockHour)
          const blockValue = savedValues || null

          returnArr.push({
            id: uuidv4(),
            val: blockValue,
            title: `${startBlock.toLocaleTimeString()} - ${endBlock.toLocaleTimeString()}`,
            startVal: startBlock.getHours(),
            endVal: endBlock.getHours(),
            interval: null
          })
        })
      }

      this.userSelected.data = returnArr
    },
    // Returns any previously saved data for provided time block
    getTimeBlockData (startTime, endTime) {
      const userData = this.currentDateData
      if (userData && userData !== 'undefined') {
        const filteredData = userData.data.filter(obj => obj.startVal >= parseInt(startTime) && obj.endVal <= parseInt(endTime))

        // Store the saved values
        const savedValues = []
        if (filteredData && filteredData.length > 0) {
          filteredData.forEach(obj => {
            const { val } = obj
            if (val && typeof val === 'string' && val.length > 0) savedValues.push(val)
          })
        }

        if (savedValues.length > 0) {
          const uniqueVals = [...new Set(savedValues)]
          return uniqueVals.join('\n')
        }
      }

      return null
    },
    // Save time block data
    saveTimeBlocks (usrConfirmed = false) {
      const finalData = {
        date: this.currentDate,
        data: this.userSelected.data,
        time: {
          start: this.userSelected.startTime,
          end: this.userSelected.endTime
        },
        isSaved: false
      }

      if (!this.userSavedAlready && !usrConfirmed) {
        this.showDialog = true // Ask user before saving
        return false
      } else {
        this.showDialog = false
        return this.triggerSaveRequest(finalData) // ELse save data
      }
    },
    // Trigger save request
    triggerSaveRequest (saveData = null) {
      this.$store.dispatch('saveUserData', saveData) // Send the request to save the data
    }
  },
  mounted () {
    this.checkForInitialData() // Check for initial data
    // Server saved the data
    ipcRenderer.on('data:fetched', (event, date) => {
      this.storeInterval = setTimeout(() => this.checkForInitialData(date), 500) // Check for initial data
    })
  }
}
</script>

<style>

</style>
