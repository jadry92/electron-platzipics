'use strict'

import { app, BrowserWindow, Tray, globalShortcut, protocol } from 'electron'
import devtools from './devtools'
import setMainIpc from './ipcMainEvents'
import setupErrors from './handel-errors'
import os from 'os'
import path from 'path'

global.win
global.tray

if (process.env.NODE_ENV === 'development') {
  devtools()
}

app.on('before-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('ready', () => {

  protocol.registerFileProtocol('plp', (request, callback) => {
    const url = request.url.substr(6)
    callback({ path: path.normalize(url) })
  }, (error) => {
    if (error) throw error
  })

  global.win = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Platzipics',
    center: true,
    maximizable: false,
    show: false
  })

  globalShortcut.register('CommandOrControl+Alt+P', () => {
    global.win.show()
    global.win.focus()
  })

  setMainIpc(global.win)
  setupErrors(global.win)

  global.win.once('ready-to-show', () => {
    global.win.show()
  })

  // close window
  global.win.on('close', () => {
    global.win = null
    app.quit()
  })
  let icon;
  if (os.platform === 'win32') {
    icon = path.join(__dirname, 'assets', 'icons', 'tray-icon.ico')
  } else {
    icon = path.join(__dirname, 'assets', 'icons', 'tray-icon.png')
  }

  global.tray = new Tray(icon)
  global.tray.setToolTip('Platzipics')
  global.tray.on('click', () => {
    global.win.isVisble() ? global.win.hied() : global.win.show()
  })
  // load the html
  global.win.loadURL(`file://${__dirname}/renderer/index.html`)
})
