const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('index.html');
});

ipcMain.handle('save-backup', async (event, data) => {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const defaultName = `fittrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const result = await dialog.showSaveDialog({
    defaultPath: path.join(backupDir, defaultName),
    filters: [{ name: 'JSON Backup', extensions: ['json'] }]
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { saved: true, path: result.filePath };
  }
  return { saved: false };
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
