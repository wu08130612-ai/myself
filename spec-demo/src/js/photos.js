// 照片管理模块 - 处理照片的上传、处理、删除等操作

class PhotoManager {
  constructor(database) {
    this.db = database;
    this.supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.thumbnailSize = 200; // 缩略图尺寸
  }

  // 添加照片
  async addPhoto(file, albumId) {
    try {
      // 验证文件
      this.validateFile(file);
      
      // 验证相册存在
      const album = await this.db.getAlbum(albumId);
      if (!album) {
        throw new Error('相册不存在');
      }
      
      // 处理图片
      const processedImage = await this.processImage(file);
      
      // 创建照片数据
      const photoData = {
        albumId,
        name: this.generatePhotoName(file.name),
        originalName: file.name,
        size: file.size,
        type: file.type,
        data: processedImage.data,
        thumbnail: processedImage.thumbnail,
        width: processedImage.width,
        height: processedImage.height
      };
      
      // 保存到数据库
      const photo = await this.db.addPhoto(photoData);
      
      return photo;
      
    } catch (error) {
      console.error('添加照片失败:', error);
      throw error;
    }
  }

  // 批量添加照片
  async addPhotos(files, albumId) {
    try {
      const results = [];
      const errors = [];
      
      for (let i = 0; i < files.length; i++) {
        try {
          const photo = await this.addPhoto(files[i], albumId);
          results.push(photo);
        } catch (error) {
          errors.push({
            file: files[i].name,
            error: error.message
          });
        }
      }
      
      return {
        success: results,
        errors,
        successCount: results.length,
        errorCount: errors.length
      };
      
    } catch (error) {
      console.error('批量添加照片失败:', error);
      throw error;
    }
  }

  // 更新照片信息
  async updatePhoto(photoId, updates) {
    try {
      const photo = await this.db.getPhoto(photoId);
      if (!photo) {
        throw new Error('照片不存在');
      }
      
      // 验证更新数据
      if (updates.name) {
        updates.name = this.sanitizeFileName(updates.name);
      }
      
      if (updates.albumId) {
        const album = await this.db.getAlbum(updates.albumId);
        if (!album) {
          throw new Error('目标相册不存在');
        }
      }
      
      const updatedPhoto = await this.db.updatePhoto(photoId, updates);
      return updatedPhoto;
      
    } catch (error) {
      console.error('更新照片失败:', error);
      throw error;
    }
  }

  // 删除照片
  async deletePhoto(photoId) {
    try {
      const photo = await this.db.getPhoto(photoId);
      if (!photo) {
        throw new Error('照片不存在');
      }
      
      await this.db.deletePhoto(photoId);
      
      return true;
      
    } catch (error) {
      console.error('删除照片失败:', error);
      throw error;
    }
  }

  // 批量删除照片
  async deletePhotos(photoIds) {
    try {
      const results = [];
      const errors = [];
      
      for (const photoId of photoIds) {
        try {
          await this.deletePhoto(photoId);
          results.push(photoId);
        } catch (error) {
          errors.push({
            photoId,
            error: error.message
          });
        }
      }
      
      return {
        success: results,
        errors,
        successCount: results.length,
        errorCount: errors.length
      };
      
    } catch (error) {
      console.error('批量删除照片失败:', error);
      throw error;
    }
  }

  // 获取照片
  async getPhoto(photoId) {
    try {
      const photo = await this.db.getPhoto(photoId);
      if (!photo) {
        throw new Error('照片不存在');
      }
      
      return photo;
      
    } catch (error) {
      console.error('获取照片失败:', error);
      throw error;
    }
  }

  // 获取相册中的照片
  async getPhotosByAlbum(albumId) {
    try {
      const photos = await this.db.getPhotosByAlbum(albumId);
      return photos;
      
    } catch (error) {
      console.error('获取相册照片失败:', error);
      throw error;
    }
  }

  // 移动照片到其他相册
  async movePhotos(photoIds, targetAlbumId) {
    try {
      // 验证目标相册存在
      const targetAlbum = await this.db.getAlbum(targetAlbumId);
      if (!targetAlbum) {
        throw new Error('目标相册不存在');
      }
      
      const results = [];
      const errors = [];
      
      for (const photoId of photoIds) {
        try {
          await this.updatePhoto(photoId, { albumId: targetAlbumId });
          results.push(photoId);
        } catch (error) {
          errors.push({
            photoId,
            error: error.message
          });
        }
      }
      
      return {
        success: results,
        errors,
        successCount: results.length,
        errorCount: errors.length
      };
      
    } catch (error) {
      console.error('移动照片失败:', error);
      throw error;
    }
  }

  // 复制照片到其他相册
  async copyPhotos(photoIds, targetAlbumId) {
    try {
      // 验证目标相册存在
      const targetAlbum = await this.db.getAlbum(targetAlbumId);
      if (!targetAlbum) {
        throw new Error('目标相册不存在');
      }
      
      const results = [];
      const errors = [];
      
      for (const photoId of photoIds) {
        try {
          const originalPhoto = await this.db.getPhoto(photoId);
          if (!originalPhoto) {
            throw new Error('原照片不存在');
          }
          
          const newPhoto = {
            ...originalPhoto,
            albumId: targetAlbumId,
            name: this.generateCopyName(originalPhoto.name)
          };
          delete newPhoto.id; // 让数据库生成新的ID
          
          const copiedPhoto = await this.db.addPhoto(newPhoto);
          results.push(copiedPhoto);
          
        } catch (error) {
          errors.push({
            photoId,
            error: error.message
          });
        }
      }
      
      return {
        success: results,
        errors,
        successCount: results.length,
        errorCount: errors.length
      };
      
    } catch (error) {
      console.error('复制照片失败:', error);
      throw error;
    }
  }

  // 搜索照片
  async searchPhotos(query, albumId = null) {
    try {
      let photos;
      
      if (albumId) {
        photos = await this.db.getPhotosByAlbum(albumId);
        const lowercaseQuery = query.toLowerCase();
        photos = photos.filter(photo => 
          photo.name.toLowerCase().includes(lowercaseQuery) ||
          photo.originalName.toLowerCase().includes(lowercaseQuery)
        );
      } else {
        photos = await this.db.searchPhotos(query);
      }
      
      return photos;
      
    } catch (error) {
      console.error('搜索照片失败:', error);
      throw error;
    }
  }

  // 获取照片统计信息
  async getPhotoStats(photoId) {
    try {
      const photo = await this.db.getPhoto(photoId);
      if (!photo) {
        throw new Error('照片不存在');
      }
      
      const album = await this.db.getAlbum(photo.albumId);
      
      return {
        id: photo.id,
        name: photo.name,
        originalName: photo.originalName,
        size: photo.size,
        formattedSize: this.db.formatFileSize(photo.size),
        type: photo.type,
        dimensions: `${photo.width} × ${photo.height}`,
        aspectRatio: photo.width / photo.height,
        albumName: album ? album.name : '未知相册',
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt
      };
      
    } catch (error) {
      console.error('获取照片统计失败:', error);
      throw error;
    }
  }

  // 处理图片文件
  async processImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const img = new Image();
          
          img.onload = async () => {
            try {
              // 创建canvas处理图片
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // 计算压缩后的尺寸
              const { width, height } = this.calculateDimensions(img.width, img.height);
              
              canvas.width = width;
              canvas.height = height;
              
              // 绘制压缩后的图片
              ctx.drawImage(img, 0, 0, width, height);
              
              // 获取压缩后的数据
              const compressedData = canvas.toDataURL(file.type, 0.8);
              
              // 生成缩略图
              const thumbnail = await this.generateThumbnail(img);
              
              resolve({
                data: compressedData,
                thumbnail,
                width,
                height
              });
              
            } catch (error) {
              reject(new Error('图片处理失败: ' + error.message));
            }
          };
          
          img.onerror = () => {
            reject(new Error('图片加载失败'));
          };
          
          img.src = event.target.result;
          
        } catch (error) {
          reject(new Error('图片读取失败: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  // 生成缩略图
  async generateThumbnail(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 计算缩略图尺寸
    const { width, height } = this.calculateThumbnailDimensions(img.width, img.height);
    
    canvas.width = width;
    canvas.height = height;
    
    // 绘制缩略图
    ctx.drawImage(img, 0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.7);
  }

  // 计算压缩后的图片尺寸
  calculateDimensions(originalWidth, originalHeight, maxWidth = 1920, maxHeight = 1080) {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    // 如果图片尺寸超过最大限制，按比例缩放
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }
    
    return { width, height };
  }

  // 计算缩略图尺寸
  calculateThumbnailDimensions(originalWidth, originalHeight) {
    const maxSize = this.thumbnailSize;
    const ratio = Math.min(maxSize / originalWidth, maxSize / originalHeight);
    
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    };
  }

  // 验证文件
  validateFile(file) {
    if (!file) {
      throw new Error('文件不能为空');
    }
    
    if (!this.supportedTypes.includes(file.type)) {
      throw new Error('不支持的文件类型。支持的格式：JPEG, PNG, GIF, WebP');
    }
    
    if (file.size > this.maxFileSize) {
      throw new Error(`文件大小不能超过 ${this.db.formatFileSize(this.maxFileSize)}`);
    }
    
    if (file.size === 0) {
      throw new Error('文件不能为空');
    }
  }

  // 生成照片名称
  generatePhotoName(originalName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    
    return `${this.sanitizeFileName(baseName)}_${timestamp}.${extension}`;
  }

  // 生成副本名称
  generateCopyName(originalName) {
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    return `${baseName}_copy_${timestamp}.${extension}`;
  }

  // 清理文件名
  sanitizeFileName(fileName) {
    return fileName
      .replace(/[<>:"/\\|?*]/g, '') // 移除非法字符
      .replace(/\s+/g, '_') // 空格替换为下划线
      .substring(0, 100); // 限制长度
  }

  // 下载照片
  async downloadPhoto(photoId, fileName = null) {
    try {
      const photo = await this.db.getPhoto(photoId);
      if (!photo) {
        throw new Error('照片不存在');
      }
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = photo.data;
      link.download = fileName || photo.name;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
      
    } catch (error) {
      console.error('下载照片失败:', error);
      throw error;
    }
  }

  // 批量下载照片
  async downloadPhotos(photoIds) {
    try {
      for (const photoId of photoIds) {
        await this.downloadPhoto(photoId);
        // 添加小延迟避免浏览器阻止多个下载
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return true;
      
    } catch (error) {
      console.error('批量下载照片失败:', error);
      throw error;
    }
  }

  // 获取照片的 Blob URL
  getPhotoUrl(photo) {
    if (!photo || !photo.data) {
      return null;
    }
    
    return photo.data;
  }

  // 获取缩略图 URL
  getThumbnailUrl(photo) {
    if (!photo || !photo.thumbnail) {
      return null;
    }
    
    return photo.thumbnail;
  }

  // 清理资源
  cleanup() {
    // 清理可能的内存泄漏
    // 在实际应用中，这里可以清理创建的 Blob URLs
  }
}

export { PhotoManager };