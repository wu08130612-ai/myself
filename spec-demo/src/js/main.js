// 主入口文件 - 整合所有模块并初始化应用

import { DatabaseManager } from './database.js';
import { AlbumManager } from './albums.js';
import { PhotoManager } from './photos.js';
import { UIManager } from './ui.js';
import { notificationManager } from './notifications.js';

// 全局应用实例
let db = null;
let albumManager = null;
let photoManager = null;
let ui = null;
let notifications = notificationManager;
let isInitialized = false;

// 初始化应用
async function init() {
  try {
    notifications.info('正在初始化应用...', { duration: 2000 });
    
    db = new DatabaseManager();
    await db.init();
    
    albumManager = new AlbumManager(db);
    photoManager = new PhotoManager(db);
    ui = new UIManager();
    
    setupEventListeners();
    
    await loadInitialData();
    
    isInitialized = true;
    notifications.success('应用初始化完成！');
    
    console.log('Photo Album App initialized successfully');
    
  } catch (error) {
    console.error('应用初始化失败:', error);
    notifications.error('应用初始化失败: ' + error.message);
  }
}

// 设置事件监听器
function setupEventListeners() {
  const createAlbumBtn = document.getElementById('create-album-btn');
  if (createAlbumBtn) {
    createAlbumBtn.addEventListener('click', () => showCreateAlbumModal());
  }

  const addPhotosBtn = document.getElementById('add-photos-btn');
  if (addPhotosBtn) {
    addPhotosBtn.addEventListener('click', () => addPhotos());
  }

  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', () => deleteSelectedPhotos());
  }

  const moveSelectedBtn = document.getElementById('move-selected-btn');
  if (moveSelectedBtn) {
    moveSelectedBtn.addEventListener('click', () => moveSelectedPhotos());
  }

  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => handleFileSelection(e));
  }

  const createAlbumForm = document.getElementById('create-album-form');
  if (createAlbumForm) {
    createAlbumForm.addEventListener('submit', (e) => handleCreateAlbum(e));
  }

  window.addEventListener('refreshPhotos', () => refreshCurrentView());
  window.addEventListener('refreshAlbums', () => loadAlbums());
}

// 加载初始数据
async function loadInitialData() {
  await loadAlbums();
}

// 加载相册列表
async function loadAlbums() {
  try {
    ui.showLoading('加载相册中...');
    
    const albums = await albumManager.getAllAlbums();
    
    for (const album of albums) {
      const photos = await photoManager.getPhotosByAlbum(album.id);
      album.photoCount = photos.length;
      
      if (photos.length > 0) {
        album.coverPhoto = photos[0].thumbnail || photos[0].data;
      }
    }
    
    ui.renderAlbums(albums);
    ui.hideLoading();
    
  } catch (error) {
    console.error('加载相册失败:', error);
    notifications.error('加载相册失败: ' + error.message);
    ui.hideLoading();
  }
}

// 打开相册
async function openAlbum(albumId) {
  try {
    ui.showLoading('加载照片中...');
    
    const album = await albumManager.getAlbum(albumId);
    const photos = await photoManager.getPhotosByAlbum(albumId);
    
    ui.showAlbumDetailView(albumId);
    ui.renderPhotos(photos, album);
    ui.hideLoading();
    
  } catch (error) {
    console.error('打开相册失败:', error);
    notifications.error('打开相册失败: ' + error.message);
    ui.hideLoading();
  }
}

// 显示创建相册模态框
function showCreateAlbumModal() {
  ui.showModal('create-album-modal');
}

// 处理创建相册
async function handleCreateAlbum(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const albumData = {
    name: formData.get('name').trim(),
    description: formData.get('description').trim()
  };

  if (!albumData.name) {
    notifications.warning('请输入相册名称');
    return;
  }

  try {
    ui.showLoading('创建相册中...');
    
    const album = await albumManager.createAlbum(albumData);
    
    ui.closeModal('create-album-modal');
    ui.hideLoading();
    
    notifications.success('相册创建成功！');
    await loadAlbums();
    
  } catch (error) {
    console.error('创建相册失败:', error);
    notifications.error('创建相册失败: ' + error.message);
    ui.hideLoading();
  }
}

// 编辑相册
async function editAlbum(albumId) {
  try {
    const album = await albumManager.getAlbum(albumId);
    if (!album) {
      notifications.error('相册不存在');
      return;
    }

    const newName = prompt('请输入新的相册名称:', album.name);
    if (newName && newName.trim() && newName.trim() !== album.name) {
      await albumManager.updateAlbum(albumId, { name: newName.trim() });
      notifications.success('相册名称已更新');
      await loadAlbums();
    }
    
  } catch (error) {
    console.error('编辑相册失败:', error);
    notifications.error('编辑相册失败: ' + error.message);
  }
}

// 删除相册
async function deleteAlbum(albumId) {
  try {
    const album = await albumManager.getAlbum(albumId);
    if (!album) {
      notifications.error('相册不存在');
      return;
    }

    const photos = await photoManager.getPhotosByAlbum(albumId);
    const message = photos.length > 0 
      ? `确定要删除相册"${album.name}"吗？这将同时删除其中的 ${photos.length} 张照片。`
      : `确定要删除相册"${album.name}"吗？`;

    notifications.confirm(
      message,
      async () => {
        try {
          ui.showLoading('删除相册中...');
          await albumManager.deleteAlbum(albumId);
          ui.hideLoading();
          notifications.success('相册已删除');
          await loadAlbums();
        } catch (error) {
          console.error('删除相册失败:', error);
          notifications.error('删除相册失败: ' + error.message);
          ui.hideLoading();
        }
      }
    );
    
  } catch (error) {
    console.error('删除相册失败:', error);
    notifications.error('删除相册失败: ' + error.message);
  }
}

// 添加照片
function addPhotos() {
  if (!ui.currentAlbumId) {
    notifications.warning('请先选择一个相册');
    return;
  }

  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.click();
  }
}

// 处理文件选择
async function handleFileSelection(event) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  if (!ui.currentAlbumId) {
    notifications.warning('请先选择一个相册');
    return;
  }

  try {
    ui.showLoading(`正在添加 ${files.length} 张照片...`);
    
    const result = await photoManager.addPhotos(files, ui.currentAlbumId);
    
    ui.hideLoading();
    
    if (result.successCount > 0) {
      notifications.success(`成功添加 ${result.successCount} 张照片`);
    }
    
    if (result.errorCount > 0) {
      notifications.warning(`${result.errorCount} 张照片添加失败`);
      console.log('添加失败的照片:', result.errors);
    }
    
    await refreshCurrentView();
    
    event.target.value = '';
    
  } catch (error) {
    console.error('添加照片失败:', error);
    notifications.error('添加照片失败: ' + error.message);
    ui.hideLoading();
  }
}

// 预览照片
async function previewPhoto(photoId) {
  try {
    const photo = await photoManager.getPhoto(photoId);
    if (photo) {
      ui.showPhotoPreview(photo);
    }
  } catch (error) {
    console.error('预览照片失败:', error);
    notifications.error('预览照片失败: ' + error.message);
  }
}

// 下载照片
async function downloadPhoto(photoId) {
  try {
    await photoManager.downloadPhoto(photoId);
    notifications.success('照片下载完成');
  } catch (error) {
    console.error('下载照片失败:', error);
    notifications.error('下载照片失败: ' + error.message);
  }
}

// 删除照片
async function deletePhoto(photoId) {
  try {
    const photo = await photoManager.getPhoto(photoId);
    if (!photo) {
      notifications.error('照片不存在');
      return;
    }

    notifications.confirm(
      `确定要删除照片"${photo.name}"吗？`,
      async () => {
        try {
          await photoManager.deletePhoto(photoId);
          notifications.success('照片已删除');
          await refreshCurrentView();
        } catch (error) {
          console.error('删除照片失败:', error);
          notifications.error('删除照片失败: ' + error.message);
        }
      }
    );
    
  } catch (error) {
    console.error('删除照片失败:', error);
    notifications.error('删除照片失败: ' + error.message);
  }
}

// 切换照片选择
function togglePhotoSelection(photoId) {
  ui.togglePhotoSelection(photoId);
}

// 删除选中的照片
async function deleteSelectedPhotos() {
  const selectedPhotos = ui.getSelectedPhotos();
  if (selectedPhotos.length === 0) {
    notifications.warning('请先选择要删除的照片');
    return;
  }

  notifications.confirm(
    `确定要删除选中的 ${selectedPhotos.length} 张照片吗？`,
    async () => {
      try {
        ui.showLoading('删除照片中...');
        
        const result = await photoManager.deletePhotos(selectedPhotos);
        
        ui.hideLoading();
        ui.exitSelectionMode();
        
        if (result.successCount > 0) {
          notifications.success(`成功删除 ${result.successCount} 张照片`);
        }
        
        if (result.errorCount > 0) {
          notifications.warning(`${result.errorCount} 张照片删除失败`);
        }
        
        await refreshCurrentView();
        
      } catch (error) {
        console.error('批量删除照片失败:', error);
        notifications.error('批量删除照片失败: ' + error.message);
        ui.hideLoading();
      }
    }
  );
}

// 移动选中的照片
async function moveSelectedPhotos() {
  const selectedPhotos = ui.getSelectedPhotos();
  if (selectedPhotos.length === 0) {
    notifications.warning('请先选择要移动的照片');
    return;
  }

  try {
    const albums = await albumManager.getAllAlbums();
    const currentAlbumId = ui.currentAlbumId;
    
    const targetAlbums = albums.filter(album => album.id !== currentAlbumId);
    
    if (targetAlbums.length === 0) {
      notifications.warning('没有其他相册可以移动到');
      return;
    }

    const albumNames = targetAlbums.map(album => album.name);
    const selectedIndex = prompt(`选择目标相册:\n${albumNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}\n\n请输入序号:`);
    
    if (!selectedIndex || isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > targetAlbums.length) {
      return;
    }

    const targetAlbum = targetAlbums[selectedIndex - 1];
    
    ui.showLoading('移动照片中...');
    
    const result = await photoManager.movePhotos(selectedPhotos, targetAlbum.id);
    
    ui.hideLoading();
    ui.exitSelectionMode();
    
    if (result.successCount > 0) {
      notifications.success(`成功移动 ${result.successCount} 张照片到"${targetAlbum.name}"`);
    }
    
    if (result.errorCount > 0) {
      notifications.warning(`${result.errorCount} 张照片移动失败`);
    }
    
    await refreshCurrentView();
    
  } catch (error) {
    console.error('移动照片失败:', error);
    notifications.error('移动照片失败: ' + error.message);
    ui.hideLoading();
  }
}

// 刷新当前视图
async function refreshCurrentView() {
  if (ui.currentView === 'albums') {
    await loadAlbums();
  } else if (ui.currentView === 'album-detail' && ui.currentAlbumId) {
    await openAlbum(ui.currentAlbumId);
  }
}

// 搜索功能
async function search(query) {
  if (!query.trim()) {
    await refreshCurrentView();
    return;
  }

  try {
    ui.showLoading('搜索中...');
    
    if (ui.currentView === 'albums') {
      const albums = await albumManager.searchAlbums(query);
      ui.renderAlbums(albums);
    } else if (ui.currentView === 'album-detail') {
      const photos = await photoManager.searchPhotos(query, ui.currentAlbumId);
      const album = await albumManager.getAlbum(ui.currentAlbumId);
      ui.renderPhotos(photos, album);
    }
    
    ui.hideLoading();
    
  } catch (error) {
    console.error('搜索失败:', error);
    notifications.error('搜索失败: ' + error.message);
    ui.hideLoading();
  }
}

// 获取应用统计信息
async function getStats() {
  try {
    const albumCount = await db.countAlbums();
    const photoCount = await db.countPhotos();
    const totalSize = await db.getTotalSize();
    
    return {
      albumCount,
      photoCount,
      totalSize: db.formatFileSize(totalSize)
    };
    
  } catch (error) {
    console.error('获取统计信息失败:', error);
    return null;
  }
}

// 导出数据
async function exportData() {
  try {
    ui.showLoading('导出数据中...');
    
    const data = await db.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `photo-album-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    ui.hideLoading();
    notifications.success('数据导出完成');
    
  } catch (error) {
    console.error('导出数据失败:', error);
    notifications.error('导出数据失败: ' + error.message);
    ui.hideLoading();
  }
}

// 导入数据
async function importData(file) {
  try {
    ui.showLoading('导入数据中...');
    
    const text = await file.text();
    const data = JSON.parse(text);
    
    await db.importData(data);
    
    ui.hideLoading();
    notifications.success('数据导入完成');
    
    await refreshCurrentView();
    
  } catch (error) {
    console.error('导入数据失败:', error);
    notifications.error('导入数据失败: ' + error.message);
    ui.hideLoading();
  }
}

window.app = {
  openAlbum,
  showCreateAlbumModal,
  handleCreateAlbum,
  editAlbum,
  deleteAlbum,
  addPhotos,
  handleFileSelection,
  previewPhoto,
  downloadPhoto,
  deletePhoto,
  togglePhotoSelection,
  deleteSelectedPhotos,
  moveSelectedPhotos,
  search,
  getStats,
  exportData,
  importData
};

document.addEventListener('DOMContentLoaded', async () => {
  await init();
});