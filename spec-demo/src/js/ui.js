// UI 管理模块 - 处理用户界面的渲染和交互

class UIManager {
  constructor() {
    this.currentView = 'albums'; // 'albums' 或 'album-detail'
    this.currentAlbumId = null;
    this.selectedPhotos = new Set();
    this.isSelectionMode = false;
    
    // DOM 元素引用
    this.elements = {
      albumsView: document.getElementById('albums-view'),
      albumDetailView: document.getElementById('album-detail-view'),
      albumsGrid: document.getElementById('albums-grid'),
      photosGrid: document.getElementById('photos-grid'),
      albumTitle: document.getElementById('album-title'),
      albumInfo: document.getElementById('album-info'),
      backButton: document.getElementById('back-to-albums'),
      createAlbumBtn: document.getElementById('create-album-btn'),
      addPhotosBtn: document.getElementById('add-photos-btn'),
      selectPhotosBtn: document.getElementById('select-photos-btn'),
      deleteSelectedBtn: document.getElementById('delete-selected-btn'),
      moveSelectedBtn: document.getElementById('move-selected-btn'),
      fileInput: document.getElementById('photo-file-input'),
      createAlbumModal: document.getElementById('create-album-modal'),
      photoPreviewModal: document.getElementById('photo-preview-modal'),
      loadingIndicator: document.getElementById('loading-indicator'),
      notificationContainer: document.getElementById('notification-container')
    };
    
    this.initializeEventListeners();
  }

  // 初始化事件监听器
  initializeEventListeners() {
    // 返回按钮
    if (this.elements.backButton) {
      this.elements.backButton.addEventListener('click', () => {
        this.showAlbumsView();
      });
    }

    // 选择模式切换
    if (this.elements.selectPhotosBtn) {
      this.elements.selectPhotosBtn.addEventListener('click', () => {
        this.toggleSelectionMode();
      });
    }

    // 模态框关闭
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target);
      }
    });

    // ESC 键关闭模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // 阻止模态框内容区域的点击事件冒泡
    document.querySelectorAll('.modal-content').forEach(content => {
      content.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });
  }

  // 显示相册视图
  showAlbumsView() {
    this.currentView = 'albums';
    this.currentAlbumId = null;
    this.exitSelectionMode();
    
    if (this.elements.albumsView) {
      this.elements.albumsView.style.display = 'block';
    }
    if (this.elements.albumDetailView) {
      this.elements.albumDetailView.style.display = 'none';
    }
  }

  // 显示相册详情视图
  showAlbumDetailView(albumId) {
    this.currentView = 'album-detail';
    this.currentAlbumId = albumId;
    this.exitSelectionMode();
    
    if (this.elements.albumsView) {
      this.elements.albumsView.style.display = 'none';
    }
    if (this.elements.albumDetailView) {
      this.elements.albumDetailView.style.display = 'block';
    }
  }

  // 渲染相册网格
  renderAlbums(albums) {
    if (!this.elements.albumsGrid) return;
    
    if (albums.length === 0) {
      this.elements.albumsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📁</div>
          <h3>还没有相册</h3>
          <p>创建您的第一个相册来开始整理照片</p>
          <button class="btn btn-primary" onclick="app.showCreateAlbumModal()">
            创建相册
          </button>
        </div>
      `;
      return;
    }
    
    const albumsHTML = albums.map(album => this.renderAlbumCard(album)).join('');
    this.elements.albumsGrid.innerHTML = albumsHTML;
  }

  // 渲染单个相册卡片
  renderAlbumCard(album) {
    const coverImage = album.coverPhoto ? 
      `<img src="${album.coverPhoto}" alt="${album.name}" class="album-cover">` :
      `<div class="album-cover-placeholder">
        <div class="album-icon">📷</div>
      </div>`;
    
    return `
      <div class="album-card" data-album-id="${album.id}">
        <div class="album-cover-container" onclick="app.openAlbum('${album.id}')">
          ${coverImage}
          <div class="album-overlay">
            <span class="photo-count">${album.photoCount || 0} 张照片</span>
          </div>
        </div>
        <div class="album-info">
          <h3 class="album-name">${this.escapeHtml(album.name)}</h3>
          <p class="album-description">${this.escapeHtml(album.description || '')}</p>
          <div class="album-meta">
            <span class="album-date">${this.formatDate(album.createdAt)}</span>
          </div>
        </div>
        <div class="album-actions">
          <button class="btn-icon" onclick="app.editAlbum('${album.id}')" title="编辑相册">
            ✏️
          </button>
          <button class="btn-icon" onclick="app.deleteAlbum('${album.id}')" title="删除相册">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  // 渲染照片网格
  renderPhotos(photos, album = null) {
    if (!this.elements.photosGrid) return;
    
    // 更新相册信息
    if (album && this.elements.albumTitle && this.elements.albumInfo) {
      this.elements.albumTitle.textContent = album.name;
      this.elements.albumInfo.textContent = `${photos.length} 张照片`;
    }
    
    if (photos.length === 0) {
      this.elements.photosGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🖼️</div>
          <h3>相册是空的</h3>
          <p>添加一些照片来填充这个相册</p>
          <button class="btn btn-primary" onclick="app.addPhotos()">
            添加照片
          </button>
        </div>
      `;
      return;
    }
    
    const photosHTML = photos.map(photo => this.renderPhotoItem(photo)).join('');
    this.elements.photosGrid.innerHTML = photosHTML;
  }

  // 渲染单个照片项
  renderPhotoItem(photo) {
    const isSelected = this.selectedPhotos.has(photo.id);
    const selectionClass = this.isSelectionMode ? 'selection-mode' : '';
    const selectedClass = isSelected ? 'selected' : '';
    
    return `
      <div class="photo-item ${selectionClass} ${selectedClass}" data-photo-id="${photo.id}">
        <div class="photo-container">
          <img src="${photo.thumbnail || photo.data}" 
               alt="${this.escapeHtml(photo.name)}" 
               class="photo-image"
               onclick="app.${this.isSelectionMode ? 'togglePhotoSelection' : 'previewPhoto'}('${photo.id}')">
          
          ${this.isSelectionMode ? `
            <div class="photo-checkbox">
              <input type="checkbox" ${isSelected ? 'checked' : ''} 
                     onchange="app.togglePhotoSelection('${photo.id}')">
            </div>
          ` : ''}
          
          <div class="photo-overlay">
            <div class="photo-info">
              <span class="photo-name">${this.escapeHtml(photo.name)}</span>
              <span class="photo-size">${this.formatFileSize(photo.size)}</span>
            </div>
            ${!this.isSelectionMode ? `
              <div class="photo-actions">
                <button class="btn-icon" onclick="app.downloadPhoto('${photo.id}')" title="下载">
                  ⬇️
                </button>
                <button class="btn-icon" onclick="app.deletePhoto('${photo.id}')" title="删除">
                  🗑️
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // 切换选择模式
  toggleSelectionMode() {
    this.isSelectionMode = !this.isSelectionMode;
    this.selectedPhotos.clear();
    
    // 更新按钮文本
    if (this.elements.selectPhotosBtn) {
      this.elements.selectPhotosBtn.textContent = this.isSelectionMode ? '取消选择' : '选择照片';
    }
    
    // 显示/隐藏批量操作按钮
    this.updateBatchActionButtons();
    
    // 重新渲染照片网格
    if (this.currentView === 'album-detail' && this.currentAlbumId) {
      // 触发照片重新渲染
      window.dispatchEvent(new CustomEvent('refreshPhotos'));
    }
  }

  // 退出选择模式
  exitSelectionMode() {
    if (this.isSelectionMode) {
      this.isSelectionMode = false;
      this.selectedPhotos.clear();
      
      if (this.elements.selectPhotosBtn) {
        this.elements.selectPhotosBtn.textContent = '选择照片';
      }
      
      this.updateBatchActionButtons();
    }
  }

  // 切换照片选择状态
  togglePhotoSelection(photoId) {
    if (this.selectedPhotos.has(photoId)) {
      this.selectedPhotos.delete(photoId);
    } else {
      this.selectedPhotos.add(photoId);
    }
    
    this.updateBatchActionButtons();
    this.updatePhotoSelectionUI(photoId);
  }

  // 更新照片选择UI
  updatePhotoSelectionUI(photoId) {
    const photoElement = document.querySelector(`[data-photo-id="${photoId}"]`);
    if (photoElement) {
      const isSelected = this.selectedPhotos.has(photoId);
      const checkbox = photoElement.querySelector('input[type="checkbox"]');
      
      if (isSelected) {
        photoElement.classList.add('selected');
        if (checkbox) checkbox.checked = true;
      } else {
        photoElement.classList.remove('selected');
        if (checkbox) checkbox.checked = false;
      }
    }
  }

  // 更新批量操作按钮
  updateBatchActionButtons() {
    const hasSelection = this.selectedPhotos.size > 0;
    
    if (this.elements.deleteSelectedBtn) {
      this.elements.deleteSelectedBtn.style.display = 
        this.isSelectionMode && hasSelection ? 'inline-block' : 'none';
    }
    
    if (this.elements.moveSelectedBtn) {
      this.elements.moveSelectedBtn.style.display = 
        this.isSelectionMode && hasSelection ? 'inline-block' : 'none';
    }
  }

  // 显示模态框
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      // 聚焦到第一个输入框
      const firstInput = modal.querySelector('input, textarea');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }

  // 关闭模态框
  closeModal(modal) {
    if (typeof modal === 'string') {
      modal = document.getElementById(modal);
    }
    if (modal) {
      modal.style.display = 'none';
      // 清空表单
      const form = modal.querySelector('form');
      if (form) {
        form.reset();
      }
    }
  }

  // 关闭所有模态框
  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      this.closeModal(modal);
    });
  }

  // 显示照片预览
  showPhotoPreview(photo) {
    const modal = this.elements.photoPreviewModal;
    if (!modal) return;
    
    const img = modal.querySelector('.preview-image');
    const title = modal.querySelector('.preview-title');
    const info = modal.querySelector('.preview-info');
    
    if (img) img.src = photo.data;
    if (title) title.textContent = photo.name;
    if (info) {
      info.innerHTML = `
        <p><strong>尺寸:</strong> ${photo.width} × ${photo.height}</p>
        <p><strong>大小:</strong> ${this.formatFileSize(photo.size)}</p>
        <p><strong>类型:</strong> ${photo.type}</p>
        <p><strong>创建时间:</strong> ${this.formatDate(photo.createdAt)}</p>
      `;
    }
    
    this.showModal('photo-preview-modal');
  }

  // 显示加载指示器
  showLoading(message = '加载中...') {
    if (this.elements.loadingIndicator) {
      const textElement = this.elements.loadingIndicator.querySelector('p');
      if (textElement) {
        textElement.textContent = message;
      }
      this.elements.loadingIndicator.style.display = 'flex';
    }
  }

  // 隐藏加载指示器
  hideLoading() {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.style.display = 'none';
    }
  }

  // 显示通知
  showNotification(message, type = 'info', duration = 3000) {
    if (!this.elements.notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-message">${this.escapeHtml(message)}</span>
      <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    this.elements.notificationContainer.appendChild(notification);
    
    // 自动移除通知
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, duration);
    }
    
    return notification;
  }

  // 显示确认对话框
  showConfirmDialog(message, onConfirm, onCancel = null) {
    const confirmed = confirm(message);
    if (confirmed && onConfirm) {
      onConfirm();
    } else if (!confirmed && onCancel) {
      onCancel();
    }
  }

  // 更新相册统计信息
  updateAlbumStats(albumId, stats) {
    const albumCard = document.querySelector(`[data-album-id="${albumId}"]`);
    if (albumCard) {
      const photoCount = albumCard.querySelector('.photo-count');
      if (photoCount) {
        photoCount.textContent = `${stats.photoCount || 0} 张照片`;
      }
      
      // 更新封面图片
      if (stats.coverPhoto) {
        const coverImg = albumCard.querySelector('.album-cover');
        if (coverImg) {
          coverImg.src = stats.coverPhoto;
        }
      }
    }
  }

  // 工具方法：转义HTML
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 工具方法：格式化日期
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // 工具方法：格式化文件大小
  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // 获取当前选中的照片
  getSelectedPhotos() {
    return Array.from(this.selectedPhotos);
  }

  // 清空选择
  clearSelection() {
    this.selectedPhotos.clear();
    this.updateBatchActionButtons();
    
    // 更新UI
    document.querySelectorAll('.photo-item.selected').forEach(item => {
      item.classList.remove('selected');
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.checked = false;
    });
  }

  // 全选照片
  selectAllPhotos() {
    const photoItems = document.querySelectorAll('.photo-item');
    photoItems.forEach(item => {
      const photoId = item.dataset.photoId;
      if (photoId) {
        this.selectedPhotos.add(photoId);
        item.classList.add('selected');
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = true;
      }
    });
    
    this.updateBatchActionButtons();
  }

  // 获取当前视图状态
  getCurrentState() {
    return {
      view: this.currentView,
      albumId: this.currentAlbumId,
      isSelectionMode: this.isSelectionMode,
      selectedPhotos: Array.from(this.selectedPhotos)
    };
  }

  // 恢复视图状态
  restoreState(state) {
    this.currentView = state.view || 'albums';
    this.currentAlbumId = state.albumId || null;
    this.isSelectionMode = state.isSelectionMode || false;
    this.selectedPhotos = new Set(state.selectedPhotos || []);
    
    this.updateBatchActionButtons();
  }
}

export { UIManager };