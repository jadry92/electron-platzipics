import { remote } from 'electron'
import { openDirectory, saveFile, openPreferences, pasteImage, uploadImage } from './ipcRendererEvents'
import { print } from './images-iu'


function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click() { openDirectory() }
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click() { saveFile() }
        },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click() { openPreferences() }
        },
        {
          label: 'Close',
          role: 'quit'
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Print',
          accelerator: 'CmdOrCtrl+P',
          click() { print() }
        },
        {
          label: 'Upload to cloud',
          accelerator: 'CmdOrCtrl+U',
          click() { uploadImage() }
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          click() { pasteImage() }
        }
      ]
    }
  ]
  const menu = remote.Menu.buildFromTemplate(template)
  remote.Menu.setApplicationMenu(menu)
}

module.exports = createMenu