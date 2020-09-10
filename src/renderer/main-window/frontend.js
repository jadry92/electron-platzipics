import { addImagesEvents, searchImagesEvent, selectedEvent } from './main-window/images-iu'
import { setIpc, openDirectory, saveFile, openPreferences } from './main-window/ipcRendererEvents'

window.addEventListener('load', () => {
  setIpc()
  addImagesEvents()
  searchImagesEvent()
  selectedEvent()
  buttonEvent('open-directory', openDirectory)
  buttonEvent('open-preferences', openPreferences)
  buttonEvent('save-button', saveFile) 
})


function buttonEvent (id, func) {
  const button = document.getElementById(id)
  button.addEventListener('click', func)
}





