// 数据库管理模块 - 使用 IndexedDB 进行本地存储

class DatabaseManager {
  constructor() {
    this.dbName = 'PhotoAppDB';
    this.dbVersion = 1;
    this.db = null;
    
    // 数据库表结构
    this.stores = {
      albums: {
        name: 'albums',
        keyPath: 'id',
        indexes: [
          { name: 'name', keyPath: 'name', unique: false },
          { name: 'createdAt', keyPath: 'createdAt', unique: false },
          { name: 'updatedAt', keyPath: 'updatedAt', unique: false }
        ]
      },
      photos: {
        name: 'photos',
        keyPath: 'id',
        indexes: [
          { name: 'albumId', keyPath: 'albumId', unique: false },
          { name: 'name', keyPath: 'name', unique: false },
          { name: 'createdAt', keyPath: 'createdAt', unique: false },
          { name: 'size', keyPath: 'size', unique: false }
        ]
      }
    };
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        reject(new Error('数据库打开失败: ' + request.error));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('数据库初始化成功');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建相册表
        if (!db.objectStoreNames.contains(this.stores.albums.name)) {
          const albumStore = db.createObjectStore(
            this.stores.albums.name,
            { keyPath: this.stores.albums.keyPath }
          );
          
          // 创建索引
          this.stores.albums.indexes.forEach(index => {
            albumStore.createIndex(index.name, index.keyPath, { unique: index.unique });
          });
        }
        
        // 创建照片表
        if (!db.objectStoreNames.contains(this.stores.photos.name)) {
          const photoStore = db.createObjectStore(
            this.stores.photos.name,
            { keyPath: this.stores.photos.keyPath }
          );
          
          // 创建索引
          this.stores.photos.indexes.forEach(index => {
            photoStore.createIndex(index.name, index.keyPath, { unique: index.unique });
          });
        }
        
        console.log('数据库结构创建完成');
      };
    });
  }

  // 通用数据库操作方法
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('添加数据失败: ' + request.error));
    });
  }

  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('更新数据失败: ' + request.error));
    });
  }

  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('获取数据失败: ' + request.error));
    });
  }

  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除数据失败: ' + request.error));
    });
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('获取所有数据失败: ' + request.error));
    });
  }

  async getAllByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('通过索引获取数据失败: ' + request.error));
    });
  }

  async count(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('计数失败: ' + request.error));
    });
  }

  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('清空数据失败: ' + request.error));
    });
  }

  // 相册相关操作
  async addAlbum(album) {
    const albumData = {
      id: this.generateId(),
      name: album.name,
      description: album.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coverPhotoId: null
    };
    
    await this.add('albums', albumData);
    return albumData;
  }

  async updateAlbum(id, updates) {
    const album = await this.get('albums', id);
    if (!album) {
      throw new Error('相册不存在');
    }
    
    const updatedAlbum = {
      ...album,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.put('albums', updatedAlbum);
    return updatedAlbum;
  }

  async deleteAlbum(id) {
    await this.delete('albums', id);
  }

  async getAlbum(id) {
    return await this.get('albums', id);
  }

  async getAllAlbums() {
    const albums = await this.getAll('albums');
    return albums.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // 照片相关操作
  async addPhoto(photo) {
    const photoData = {
      id: this.generateId(),
      albumId: photo.albumId,
      name: photo.name,
      originalName: photo.originalName,
      size: photo.size,
      type: photo.type,
      data: photo.data, // Base64 编码的图片数据
      thumbnail: photo.thumbnail, // 缩略图数据
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.add('photos', photoData);
    return photoData;
  }

  async updatePhoto(id, updates) {
    const photo = await this.get('photos', id);
    if (!photo) {
      throw new Error('照片不存在');
    }
    
    const updatedPhoto = {
      ...photo,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.put('photos', updatedPhoto);
    return updatedPhoto;
  }

  async deletePhoto(id) {
    await this.delete('photos', id);
  }

  async getPhoto(id) {
    return await this.get('photos', id);
  }

  async getPhotosByAlbum(albumId) {
    const photos = await this.getAllByIndex('photos', 'albumId', albumId);
    return photos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getAllPhotos() {
    const photos = await this.getAll('photos');
    return photos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // 统计信息
  async getStats() {
    const albumCount = await this.count('albums');
    const photoCount = await this.count('photos');
    
    const photos = await this.getAllPhotos();
    const totalSize = photos.reduce((sum, photo) => sum + (photo.size || 0), 0);
    
    return {
      albumCount,
      photoCount,
      totalSize,
      formattedSize: this.formatFileSize(totalSize)
    };
  }

  // 搜索功能
  async searchPhotos(query) {
    const photos = await this.getAllPhotos();
    const lowercaseQuery = query.toLowerCase();
    
    return photos.filter(photo => 
      photo.name.toLowerCase().includes(lowercaseQuery) ||
      photo.originalName.toLowerCase().includes(lowercaseQuery)
    );
  }

  async searchAlbums(query) {
    const albums = await this.getAllAlbums();
    const lowercaseQuery = query.toLowerCase();
    
    return albums.filter(album => 
      album.name.toLowerCase().includes(lowercaseQuery) ||
      (album.description && album.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  // 数据导出和导入
  async exportData() {
    const albums = await this.getAllAlbums();
    const photos = await this.getAllPhotos();
    
    return {
      version: this.dbVersion,
      exportDate: new Date().toISOString(),
      albums,
      photos
    };
  }

  async importData(data) {
    if (!data.albums || !data.photos) {
      throw new Error('导入数据格式不正确');
    }
    
    // 清空现有数据
    await this.clear('albums');
    await this.clear('photos');
    
    // 导入相册
    for (const album of data.albums) {
      await this.add('albums', album);
    }
    
    // 导入照片
    for (const photo of data.photos) {
      await this.add('photos', photo);
    }
  }

  // 数据库维护
  async vacuum() {
    // IndexedDB 不需要手动维护，但可以在这里实现数据清理逻辑
    console.log('数据库维护完成');
  }

  async backup() {
    const data = await this.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `photo-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 工具方法
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export { DatabaseManager };