const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getPosts: () => ipcRenderer.invoke('get-posts'),
  savePost: (post) => ipcRenderer.invoke('save-post', post),
  deletePost: (id) => ipcRenderer.invoke('delete-post', id),
  selectImage: () => ipcRenderer.invoke('select-image'),
});