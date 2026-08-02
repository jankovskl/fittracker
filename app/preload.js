const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  saveBackup: (data) => ipcRenderer.invoke('save-backup', data)
});
