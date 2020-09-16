import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import isImage from 'is-image'
import path from 'path'
import filesize from 'filesize'

function setMainIpc(win) {
  ipcMain.on('open-directory', (event) => {
    dialog.showOpenDialog(win, {
      title: 'new location',
      buttonLabel: 'open location',
      properties: ['openDirectory']
    }, (dir) => {
      if (dir) {
        loadImages(event, dir[0])
      }
    })
  })

  ipcMain.on('load-directory', (event, dir) => {
    loadImages(event, dir)
  })

  ipcMain.on('open-save-dialog', (event, ext) => {
    dialog.showSaveDialog(win, {
      title: 'Save Image Modify',
      buttonLabel: 'Save Image',
      filters: [{ name: 'Images', extensions: [ext.substr(1)] }]
    }, (file) => {
      if (file) {
        event.sender.send('save-image', file)
      }
    })
  })

  ipcMain.on('show-dialog', (event, info) => {
    dialog.showMessageBox(win, {
      type: info.type,
      title: info.title,
      message: info.message
    })
  })
}

function loadImages(event, dir) {
  const images = []

  fs.readdir(dir, (err, files) => {
    if (err) throw err
    for (let index = 0; index < files.length; index++) {
      if (isImage(files[index])) {
        let imageFile = path.join(dir, files[index])
        let stats = fs.statSync(imageFile)
        let size = filesize(stats.size, { round: 0 })
        images.push({
          filename: files[index],
          src: `plp://${imageFile}`,
          size: size,
        })
      }
    }
    event.sender.send('load-images', dir, images)
  })
}

module.exports = setMainIpc