const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, execFile } = require('child_process');
let win;
let java;
let nextId = 1;
const pending = new Map();
function runtimePath(...parts) {
  const root = app.isPackaged ? process.resourcesPath : __dirname;
  return path.join(root, ...parts);
}
function startEngine() {
  const javaExe = runtimePath('runtime', 'java', 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
  const jar = runtimePath('game-engine.jar');
  if (!fs.existsSync(javaExe) || !fs.existsSync(jar)) return;
  java = spawn(javaExe, ['-jar', jar], { stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true });
  let buffer = '';
  java.stdout.setEncoding('utf8');
  java.stdout.on('data', chunk => {
    buffer += chunk;
    for (;;) {
      const end = buffer.indexOf('\n');
      if (end < 0) break;
      const line = buffer.slice(0, end).trim(); buffer = buffer.slice(end + 1);
      const sep = line.indexOf('|'); if (sep < 0) continue;
      const resolve = pending.get(line.slice(0, sep));
      if (resolve) { pending.delete(line.slice(0, sep)); try { resolve(JSON.parse(line.slice(sep + 1))); } catch { resolve(null); } }
    }
  });
  java.on('exit', () => { for (const resolve of pending.values()) resolve(null); pending.clear(); java = null; });
}
function pythonPath() {
  const base = runtimePath('runtime', 'python');
  return path.join(base, process.platform === 'win32' ? 'python.exe' : 'bin/python3');
}
function generateFloor(depth) {
  const exe = pythonPath();
  const script = runtimePath('game', 'python', 'mapgen.py');
  if (!fs.existsSync(exe)) return Promise.resolve(null);
  return new Promise(resolve => execFile(exe, [script, String(depth)], { windowsHide: true, timeout: 8000 }, (err, stdout) => {
    if (err) return resolve(null);
    try { resolve(JSON.parse(stdout)); } catch { resolve(null); }
  }));
}
function create() {
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    fullscreen: true, autoHideMenuBar: true, backgroundColor: '#080a08', title: 'Below',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, devTools: false }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}
ipcMain.on('toggle-fs', () => { if (win) win.setFullScreen(!win.isFullScreen()); });
ipcMain.on('quit', () => app.quit());
ipcMain.handle('generate-floor', (_event, depth) => generateFloor(depth));
ipcMain.handle('boss-tick', (_event, state) => new Promise(resolve => {
  if (!java || !java.stdin.writable) return resolve(null);
  const id = String(nextId++); pending.set(id, resolve);
  const values = [id, state.key, state.kind, state.x, state.y, state.px, state.py, state.depth, state.dt].map(v => String(v).replace(/[|\r\n]/g, ''));
  java.stdin.write(values.join('|') + '\n', err => { if (err) { pending.delete(id); resolve(null); } });
  setTimeout(() => { if (pending.delete(id)) resolve(null); }, 500);
}));
app.whenReady().then(() => { startEngine(); create(); });
app.on('before-quit', () => { if (java) java.kill(); });
app.on('window-all-closed', () => app.quit());
