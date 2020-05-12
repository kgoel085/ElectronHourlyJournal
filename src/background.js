'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import {
  createProtocol
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true, backgroundThrottling: false
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()
})

const saveFilePath = path.join(app.getPath('userData'), 'data.json')
const checkSaveFileExists = filePath => {
  try {
    fs.openSync(filePath, 'r') // Check file exists or not
  } catch (err) {
    const { code } = err
    // If there is error, means the required file is not present
    if (code === 'ENOENT') saveFile([])
  }
}

const saveFile = data => {
  return fs.writeFileSync(saveFilePath, JSON.stringify(data))
}

const getData = () => {
  let fileData = fs.readFileSync(saveFilePath, 'utf8')
  if (fileData) fileData = JSON.parse(fileData)

  return fileData
}

const saveData = usrObj => {
  if (usrObj) {
    const prevData = getData()

    let filteredData = []
    if (prevData) filteredData = prevData.filter(obj => obj.date !== usrObj.date)

    const finalData = [...filteredData, { ...usrObj, isSaved: true }]
    return saveFile(finalData)
  }

  return null
}

// Get specific date data from the file
ipcMain.on('fetch:data', (event, date = null) => {
  checkSaveFileExists(saveFilePath)
  const fileData = getData()
  let returnVal = null

  if (fileData && fileData.constructor === Array && fileData.length > 0) {
    const findDateData = fileData.filter(obj => obj.date === date)
    if (findDateData) returnVal = findDateData
  }

  win.webContents.send('data:fetched', returnVal)
})

// Save data int he file
ipcMain.on('save:data', (event, data) => {
  checkSaveFileExists(saveFilePath) // Check whether data file is present or not
  const savedData = saveData(data)

  win.webContents.send('data:saved', savedData) // Return the saved data back to user
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
