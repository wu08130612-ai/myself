// 主入口文件 - 整合所有模块并初始化应用

import { DatabaseManager } from './database.js';
import { AlbumManager } from './albums.js';
import { PhotoManager } from './photos.js';
import { UIManager } from './ui.js';
import { notificationManager } from './notifications.js';

// 全局应用实例
class PhotoAlbumApp {
  constructor() {
    this.db = null;
    this.albumManager = null;
    this.photoManager = null;
    this.ui = null;
    this.notifications = notificationManager;
    
    this.isInitialized = false;
  }

  // 初始化应用
  async init() {
    try {
      this.notifications.info('正在初始化应用...', { duration: 2000 });
      
      // 初始化数据库
      this.db = new DatabaseManager();
      await this.db.init();
      
      // 初始化管理器
      this.albumManager = new AlbumManager(this.db);
      this.photoManager = new PhotoManager(this.db);
      this.ui = new UIManager();
      
      // 设置事件监听器
      this.setupEventListeners();
      
      // 加载初始数据
      await this.loadInitialData();
      
      this.isInitialized = true;
      this.notifications.success('应用初始化完成！');
      
      console.log('Photo Album App initialized successfully');
      
    } catch (error) {
      console.error('应用初始化失败:', error);
      this.notifications.error('应用初始化失败: ' + error.message);
    }
  }

  // 设置事件监听器
  setupEventListeners() {
    // 创建相册按钮
    const createAlbumBtn = document.getElementById('create-album-btn');
    if (createAlbumBtn) {
      createAlbumBtn.addEventListener('click', () => this.showCreateAlbumModal());
    }

    // 添加照片按钮
    const addPhotosBtn = document.getElementById('add-photos-btn');
    if (addPhotosBtn) {
      addPhotosBtn.addEventListener('click', () => this.addPhotos());
    }

    // 删除选中照片按钮
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    if (deleteSelectedBtn) {
      deleteSelectedBtn.addEventListener('click', () => this.deleteSelectedPhotos());
    }

    // 移动选中照片按钮
    const moveSelectedBtn = document.getElementById('move-selected-btn');
    if (moveSelectedBtn) {
      moveSelectedBtn.addEventListener('click', () => this.moveSelectedPhotos());
    }

    // 文件输入变化
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
    }

    // 创建相册表单提交
    const createAlbumForm = document.getElementById('create-album-form');
    if (createAlbumForm) {
      createAlbumForm.addEventListener('submit', (e) => this.handleCreateAlbum(e));
    }

    // 自定义事件监听
    window.addEventListener('refreshPhotos', () => this.refreshCurrentView());
    window.addEventListener('refreshAlbums', () => this.loadAlbums());
  }

  // 加载初始数据
  async loadInitialData() {
    await this.loadAlbums();
  }

  // 加载相册列表
  async loadAlbums() {
    try {
      this.ui.showLoading('加载相册中...');
      
      const albums = await this.albumManager.getAllAlbums();
      
      // 为每个相册获取照片数量和封面
      for (const album of albums) {
        const photos = await this.photoManager.getPhotosByAlbum(album.id);
        album.photoCount = photos.length;
        
        if (photos.length > 0) {
          album.coverPhoto = photos[0].thumbnail || photos[0].data;
        }
      }
      
      this.ui.renderAlbums(albums);
      this.ui.hideLoading();
      
    } catch (error) {
      console.error('加载相册失败:', error);
      this.notifications.error('加载相册失败: ' + error.message);
      this.ui.hideLoading();
    }
  }

  // 打开相册
  async openAlbum(albumId) {
    try {
      this.ui.showLoading('加载照片中...');
      
      const album = await this.albumManager.getAlbum(albumId);
      const photos = await this.photoManager.getPhotosByAlbum(albumId);
      
      this.ui.showAlbumDetailView(albumId);
      this.ui.renderPhotos(photos, album);
      this.ui.hideLoading();
      
    } catch (error) {
      console.error('打开相册失败:', error);
      this.notifications.error('打开相册失败: ' + error.message);
      this.ui.hideLoading();
    }
  }

  // 显示创建相册模态框
  showCreateAlbumModal() {
    this.ui.showModal('create-album-modal');
  }

  // 处理创建相册
  async handleCreateAlbum(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const albumData = {
      name: formData.get('name').trim(),
      description: formData.get('description').trim()
    };

    if (!albumData.name) {
      this.notifications.warning('请输入相册名称');
      return;
    }

    try {
      this.ui.showLoading('创建相册中...');
      
      const album = await this.albumManager.createAlbum(albumData);
      
      this.ui.closeModal('create-album-modal');
      this.ui.hideLoading();
      
      this.notifications.success('相册创建成功！');
      await this.loadAlbums();
      
    } catch (error) {
      console.error('创建相册失败:', error);
      this.notifications.error('创建相册失败: ' + error.message);
      this.ui.hideLoading();
    }
  }

  // 编辑相册
  async editAlbum(albumId) {
    try {
      const album = await this.albumManager.getAlbum(albumId);
      if (!album) {
        this.notifications.error('相册不存在');
        return;
      }

      const newName = prompt('请输入新的相册名称:', album.name);
      if (newName && newName.trim() && newName.trim() !== album.name) {
        await this.albumManager.updateAlbum(albumId, { name: newName.trim() });
        this.notifications.success('相册名称已更新');
        await this.loadAlbums();
      }
      
    } catch (error) {
      console.error('编辑相册失败:', error);
      this.notifications.error('编辑相册失败: ' + error.message);
    }
  }

  // 删除相册
  async deleteAlbum(albumId) {
    try {
      const album = await this.albumManager.getAlbum(albumId);
      if (!album) {
        this.notifications.error('相册不存在');
        return;
      }

      const photos = await this.photoManager.getPhotosByAlbum(albumId);
      const message = photos.length > 0 
        ? `确定要删除相册"${album.name}"吗？这将同时删除其中的 ${photos.length} 张照片。`
        : `确定要删除相册"${album.name}"吗？`;

      this.notifications.confirm(
        message,
        async () => {
          try {
            this.ui.showLoading('删除相册中...');
            await this.albumManager.deleteAlbum(albumId);
            this.ui.hideLoading();
            this.notifications.success('相册已删除');
            await this.loadAlbums();
          } catch (error) {
            console.error('删除相册失败:', error);
            this.notifications.error('删除相册失败: ' + error.message);
            this.ui.hideLoading();
          }
        }
      );
      
    } catch (error) {
      console.error('删除相册失败:', error);
      this.notifications.error('删除相册失败: ' + error.message);
    }
  }

  // 添加照片
  addPhotos() {
    if (!this.ui.currentAlbumId) {
      this.notifications.warning('请先选择一个相册');
      return;
    }

    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  }

  // 处理文件选择
  async handleFileSelection(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (!this.ui.currentAlbumId) {
      this.notifications.warning('请先选择一个相册');
      return;
    }

    try {
      this.ui.showLoading(`正在添加 ${files.length} 张照片...`);
      
      const result = await this.photoManager.addPhotos(files, this.ui.currentAlbumId);
      
      this.ui.hideLoading();
      
      if (result.successCount > 0) {
        this.notifications.success(`成功添加 ${result.successCount} 张照片`);
      }
      
      if (result.errorCount > 0) {
        this.notifications.warning(`${result.errorCount} 张照片添加失败`);
        console.log('添加失败的照片:', result.errors);
      }
      
      // 刷新当前视图
      await this.refreshCurrentView();
      
      // 清空文件输入
      event.target.value = '';
      
    } catch (error) {
      console.error('添加照片失败:', error);
      this.notifications.error('添加照片失败: ' + error.message);
      this.ui.hideLoading();
    }
  }

  // 预览照片
  async previewPhoto(photoId) {
    try {
      const photo = await this.photoManager.getPhoto(photoId);
      if (photo) {
        this.ui.showPhotoPreview(photo);
      }
    } catch (error) {
      console.error('预览照片失败:', error);
      this.notifications.error('预览照片失败: ' + error.message);
    }
  }

  // 下载照片
  async downloadPhoto(photoId) {
    try {
      await this.photoManager.downloadPhoto(photoId);
      this.notifications.success('照片下载完成');
    } catch (error) {
      console.error('下载照片失败:', error);
      this.notifications.error('下载照片失败: ' + error.message);
    }
  }

  // 删除照片
  async deletePhoto(photoId) {
    try {
      const photo = await this.photoManager.getPhoto(photoId);
      if (!photo) {
        this.notifications.error('照片不存在');
        return;
      }

      this.notifications.confirm(
        `确定要删除照片"${photo.name}"吗？`,
        async () => {
          try {
            await this.photoManager.deletePhoto(photoId);
            this.notifications.success('照片已删除');
            await this.refreshCurrentView();
          } catch (error) {
            console.error('删除照片失败:', error);
            this.notifications.error('删除照片失败: ' + error.message);
          }
        }
      );
      
    } catch (error) {
      console.error('删除照片失败:', error);
      this.notifications.error('删除照片失败: ' + error.message);
    }
  }

  // 切换照片选择
  togglePhotoSelection(photoId) {
    this.ui.togglePhotoSelection(photoId);
  }

  // 删除选中的照片
  async deleteSelectedPhotos() {
    const selectedPhotos = this.ui.getSelectedPhotos();
    if (selectedPhotos.length === 0) {
      this.notifications.warning('请先选择要删除的照片');
      return;
    }

    this.notifications.confirm(
      `确定要删除选中的 ${selectedPhotos.length} 张照片吗？`,
      async () => {
        try {
          this.ui.showLoading('删除照片中...');
          
          const result = await this.photoManager.deletePhotos(selectedPhotos);
          
          this.ui.hideLoading();
          this.ui.exitSelectionMode();
          
          if (result.successCount > 0) {
            this.notifications.success(`成功删除 ${result.successCount} 张照片`);
          }
          
          if (result.errorCount > 0) {
            this.notifications.warning(`${result.errorCount} 张照片删除失败`);
          }
          
          await this.refreshCurrentView();
          
        } catch (error) {
          console.error('批量删除照片失败:', error);
          this.notifications.error('批量删除照片失败: ' + error.message);
          this.ui.hideLoading();
        }
      }
    );
  }

  // 移动选中的照片
  async moveSelectedPhotos() {
    const selectedPhotos = this.ui.getSelectedPhotos();
    if (selectedPhotos.length === 0) {
      this.notifications.warning('请先选择要移动的照片');
      return;
    }

    try {
      // 获取所有相册
      const albums = await this.albumManager.getAllAlbums();
      const currentAlbumId = this.ui.currentAlbumId;
      
      // 过滤掉当前相册
      const targetAlbums = albums.filter(album => album.id !== currentAlbumId);
      
      if (targetAlbums.length === 0) {
        this.notifications.warning('没有其他相册可以移动到');
        return;
      }

      // 简单的选择目标相册（在实际应用中可以使用更好的UI）
      const albumNames = targetAlbums.map(album => album.name);
      const selectedIndex = prompt(`选择目标相册:\n${albumNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}\n\n请输入序号:`);
      
      if (!selectedIndex || isNaN(selectedIndex) || selectedIndex < 1 || selectedIndex > targetAlbums.length) {
        return;
      }

      const targetAlbum = targetAlbums[selectedIndex - 1];
      
      this.ui.showLoading('移动照片中...');
      
      const result = await this.photoManager.movePhotos(selectedPhotos, targetAlbum.id);
      
      this.ui.hideLoading();
      this.ui.exitSelectionMode();
      
      if (result.successCount > 0) {
        this.notifications.success(`成功移动 ${result.successCount} 张照片到"${targetAlbum.name}"`);
      }
      
      if (result.errorCount > 0) {
        this.notifications.warning(`${result.errorCount} 张照片移动失败`);
      }
      
      await this.refreshCurrentView();
      
    } catch (error) {
      console.error('移动照片失败:', error);
      this.notifications.error('移动照片失败: ' + error.message);
      this.ui.hideLoading();
    }
  }

  // 刷新当前视图
  async refreshCurrentView() {
    if (this.ui.currentView === 'albums') {
      await this.loadAlbums();
    } else if (this.ui.currentView === 'album-detail' && this.ui.currentAlbumId) {
      await this.openAlbum(this.ui.currentAlbumId);
    }
  }

  // 搜索功能
  async search(query) {
    if (!query.trim()) {
      await this.refreshCurrentView();
      return;
    }

    try {
      this.ui.showLoading('搜索中...');
      
      if (this.ui.currentView === 'albums') {
        // 搜索相册
        const albums = await this.albumManager.searchAlbums(query);
        this.ui.renderAlbums(albums);
      } else if (this.ui.currentView === 'album-detail') {
        // 搜索当前相册中的照片
        const photos = await this.photoManager.searchPhotos(query, this.ui.currentAlbumId);
        const album = await this.albumManager.getAlbum(this.ui.currentAlbumId);
        this.ui.renderPhotos(photos, album);
      }
      
      this.ui.hideLoading();
      
    } catch (error) {
      console.error('搜索失败:', error);
      this.notifications.error('搜索失败: ' + error.message);
      this.ui.hideLoading();
    }
  }

  // 获取应用统计信息
  async getStats() {
    try {
      const albumCount = await this.db.countAlbums();
      const photoCount = await this.db.countPhotos();
      const totalSize = await this.db.getTotalSize();
      
      return {
        albumCount,
        photoCount,
        totalSize: this.db.formatFileSize(totalSize)
      };
      
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return null;
    }
  }

  // 导出数据
  async exportData() {
    try {
      this.ui.showLoading('导出数据中...');
      
      const data = await this.db.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `photo-album-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      this.ui.hideLoading();
      this.notifications.success('数据导出完成');
      
    } catch (error) {
      console.error('导出数据失败:', error);
      this.notifications.error('导出数据失败: ' + error.message);
      this.ui.hideLoading();
    }
  }

  // 导入数据
  async importData(file) {
    try {
      this.ui.showLoading('导入数据中...');
      
      const text = await file.text();
      const data = JSON.parse(text);
      
      await this.db.importData(data);
      
      this.ui.hideLoading();
      this.notifications.success('数据导入完成');
      
      await this.refreshCurrentView();
      
    } catch (error) {
      console.error('导入数据失败:', error);
      this.notifications.error('导入数据失败: ' + error.message);
      this.ui.hideLoading();
    }
  }
}

// 创建全局应用实例
const app = new PhotoAlbumApp();

// 将应用实例暴露到全局作用域，供HTML中的事件处理器使用
window.app = app;

// 当DOM加载完成时初始化应用
document.addEventListener('DOMContentLoaded', async () => {
  await app.init();
});

// 导出应用类
export { PhotoAlbumApp };