import { addImagesEvents, searchImagesEvent, selectedEvent, print } from './main-window/images-iu'
import { setIpc, openDirectory, saveFile, openPreferences, uploadImage, pasteImage } from './main-window/ipcRendererEvents'
import createMenu from './main-window/menu'

window.addEventListener('load', () => {
  createMenu()
  setIpc()
  addImagesEvents()
  searchImagesEvent()
  selectedEvent()
  buttonEvent('open-directory', openDirectory)
  buttonEvent('open-preferences', openPreferences)
  buttonEvent('save-button', saveFile)
  buttonEvent('print-button', print)
  buttonEvent('upload-button', uploadImage)
  buttonEvent('paste-button', pasteImage)
})


function buttonEvent(id, func) {
  const button = document.getElementById(id)
  button.addEventListener('click', func)
}





