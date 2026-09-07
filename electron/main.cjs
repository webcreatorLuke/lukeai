// electron/main.cjs
//
// Electron main process for the LukeAI desktop build. The built app (see
// `npm run build:electron`) is served from a tiny local HTTP server rather
// than loaded directly via file:// — Firebase's signInWithPopup() Google
// login needs a real http(s) origin to work correctly, and file:// breaks it.

const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

const DIST_DIR = path.join(__dirname, '..', 'dist-electron');
// Let the OS pick any free port instead of a fixed one — avoids EADDRINUSE
// if a previous instance didn't shut down cleanly.

const MIME_TYPES = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.map':  'application/json',
};

// ─── Window state persistence ─────────────────────────────────────────────
// Remembers size/position between launches. Written by hand (no extra
// dependency) to keep the Flatpak dependency manifest smaller.
const STATE_PATH = path.join(app.getPath('userData'), 'window-state.json');
const DEFAULT_STATE = { width: 1200, height: 800 };

function loadWindowState() {
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf-8');
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveWindowState(win) {
  if (win.isDestroyed()) return;
  const bounds = win.isMaximized() ? win.getNormalBounds() : win.getBounds();
  const state = { ...bounds, isMaximized: win.isMaximized() };
  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify(state));
  } catch (err) {
    console.warn('[main] Could not save window state:', err.message);
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(DIST_DIR, urlPath);
      if (filePath.endsWith(path.sep)) filePath = path.join(filePath, 'index.html');

      fs.readFile(filePath, (err, data) => {
        if (err) {
          // The app uses hash-based routing, so any unmatched path (e.g. a
          // refresh on a client-side route) should just serve index.html.
          fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, indexData) => {
            if (err2) {
              res.writeHead(404);
              res.end('Not found');
              return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexData);
          });
          return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

// ─── Native menu bar ───────────────────────────────────────────────────────
function buildMenu(win) {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        ...(isMac ? [{ role: 'zoom' }] : []),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'View on GitHub',
          click: () => shell.openExternal('https://github.com/webcreatorLuke/lukeai'),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function createWindow() {
  const port = await startServer();
  const savedState = loadWindowState();

  const win = new BrowserWindow({
    width:  savedState.width,
    height: savedState.height,
    x:      savedState.x,
    y:      savedState.y,
    icon:   path.join(__dirname, '..', 'build-resources', 'icon.png'),
    webPreferences: {
      preload:         path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });

  if (savedState.isMaximized) win.maximize();

  buildMenu(win);

  win.loadURL(`http://localhost:${port}`);

  // Forward the renderer's console output to this terminal — this is the
  // only way to see the real error behind a generic on-screen message like
  // "Authentication failed" when running as a packaged Flatpak.
  win.webContents.on('console-message', (_event, _level, message) => {
    console.log(`[renderer] ${message}`);
  });

  let saveTimeout;
  const scheduleSave = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveWindowState(win), 500);
  };
  win.on('resize', scheduleSave);
  win.on('move', scheduleSave);
  win.on('close', () => saveWindowState(win));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
