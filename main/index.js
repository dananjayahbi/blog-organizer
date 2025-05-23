const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const serveStatic = require('electron-serve');

// Set up static file serving for production builds
const loadURL = serveStatic({
  directory: path.join(app.getAppPath(), app.isPackaged ? 'out' : 'renderer/out')
});

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);
const unlinkAsync = promisify(fs.unlink);

// Use different paths for development and production
// In production, store data in the user's app data directory (outside the ASAR archive)
// In development, use local project directories

// Base directories for data storage
const baseDir = app.isPackaged 
  ? path.join(app.getPath('userData'), 'data') 
  : path.join(__dirname, '..');

// Path to store blog post data
const dataDir = path.join(baseDir, 'data', 'posts');
const snippetsDir = path.join(baseDir, 'data', 'snippets');

// Images directory - moved to data/images instead of public/images
const imagesDir = app.isPackaged
  ? path.join(app.getPath('userData'), 'data', 'images')
  : path.join(baseDir, 'data', 'images');

// Ensure data directories exist
const ensureDirectoriesExist = async () => {
  try {
    if (!fs.existsSync(dataDir)) {
      await mkdirAsync(dataDir, { recursive: true });
      console.log(`Created data directory at: ${dataDir}`);
    }
    if (!fs.existsSync(imagesDir)) {
      await mkdirAsync(imagesDir, { recursive: true });
      console.log(`Created images directory at: ${imagesDir}`);
    }
    if (!fs.existsSync(snippetsDir)) {
      await mkdirAsync(snippetsDir, { recursive: true });
      console.log(`Created snippets directory at: ${snippetsDir}`);
    }
  } catch (error) {
    console.error('Error creating directories:', error);
  }
};

// Create the browser window
let mainWindow;
let markdownCheatSheetWindow = null;

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

  // In production, load the bundled app using electron-serve
  if (app.isPackaged) {
    loadURL(mainWindow);
  } else {
    // In development, load from the dev server
    mainWindow.loadURL('http://localhost:3000');
    // mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Function to create a Markdown cheat sheet window
function createMarkdownCheatSheetWindow() {
  // If window already exists, focus it instead of creating a new one
  if (markdownCheatSheetWindow) {
    markdownCheatSheetWindow.focus();
    return;
  }

  markdownCheatSheetWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: 'Markdown Cheat Sheet',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load our standalone markdown cheat sheet HTML file with styles inlined
  markdownCheatSheetWindow.loadFile(path.join(__dirname, 'markdown-cheatsheet.html'));

  // Clean up when window is closed
  markdownCheatSheetWindow.on('closed', () => {
    markdownCheatSheetWindow = null;
  });
}

// App lifecycle events
app.whenReady().then(async () => {
  await ensureDirectoriesExist();
  
  // Register custom protocol to serve images from data/images in both dev and prod
  protocol = require('electron').protocol;
  
  // Register 'images' protocol to serve images from the data/images directory
  protocol.registerFileProtocol('images', (request, callback) => {
    const url = request.url.substring(9); // remove 'images://' 
    const imagePath = path.join(imagesDir, url);
    callback({ path: imagePath });
  });
  
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
    // First ensure the data directory exists
    if (!fs.existsSync(dataDir)) {
      await mkdirAsync(dataDir, { recursive: true });
      console.log(`Created data directory at: ${dataDir}`);
    }
    
    // Validate post has required fields
    if (!post || !post.id) {
      console.error('Invalid post data:', post);
      return { success: false, error: 'Invalid post data - missing ID' };
    }
    
    const fileName = `${post.id}.json`;
    const filePath = path.join(dataDir, fileName);
    
    console.log(`Saving post to file: ${filePath}`);
    await writeFileAsync(filePath, JSON.stringify(post, null, 2), 'utf8');
    console.log(`Successfully saved post: ${post.id}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error saving post:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-post', async (_, id) => {
  try {
    // First get the post content to extract image references
    const fileName = `${id}.json`;
    const filePath = path.join(dataDir, fileName);
    
    // Check if the post file exists before trying to read it
    if (fs.existsSync(filePath)) {
      // Read the post file to get the content
      const postContent = await readFileAsync(filePath, 'utf8');
      const post = JSON.parse(postContent);
      
      // Extract image filenames from the post content
      const extractImagesFromContent = (content) => {
        // Match both image formats:
        // 1. Markdown format: ![alt](images://filename.jpg)
        // 2. HTML format: <img src="images://filename.jpg" ...>
        const regex = /!\[.*?\]\(images:\/\/([^)]+)\)|<img[^>]+src=["']images:\/\/([^"']+)["'][^>]*>/g;
        const images = [];
        let match;
        
        while ((match = regex.exec(content)) !== null) {
          // The filename will be in either capture group 1 or 2
          const filename = match[1] || match[2];
          if (filename) {
            images.push(filename);
          }
        }
        
        return images;
      };
      
      // Get image filenames from the post content
      const imageFilenames = extractImagesFromContent(post.content);
      
      // Delete all images associated with this post
      for (const filename of imageFilenames) {
        const imagePath = path.join(imagesDir, filename);
        if (fs.existsSync(imagePath)) {
          await unlinkAsync(imagePath);
          console.log(`Deleted image: ${filename}`);
        }
      }
    }
    
    // Now delete the post file
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
    
    // Use the custom protocol for both development and production
    const filePath = `images://${fileName}`;
    
    return { 
      fileName,
      filePath,
      canceled: false 
    };
  } catch (error) {
    console.error('Error selecting image:', error);
    return { canceled: true, error: error.message };
  }
});

// Delete image
ipcMain.handle('delete-image', async (event, filename) => {
  try {
    if (!filename) {
      return { success: false, error: 'No filename provided' };
    }

    // Make sure the file exists in the images directory
    const imagePath = path.join(imagesDir, filename);
    
    if (!fs.existsSync(imagePath)) {
      console.warn(`Image not found: ${imagePath}`);
      return { success: false, error: 'Image not found' };
    }
    
    // Delete the file
    fs.unlinkSync(imagePath);
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
});

// Export to PDF
ipcMain.handle('export-pdf', async (event, content) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export to PDF',
      defaultPath: path.join(app.getPath('documents'), 'blog-post.pdf'),
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });
    
    if (result.canceled) {
      return { canceled: true };
    }
    
    // In a real app, you'd use something like Puppeteer or html-pdf to convert to PDF
    // For now, we'll just save the content as text
    fs.writeFileSync(result.filePath, content);
    
    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return { success: false, error: error.message };
  }
});

// Settings
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// Get settings
ipcMain.handle('get-settings', async () => {
  try {
    if (fs.existsSync(settingsPath)) {
      const content = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(content);
    } else {
      const defaultSettings = {
        darkMode: false,
        fontSize: 16,
        autosave: true
      };
      fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      darkMode: false,
      fontSize: 16,
      autosave: true
    };
  }
});

// Save settings
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, error: error.message };
  }
});

// IPC handler for opening Markdown cheat sheet window
ipcMain.handle('open-markdown-cheatsheet', () => {
  createMarkdownCheatSheetWindow();
  return { success: true };
});

// Snippet file operations
ipcMain.handle('get-snippets', async () => {
  try {
    const files = await readdirAsync(snippetsDir);
    const snippets = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await readFileAsync(path.join(snippetsDir, file), 'utf8');
        const snippet = JSON.parse(content);
        snippets.push(snippet);
      }
    }
    
    return snippets;
  } catch (error) {
    console.error('Error getting snippets:', error);
    return [];
  }
});

ipcMain.handle('save-snippet', async (_, snippet) => {
  try {
    // First ensure the snippets directory exists
    if (!fs.existsSync(snippetsDir)) {
      await mkdirAsync(snippetsDir, { recursive: true });
      console.log(`Created snippets directory at: ${snippetsDir}`);
    }
    
    // Validate snippet has required fields
    if (!snippet || !snippet.id) {
      console.error('Invalid snippet data:', snippet);
      return { success: false, error: 'Invalid snippet data - missing ID' };
    }
    
    const fileName = `${snippet.id}.json`;
    const filePath = path.join(snippetsDir, fileName);
    
    console.log(`Saving snippet to file: ${filePath}`);
    await writeFileAsync(filePath, JSON.stringify(snippet, null, 2), 'utf8');
    console.log(`Successfully saved snippet: ${snippet.id}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error saving snippet:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-snippet', async (_, id) => {
  try {
    const fileName = `${id}.json`;
    await unlinkAsync(path.join(snippetsDir, fileName));
    return { success: true };
  } catch (error) {
    console.error('Error deleting snippet:', error);
    return { success: false, error: error.message };
  }
});