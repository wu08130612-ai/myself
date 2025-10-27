// 主应用文件 - 应用初始化和全局状态管理

import { DatabaseManager } from './database.js';
import { AlbumManager } from './albums.js';
import { PhotoManager } from './photos.js';
import { UIManager } from './ui.js';
import { NotificationManager } from './notifications.js';

let db = null;
let albumManager = null;
let photoManager = null;
let uiManager = null;
let notificationManager = null;
let currentView = 'albums';
let currentAlbum = null;

async function init() {
  try {
    showLoading('正在初始化应用...');
    
    notificationManager = new NotificationManager();
    
    db = new DatabaseManager();
    await db.init();
    
    albumManager = new AlbumManager(db);
    photoManager = new PhotoManager(db);
    uiManager = new UIManager();
    
    setupEventListeners();
    
    await uiManager.init();
    
    await loadInitialData();
    
    hideLoading();
    notificationManager.show('应用初始化成功！', 'success');
    
  } catch (error) {
    hideLoading();
    handleError('应用初始化失败', error);
  }
}

function setupEventListeners() {
  document.addEventListener('navigate', (event) => {
    handleNavigation(event.detail);
  });

  document.addEventListener('album:create', (event) => {
    handleAlbumCreate(event.detail);
  });

  document.addEventListener('album:update', (event) => {
    handleAlbumUpdate(event.detail);
  });

  document.addEventListener('album:delete', (event) => {
    handleAlbumDelete(event.detail);
  });

  document.addEventListener('album:select', (event) => {
    handleAlbumSelect(event.detail);
  });

  document.addEventListener('photos:upload', (event) => {
    handlePhotosUpload(event.detail);
  });

  document.addEventListener('photo:delete', (event) => {
    handlePhotoDelete(event.detail);
  });

  document.addEventListener('photo:preview', (event) => {
    handlePhotoPreview(event.detail);
  });

  document.addEventListener('app:error', (event) => {
    handleError(event.detail.message, event.detail.error);
  });

  document.addEventListener('keydown', (event) => {
    handleKeyboardShortcuts(event);
  });

  window.addEventListener('beforeunload', (event) => {
    if (hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = '您有未保存的更改，确定要离开吗？';
    }
  });
}

async function loadInitialData() {
  try {
    const albums = await albumManager.getAllAlbums();
    uiManager.renderAlbums(albums);
    
    if (albums.length > 0) {
      const firstAlbum = albums[0];
      const photos = await photoManager.getPhotosByAlbum(firstAlbum.id);
      uiManager.updateAlbumPhotoCounts([{
        albumId: firstAlbum.id,
        count: photos.length
      }]);
    }
    
  } catch (error) {
    handleError('加载初始数据失败', error);
  }
}

async function handleNavigation(detail) {
  const { view, albumId } = detail;
  
  try {
    currentView = view;
    
    if (view === 'albums') {
      currentAlbum = null;
      await showAlbumsView();
    } else if (view === 'album' && albumId) {
      currentAlbum = albumId;
      await showAlbumView(albumId);
    }
    
    uiManager.updateActiveView(view);
    
  } catch (error) {
    handleError('导航失败', error);
  }
}

async function showAlbumsView() {
  showLoading('正在加载相册...');
  
  try {
    const albums = await albumManager.getAllAlbums();
    
    const albumsWithCounts = await Promise.all(
      albums.map(async (album) => {
        const photos = await photoManager.getPhotosByAlbum(album.id);
        return {
          ...album,
          photoCount: photos.length,
          coverPhoto: photos[0] || null
        };
      })
    );
    
    uiManager.renderAlbums(albumsWithCounts);
    hideLoading();
    
  } catch (error) {
    hideLoading();
    handleError('加载相册失败', error);
  }
}

async function showAlbumView(albumId) {
  showLoading('正在加载照片...');
  
  try {
    const album = await albumManager.getAlbum(albumId);
    const photos = await photoManager.getPhotosByAlbum(albumId);
    
    uiManager.renderAlbumDetail(album, photos);
    hideLoading();
    
  } catch (error) {
    hideLoading();
    handleError('加载相册详情失败', error);
  }
}

async function handleAlbumCreate(detail) {
  try {
    showLoading('正在创建相册...');
    
    const album = await albumManager.createAlbum(detail);
    
    hideLoading();
    notificationManager.show('相册创建成功！', 'success');
    
    if (currentView === 'albums') {
      await showAlbumsView();
    }
    
  } catch (error) {
    hideLoading();
    handleError('创建相册失败', error);
  }
}

async function handleAlbumUpdate(detail) {
  try {
    showLoading('正在更新相册...');
    
    await albumManager.updateAlbum(detail.id, detail);
    
    hideLoading();
    notificationManager.show('相册更新成功！', 'success');
    
    if (currentView === 'albums') {
      await showAlbumsView();
    } else if (currentView === 'album' && currentAlbum === detail.id) {
      await showAlbumView(detail.id);
    }
    
  } catch (error) {
    hideLoading();
    handleError('更新相册失败', error);
  }
}

async function handleAlbumDelete(detail) {
  try {
    const confirmed = await uiManager.showConfirmDialog(
      '确认删除',
      `确定要删除相册"${detail.name}"吗？此操作将同时删除相册中的所有照片，且无法撤销。`
    );
    
    if (!confirmed) return;
    
    showLoading('正在删除相册...');
    
    const photos = await photoManager.getPhotosByAlbum(detail.id);
    for (const photo of photos) {
      await photoManager.deletePhoto(photo.id);
    }
    
    await albumManager.deleteAlbum(detail.id);
    
    hideLoading();
    notificationManager.show('相册删除成功！', 'success');
    
    if (currentView === 'album' && currentAlbum === detail.id) {
      document.dispatchEvent(new CustomEvent('navigate', {
        detail: { view: 'albums' }
      }));
    } else if (currentView === 'albums') {
      await showAlbumsView();
    }
    
  } catch (error) {
    hideLoading();
    handleError('删除相册失败', error);
  }
}

async function handleAlbumSelect(detail) {
  document.dispatchEvent(new CustomEvent('navigate', {
    detail: { view: 'album', albumId: detail.id }
  }));
}

async function handlePhotosUpload(detail) {
  const { files, albumId } = detail;
  
  try {
    showLoading(`正在上传 ${files.length} 张照片...`);
    
    const uploadPromises = Array.from(files).map(file => 
      photoManager.addPhoto(file, albumId)
    );
    
    await Promise.all(uploadPromises);
    
    hideLoading();
    notificationManager.show(`成功上传 ${files.length} 张照片！`, 'success');
    
    if (currentView === 'album' && currentAlbum === albumId) {
      await showAlbumView(albumId);
    }
    
  } catch (error) {
    hideLoading();
    handleError('上传照片失败', error);
  }
}

async function handlePhotoDelete(detail) {
  try {
    const confirmed = await uiManager.showConfirmDialog(
      '确认删除',
      '确定要删除这张照片吗？此操作无法撤销。'
    );
    
    if (!confirmed) return;
    
    showLoading('正在删除照片...');
    
    await photoManager.deletePhoto(detail.id);
    
    hideLoading();
    notificationManager.show('照片删除成功！', 'success');
    
    if (currentView === 'album' && currentAlbum) {
      await showAlbumView(currentAlbum);
    }
    
  } catch (error) {
    hideLoading();
    handleError('删除照片失败', error);
  }
}

async function handlePhotoPreview(detail) {
  try {
    const photos = await photoManager.getPhotosByAlbum(currentAlbum);
    const currentIndex = photos.findIndex(photo => photo.id === detail.id);
    
    uiManager.showPhotoPreview(photos, currentIndex);
    
  } catch (error) {
    handleError('预览照片失败', error);
  }
}

function handleKeyboardShortcuts(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
    event.preventDefault();
    if (currentView === 'albums') {
      uiManager.showCreateAlbumModal();
    }
  }
  
  if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
    event.preventDefault();
    if (currentView === 'album' && currentAlbum) {
      uiManager.triggerPhotoUpload();
    }
  }
  
  if (event.key === 'Escape') {
    uiManager.closeAllModals();
  }
  
  if (event.key === 'Backspace' && !event.target.matches('input, textarea')) {
    event.preventDefault();
    if (currentView === 'album') {
      document.dispatchEvent(new CustomEvent('navigate', {
        detail: { view: 'albums' }
      }));
    }
  }
}

function hasUnsavedChanges() {
  return false;
}

function showLoading(message = '加载中...') {
  uiManager?.showLoading(message);
}

function hideLoading() {
  uiManager?.hideLoading();
}

function handleError(message, error) {
  console.error(message, error);
  
  let errorMessage = message;
  if (error?.message) {
    errorMessage += `: ${error.message}`;
  }
  
  notificationManager?.show(errorMessage, 'error');
}

async function refreshCurrentView() {
  if (currentView === 'albums') {
    await showAlbumsView();
  } else if (currentView === 'album' && currentAlbum) {
    await showAlbumView(currentAlbum);
  }
}

function getCurrentView() {
  return currentView;
}

function getCurrentAlbum() {
  return currentAlbum;
}

function getManagers() {
  return {
    db,
    albums: albumManager,
    photos: photoManager,
    ui: uiManager,
    notifications: notificationManager
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await init();
    
    window.photoApp = {
        refreshCurrentView,
        getCurrentView,
        getCurrentAlbum,
        getManagers
    };
    
  } catch (error) {
    console.error('应用启动失败:', error);
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      padding: 20px;
      max-width: 400px;
      text-align: center;
      z-index: 9999;
    `;
    errorDiv.innerHTML = `
      <h3 style="color: #c33; margin: 0 0 10px 0;">应用启动失败</h3>
      <p style="color: #666; margin: 0 0 15px 0;">${error.message || '未知错误'}</p>
      <button onclick="location.reload()" style="
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
      ">重新加载</button>
    `;
    document.body.appendChild(errorDiv);
  }
});