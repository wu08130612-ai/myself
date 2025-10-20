// 主应用文件 - 应用初始化和全局状态管理

import { DatabaseManager } from './database.js';
import { AlbumManager } from './albums.js';
import { PhotoManager } from './photos.js';
import { UIManager } from './ui.js';
import { NotificationManager } from './notifications.js';

class PhotoApp {
  constructor() {
    this.db = null;
    this.albumManager = null;
    this.photoManager = null;
    this.uiManager = null;
    this.notificationManager = null;
    this.currentView = 'albums';
    this.currentAlbum = null;
    
    // 绑定方法
    this.init = this.init.bind(this);
    this.handleError = this.handleError.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
  }

  async init() {
    try {
      this.showLoading('正在初始化应用...');
      
      // 初始化通知管理器
      this.notificationManager = new NotificationManager();
      
      // 初始化数据库
      this.db = new DatabaseManager();
      await this.db.init();
      
      // 初始化管理器
      this.albumManager = new AlbumManager(this.db);
      this.photoManager = new PhotoManager(this.db);
      this.uiManager = new UIManager();
      
      // 设置事件监听器
      this.setupEventListeners();
      
      // 初始化UI
      await this.uiManager.init();
      
      // 加载初始数据
      await this.loadInitialData();
      
      this.hideLoading();
      this.notificationManager.show('应用初始化成功！', 'success');
      
    } catch (error) {
      this.hideLoading();
      this.handleError('应用初始化失败', error);
    }
  }

  setupEventListeners() {
    // 导航事件
    document.addEventListener('navigate', (event) => {
      this.handleNavigation(event.detail);
    });

    // 相册事件
    document.addEventListener('album:create', (event) => {
      this.handleAlbumCreate(event.detail);
    });

    document.addEventListener('album:update', (event) => {
      this.handleAlbumUpdate(event.detail);
    });

    document.addEventListener('album:delete', (event) => {
      this.handleAlbumDelete(event.detail);
    });

    document.addEventListener('album:select', (event) => {
      this.handleAlbumSelect(event.detail);
    });

    // 照片事件
    document.addEventListener('photos:upload', (event) => {
      this.handlePhotosUpload(event.detail);
    });

    document.addEventListener('photo:delete', (event) => {
      this.handlePhotoDelete(event.detail);
    });

    document.addEventListener('photo:preview', (event) => {
      this.handlePhotoPreview(event.detail);
    });

    // 错误事件
    document.addEventListener('app:error', (event) => {
      this.handleError(event.detail.message, event.detail.error);
    });

    // 键盘事件
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardShortcuts(event);
    });

    // 窗口事件
    window.addEventListener('beforeunload', (event) => {
      // 如果有未保存的更改，提示用户
      if (this.hasUnsavedChanges()) {
        event.preventDefault();
        event.returnValue = '您有未保存的更改，确定要离开吗？';
      }
    });
  }

  async loadInitialData() {
    try {
      // 加载相册数据
      const albums = await this.albumManager.getAllAlbums();
      this.uiManager.renderAlbums(albums);
      
      // 如果有相册，加载第一个相册的照片
      if (albums.length > 0) {
        const firstAlbum = albums[0];
        const photos = await this.photoManager.getPhotosByAlbum(firstAlbum.id);
        this.uiManager.updateAlbumPhotoCounts([{
          albumId: firstAlbum.id,
          count: photos.length
        }]);
      }
      
    } catch (error) {
      this.handleError('加载初始数据失败', error);
    }
  }

  async handleNavigation(detail) {
    const { view, albumId } = detail;
    
    try {
      this.currentView = view;
      
      if (view === 'albums') {
        this.currentAlbum = null;
        await this.showAlbumsView();
      } else if (view === 'album' && albumId) {
        this.currentAlbum = albumId;
        await this.showAlbumView(albumId);
      }
      
      this.uiManager.updateActiveView(view);
      
    } catch (error) {
      this.handleError('导航失败', error);
    }
  }

  async showAlbumsView() {
    this.showLoading('正在加载相册...');
    
    try {
      const albums = await this.albumManager.getAllAlbums();
      
      // 获取每个相册的照片数量
      const albumsWithCounts = await Promise.all(
        albums.map(async (album) => {
          const photos = await this.photoManager.getPhotosByAlbum(album.id);
          return {
            ...album,
            photoCount: photos.length,
            coverPhoto: photos[0] || null
          };
        })
      );
      
      this.uiManager.renderAlbums(albumsWithCounts);
      this.hideLoading();
      
    } catch (error) {
      this.hideLoading();
      this.handleError('加载相册失败', error);
    }
  }

  async showAlbumView(albumId) {
    this.showLoading('正在加载照片...');
    
    try {
      const album = await this.albumManager.getAlbum(albumId);
      const photos = await this.photoManager.getPhotosByAlbum(albumId);
      
      this.uiManager.renderAlbumDetail(album, photos);
      this.hideLoading();
      
    } catch (error) {
      this.hideLoading();
      this.handleError('加载相册详情失败', error);
    }
  }

  async handleAlbumCreate(detail) {
    try {
      this.showLoading('正在创建相册...');
      
      const album = await this.albumManager.createAlbum(detail);
      
      this.hideLoading();
      this.notificationManager.show('相册创建成功！', 'success');
      
      // 刷新相册列表
      if (this.currentView === 'albums') {
        await this.showAlbumsView();
      }
      
    } catch (error) {
      this.hideLoading();
      this.handleError('创建相册失败', error);
    }
  }

  async handleAlbumUpdate(detail) {
    try {
      this.showLoading('正在更新相册...');
      
      await this.albumManager.updateAlbum(detail.id, detail);
      
      this.hideLoading();
      this.notificationManager.show('相册更新成功！', 'success');
      
      // 刷新当前视图
      if (this.currentView === 'albums') {
        await this.showAlbumsView();
      } else if (this.currentView === 'album' && this.currentAlbum === detail.id) {
        await this.showAlbumView(detail.id);
      }
      
    } catch (error) {
      this.hideLoading();
      this.handleError('更新相册失败', error);
    }
  }

  async handleAlbumDelete(detail) {
    try {
      const confirmed = await this.uiManager.showConfirmDialog(
        '确认删除',
        `确定要删除相册"${detail.name}"吗？此操作将同时删除相册中的所有照片，且无法撤销。`
      );
      
      if (!confirmed) return;
      
      this.showLoading('正在删除相册...');
      
      // 删除相册中的所有照片
      const photos = await this.photoManager.getPhotosByAlbum(detail.id);
      for (const photo of photos) {
        await this.photoManager.deletePhoto(photo.id);
      }
      
      // 删除相册
      await this.albumManager.deleteAlbum(detail.id);
      
      this.hideLoading();
      this.notificationManager.show('相册删除成功！', 'success');
      
      // 如果当前在被删除的相册页面，返回相册列表
      if (this.currentView === 'album' && this.currentAlbum === detail.id) {
        document.dispatchEvent(new CustomEvent('navigate', {
          detail: { view: 'albums' }
        }));
      } else if (this.currentView === 'albums') {
        await this.showAlbumsView();
      }
      
    } catch (error) {
      this.hideLoading();
      this.handleError('删除相册失败', error);
    }
  }

  async handleAlbumSelect(detail) {
    document.dispatchEvent(new CustomEvent('navigate', {
      detail: { view: 'album', albumId: detail.id }
    }));
  }

  async handlePhotosUpload(detail) {
    const { files, albumId } = detail;
    
    try {
      this.showLoading(`正在上传 ${files.length} 张照片...`);
      
      const uploadPromises = Array.from(files).map(file => 
        this.photoManager.addPhoto(file, albumId)
      );
      
      await Promise.all(uploadPromises);
      
      this.hideLoading();
      this.notificationManager.show(`成功上传 ${files.length} 张照片！`, 'success');
      
      // 刷新当前相册视图
      if (this.currentView === 'album' && this.currentAlbum === albumId) {
        await this.showAlbumView(albumId);
      }
      
    } catch (error) {
      this.hideLoading();
      this.handleError('上传照片失败', error);
    }
  }

  async handlePhotoDelete(detail) {
    try {
      const confirmed = await this.uiManager.showConfirmDialog(
        '确认删除',
        '确定要删除这张照片吗？此操作无法撤销。'
      );
      
      if (!confirmed) return;
      
      this.showLoading('正在删除照片...');
      
      await this.photoManager.deletePhoto(detail.id);
      
      this.hideLoading();
      this.notificationManager.show('照片删除成功！', 'success');
      
      // 刷新当前相册视图
      if (this.currentView === 'album' && this.currentAlbum) {
        await this.showAlbumView(this.currentAlbum);
      }
      
    } catch (error) {
      this.hideLoading();
      this.handleError('删除照片失败', error);
    }
  }

  async handlePhotoPreview(detail) {
    try {
      const photos = await this.photoManager.getPhotosByAlbum(this.currentAlbum);
      const currentIndex = photos.findIndex(photo => photo.id === detail.id);
      
      this.uiManager.showPhotoPreview(photos, currentIndex);
      
    } catch (error) {
      this.handleError('预览照片失败', error);
    }
  }

  handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + N: 新建相册
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      if (this.currentView === 'albums') {
        this.uiManager.showCreateAlbumModal();
      }
    }
    
    // Ctrl/Cmd + U: 上传照片
    if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
      event.preventDefault();
      if (this.currentView === 'album' && this.currentAlbum) {
        this.uiManager.triggerPhotoUpload();
      }
    }
    
    // Escape: 关闭模态框
    if (event.key === 'Escape') {
      this.uiManager.closeAllModals();
    }
    
    // Backspace: 返回上一级
    if (event.key === 'Backspace' && !event.target.matches('input, textarea')) {
      event.preventDefault();
      if (this.currentView === 'album') {
        document.dispatchEvent(new CustomEvent('navigate', {
          detail: { view: 'albums' }
        }));
      }
    }
  }

  hasUnsavedChanges() {
    // 检查是否有未保存的更改
    // 这里可以根据实际需求实现
    return false;
  }

  showLoading(message = '加载中...') {
    this.uiManager?.showLoading(message);
  }

  hideLoading() {
    this.uiManager?.hideLoading();
  }

  handleError(message, error) {
    console.error(message, error);
    
    let errorMessage = message;
    if (error?.message) {
      errorMessage += `: ${error.message}`;
    }
    
    this.notificationManager?.show(errorMessage, 'error');
  }

  // 公共API方法
  async refreshCurrentView() {
    if (this.currentView === 'albums') {
      await this.showAlbumsView();
    } else if (this.currentView === 'album' && this.currentAlbum) {
      await this.showAlbumView(this.currentAlbum);
    }
  }

  getCurrentView() {
    return this.currentView;
  }

  getCurrentAlbum() {
    return this.currentAlbum;
  }

  getManagers() {
    return {
      db: this.db,
      albums: this.albumManager,
      photos: this.photoManager,
      ui: this.uiManager,
      notifications: this.notificationManager
    };
  }
}

// 全局应用实例
let app = null;

// 应用初始化
document.addEventListener('DOMContentLoaded', async () => {
  try {
    app = new PhotoApp();
    await app.init();
    
    // 将应用实例暴露到全局，便于调试
    window.photoApp = app;
    
  } catch (error) {
    console.error('应用启动失败:', error);
    
    // 显示错误信息
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

// 导出应用类供其他模块使用
export { PhotoApp };