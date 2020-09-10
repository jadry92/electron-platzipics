import { ipcRenderer, remote } from 'electron'
import { selectFirstImage, loadImages, addImagesEvents, clearImages } from './images-iu'
import { saveImage } from './filters'
import path, { win32 } from 'path'
import settings from 'electron-settings'
import os from 'os'

function setIpc () {
  if (settings.has('directory')) {
    ipcRenderer.send('load-directory', settings.get('directory'))
  }

  ipcRenderer.on('load-images', (event, dir, images) => {
    clearImages()
    loadImages(images)
    selectFirstImage()
    addImagesEvents()
    settings.set('directory', dir)
  })
  
  ipcRenderer.on('save-image', (event, file) => {
    saveImage(file, (err) => {
      if (err) {
        showDialog('error', 'Platzipics', err.message)
      } else {
        showDialog('info', 'Platzipics', 'Image has been saved')
      }
    })
  })
}

function openPreferences () {

  const BrowserWindow = remote.BrowserWindow
  const mainWindow = remote.getGlobal('win')
  const preferencesWindow = new BrowserWindow({
    width: 400,
    height: 300,
    title: 'Preferences',
    center: true,
    modal: true,
    frame: false,
    show: false
  })
  if (os.platform() != win32){
    preferencesWindow.setParentWindow(mainWindow)
  }

  preferencesWindow.once('ready-to-show', () => {
    preferencesWindow.show()
    preferencesWindow.focus()

  })
  preferencesWindow.loadURL(`file://${path.join(__dirname, '..')}/preferences.html`)
}

function openDirectory () {
  ipcRenderer.send('open-directory')
}

function saveFile () {
  const image = document.getElementById('image-displayed').dataset.original
  const ext = path.extname(image)
  ipcRenderer.send('open-save-dialog', ext)
}

function showDialog (type, title, msg) {
  ipcRenderer.send('show-dialog', {
    type: type,
    title: title,
    message: msg
  })
}


module.exports = { openDirectory , setIpc, saveFile, openPreferences }