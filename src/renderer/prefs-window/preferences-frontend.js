import { remote, ipcRenderer } from 'electron'
import settings from 'electron-settings'
import crypto from 'crypto'

const password = 'Platzipics'
const key = crypto.scryptSync(password, 'salt', 24)

window.addEventListener('load', () => {
  cancelButton()
  saveButton()

  if (settings.has('cloudup.user')) {
    document.getElementById('cloudup-user').value = settings.get('cloudup.user')

  }
  if (settings.has('cloudup.passwd')) {
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv('aes-192-cbc', key, iv)
    let decrypted = decipher.update(settings.get('cloudup.passwd'), 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    document.getElementById('cloudup-passwd').value = decrypted
  }
})

function cancelButton() {
  const cancelButton = document.getElementById('cancel-button')

  cancelButton.addEventListener('click', () => {
    const prefsWindow = remote.getCurrentWindow()
    prefsWindow.close()
  })
}

function saveButton() {
  const saveButton = document.getElementById('save-button')
  const prefsForm = document.getElementById('preferences-form')

  saveButton.addEventListener('click', () => {
    if (prefsForm.reportValidity()) {
      console.log(document.getElementById('cloudup-passwd').value)
      const iv = Buffer.alloc(16, 0);
      const cipher = crypto.createCipheriv('aes-192-cbc', key, iv)
      let encrypted = cipher.update(document.getElementById('cloudup-passwd').value)
      encrypted += cipher.final('hex')

      settings.set('cloudup.user', document.getElementById('cloudup-user').value)
      settings.set('cloudup.passwd', encrypted)
      const prefsWindow = remote.getCurrentWindow()
      prefsWindow.close()
    } else {
      ipcRenderer.send('show-dialog', {
        type: 'error',
        title: 'Platzi Picts',
        message: 'Please fill all form.'
      })
    }
  })
}