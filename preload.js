const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('belowApp', {
  toggleFullscreen: () => ipcRenderer.send('toggle-fs'),
  quit: () => ipcRenderer.send('quit'),
  generateFloor: depth => ipcRenderer.invoke('generate-floor', depth),
  bossTick: state => ipcRenderer.invoke('boss-tick', state)
});
