'use strict'

import { app, BrowserWindow } from 'electron'
import devtools from './devtools'
import setMainIpc from './ipcMainEvents'
import setupErrors from './handel-errors'


global.win

if (process.env.NODE_ENV === 'development') {
  devtools()
}

app.on('before-quit', () => {
  console.log('saliendo ...')
})

app.on('ready', () => {
    global.win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Platzipics',
    center: true,
    maximizable: false,
    show: false
  })
  
  setMainIpc(global.win)
  setupErrors(global.win)

  global.win.once('ready-to-show', () => {
    global.win.show()
  })

  global.win.on('close', () => {
    global.win = null
    app.quit()
  })

  global.win.loadURL(`file://${__dirname}/renderer/index.html`)
})
