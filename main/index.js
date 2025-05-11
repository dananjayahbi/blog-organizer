const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);
const unlinkAsync = promisify(fs.unlink);

// Path to store blog post data - using project directory instead of userData
const dataDir = path.join(__dirname, '..', 'data', 'posts');
const imagesDir = path.join(__dirname, '..', 'public', 'images');

// Ensure data directories exist
const ensureDirectoriesExist = async () => {
  try {
    if (!fs.existsSync(dataDir)) {
      await mkdirAsync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(imagesDir)) {
      await mkdirAsync(imagesDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating directories:', error);
  }
};

// Create the browser window
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In production, load the bundled app
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../renderer/out/index.html'));
  } else {
    // In development, load from the dev server
    mainWindow.loadURL('http://localhost:3000');
    // Remove automatic opening of dev tools
    // mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle events
app.whenReady().then(async () => {
  await ensureDirectoriesExist();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for file operations
ipcMain.handle('get-posts', async () => {
  try {
    const files = await readdirAsync(dataDir);
    const posts = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await readFileAsync(path.join(dataDir, file), 'utf8');
        const post = JSON.parse(content);
        posts.push(post);
      }
    }
    
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
});

ipcMain.handle('save-post', async (_, post) => {
  try {
    const fileName = `${post.id}.json`;
    await writeFileAsync(path.join(dataDir, fileName), JSON.stringify(post, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving post:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-post', async (_, id) => {
  try {
    const fileName = `${id}.json`;
    await unlinkAsync(path.join(dataDir, fileName));
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-image', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'webp'] }]
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true };
    }
    
    const originalPath = result.filePaths[0];
    const fileName = `${Date.now()}-${path.basename(originalPath)}`;
    const targetPath = path.join(imagesDir, fileName);
    
    // Copy the file to our app's image directory
    await fs.promises.copyFile(originalPath, targetPath);
    
    return { 
      fileName,
      // Use web-friendly path format (relative to public)
      filePath: `/images/${fileName}`,
      canceled: false 
    };
  } catch (error) {
    console.error('Error selecting image:', error);
    return { canceled: true, error: error.message };
  }
});