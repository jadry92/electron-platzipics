import { ipcRenderer, clipboard, remote, shell } from 'electron'
import { selectFirstImage, loadImages, addImagesEvents, clearImages } from './images-iu'
import { saveImage } from './filters'
import settings from 'electron-settings'
import Cloudup from 'cloudup-client'
import path, { win32 } from 'path'
import os from 'os'
import crypto from 'crypto'

const password = 'Platzipics'
const key = crypto.scryptSync(password, 'salt', 24)


function setIpc() {
  if (settings.has('directory')) {
    ipcRenderer.send('load-directory', settings.get('directory'))
  }

  ipcRenderer.on('load-images', (event, dir, images) => {
    clearImages()
    loadImages(images)
    selectFirstImage()
    addImagesEvents()
    settings.set('directory', dir)
    document.getElementById('directory').innerHTML = dir
  })

  ipcRenderer.on('save-image', (event, file) => {
    saveImage(file, (err) => {
      if (err) {
        showDialog('error', 'Platzipics', err.message)
      } else {
        document.getElementById('image_displayed').dataset.filtered = file
        showDialog('info', 'Platzipics', 'Image has been saved')
      }
    })
  })
}

function openPreferences() {

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
  if (os.platform() != win32) {
    preferencesWindow.setParentWindow(mainWindow)
  }

  preferencesWindow.once('ready-to-show', () => {
    preferencesWindow.show()
    preferencesWindow.focus()

  })
  preferencesWindow.loadURL(`file://${path.join(__dirname, '..')}/preferences.html`)
}

function openDirectory() {
  ipcRenderer.send('open-directory')
}

function saveFile() {
  const image = document.getElementById('image-displayed').dataset.original
  const ext = path.extname(image)
  ipcRenderer.send('open-save-dialog', ext)
}

function showDialog(type, title, msg) {
  ipcRenderer.send('show-dialog', {
    type: type,
    title: title,
    message: msg
  })
}

function uploadImage() {
  const imageNode = document.getElementById('image-displayed')
  let image
  if (imageNode.dataset.filtered) {
    image = imageNode.dataset.filtered
  } else {
    image = imageNode.src
  }

  image = image.replace('plp://', '')
  let filename = path.basename(image)
  if (settings.has('cloudup.user') && settings.has('cloudup.passwd')) {
    document.getElementById('overlay').classList.toggle('hidden')
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv)
    let decrypted = decipher.update(settings.get('cloudup.passwd'), 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    const client = Cloudup({
      user: settings.get('cloudup.user'),
      pass: decrypted
    })

    const stream = client.stream({ title: `PlatziPics - ${filename}` })

    stream.file(image).save((error) => {
      document.getElementById('overlay').classList.toggle('hidden')
      if (error) {
        showDialog('error', 'Platzipics', 'verify your internet connection or Cloud Up credentials')
      } else {
        const notify = new Notification('Platzipics', {
          body: `Platzipics', 'Image was loaded successfully to ${stream.url}`
            `Click in the URL to copy`,
          silent: false
        })
        notify.onclick = () => {
          shell.openExternal(stream.url)
        }
      }
    })

  } else {
    showDialog('error', 'Platzipics', 'Pleas fill up the CloudUp forms')
  }
}


function pasteImage() {
  const image = clipboard.readImage()
  const data = image.toDataURL()
  console.log(clipboard.readImage());
  if (data.indexOf('data:image/png;base64') !== -1 && !image.isEmpty()) {
    let mainImage = document.getElementById('image-displayed')
    mainImage.src = data
    mainImage.dataset.original = data
  } else {
    showDialog('error', 'Platzipics', 'There is not image')
  }
}

module.exports = { openDirectory, setIpc, saveFile, openPreferences, uploadImage, pasteImage }