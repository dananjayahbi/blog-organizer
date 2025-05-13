const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Post operations
  getPosts: () => ipcRenderer.invoke('get-posts'),
  savePost: (post) => ipcRenderer.invoke('save-post', post),
  deletePost: (id) => ipcRenderer.invoke('delete-post', id),
  
  // Image operations
  selectImage: () => ipcRenderer.invoke('select-image'),
  deleteImage: (filename) => ipcRenderer.invoke('delete-image', filename),
  
  // PDF export
  exportPDF: (content) => ipcRenderer.invoke('export-pdf', content),
  
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Markdown Cheat Sheet
  openMarkdownCheatSheet: () => ipcRenderer.invoke('open-markdown-cheatsheet'),
  
  // Snippet operations
  getSnippets: () => ipcRenderer.invoke('get-snippets'),
  saveSnippet: (snippet) => ipcRenderer.invoke('save-snippet', snippet),
  deleteSnippet: (id) => ipcRenderer.invoke('delete-snippet', id),
});