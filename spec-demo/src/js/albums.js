// 相册管理模块 - 处理相册的创建、编辑、删除等操作

class AlbumManager {
  constructor(database) {
    this.db = database;
  }

  // 创建新相册
  async createAlbum(albumData) {
    try {
      // 验证输入数据
      this.validateAlbumData(albumData);
      
      // 检查相册名称是否已存在
      const existingAlbums = await this.db.getAllAlbums();
      const nameExists = existingAlbums.some(album => 
        album.name.toLowerCase() === albumData.name.toLowerCase()
      );
      
      if (nameExists) {
        throw new Error('相册名称已存在');
      }
      
      // 创建相册
      const album = await this.db.addAlbum({
        name: albumData.name.trim(),
        description: albumData.description?.trim() || ''
      });
      
      return album;
      
    } catch (error) {
      console.error('创建相册失败:', error);
      throw error;
    }
  }

  // 更新相册信息
  async updateAlbum(albumId, updates) {
    try {
      // 验证相册是否存在
      const existingAlbum = await this.db.getAlbum(albumId);
      if (!existingAlbum) {
        throw new Error('相册不存在');
      }
      
      // 验证更新数据
      if (updates.name) {
        this.validateAlbumName(updates.name);
        
        // 检查新名称是否与其他相册重复
        const allAlbums = await this.db.getAllAlbums();
        const nameExists = allAlbums.some(album => 
          album.id !== albumId && 
          album.name.toLowerCase() === updates.name.toLowerCase()
        );
        
        if (nameExists) {
          throw new Error('相册名称已存在');
        }
        
        updates.name = updates.name.trim();
      }
      
      if (updates.description !== undefined) {
        updates.description = updates.description.trim();
      }
      
      // 更新相册
      const updatedAlbum = await this.db.updateAlbum(albumId, updates);
      return updatedAlbum;
      
    } catch (error) {
      console.error('更新相册失败:', error);
      throw error;
    }
  }

  // 删除相册
  async deleteAlbum(albumId) {
    try {
      // 验证相册是否存在
      const album = await this.db.getAlbum(albumId);
      if (!album) {
        throw new Error('相册不存在');
      }
      
      // 删除相册
      await this.db.deleteAlbum(albumId);
      
      return true;
      
    } catch (error) {
      console.error('删除相册失败:', error);
      throw error;
    }
  }

  // 获取单个相册
  async getAlbum(albumId) {
    try {
      const album = await this.db.getAlbum(albumId);
      if (!album) {
        throw new Error('相册不存在');
      }
      
      return album;
      
    } catch (error) {
      console.error('获取相册失败:', error);
      throw error;
    }
  }

  // 获取所有相册
  async getAllAlbums() {
    try {
      const albums = await this.db.getAllAlbums();
      
      // 为每个相册添加额外信息
      const albumsWithInfo = await Promise.all(
        albums.map(async (album) => {
          const photos = await this.db.getPhotosByAlbum(album.id);
          const photoCount = photos.length;
          const totalSize = photos.reduce((sum, photo) => sum + (photo.size || 0), 0);
          
          // 获取封面照片
          let coverPhoto = null;
          if (album.coverPhotoId) {
            coverPhoto = await this.db.getPhoto(album.coverPhotoId);
          } else if (photos.length > 0) {
            // 如果没有设置封面，使用最新的照片
            coverPhoto = photos[0];
          }
          
          return {
            ...album,
            photoCount,
            totalSize,
            formattedSize: this.db.formatFileSize(totalSize),
            coverPhoto,
            isEmpty: photoCount === 0
          };
        })
      );
      
      return albumsWithInfo;
      
    } catch (error) {
      console.error('获取相册列表失败:', error);
      throw error;
    }
  }

  // 设置相册封面
  async setCoverPhoto(albumId, photoId) {
    try {
      // 验证相册和照片是否存在
      const album = await this.db.getAlbum(albumId);
      if (!album) {
        throw new Error('相册不存在');
      }
      
      const photo = await this.db.getPhoto(photoId);
      if (!photo) {
        throw new Error('照片不存在');
      }
      
      // 验证照片是否属于该相册
      if (photo.albumId !== albumId) {
        throw new Error('照片不属于该相册');
      }
      
      // 更新相册封面
      await this.db.updateAlbum(albumId, { coverPhotoId: photoId });
      
      return true;
      
    } catch (error) {
      console.error('设置封面失败:', error);
      throw error;
    }
  }

  // 移除相册封面
  async removeCoverPhoto(albumId) {
    try {
      const album = await this.db.getAlbum(albumId);
      if (!album) {
        throw new Error('相册不存在');
      }
      
      await this.db.updateAlbum(albumId, { coverPhotoId: null });
      
      return true;
      
    } catch (error) {
      console.error('移除封面失败:', error);
      throw error;
    }
  }

  // 获取相册统计信息
  async getAlbumStats(albumId) {
    try {
      const album = await this.db.getAlbum(albumId);
      if (!album) {
        throw new Error('相册不存在');
      }
      
      const photos = await this.db.getPhotosByAlbum(albumId);
      const photoCount = photos.length;
      const totalSize = photos.reduce((sum, photo) => sum + (photo.size || 0), 0);
      
      // 按类型统计
      const typeStats = photos.reduce((stats, photo) => {
        const type = photo.type || 'unknown';
        stats[type] = (stats[type] || 0) + 1;
        return stats;
      }, {});
      
      // 按月份统计
      const monthStats = photos.reduce((stats, photo) => {
        const date = new Date(photo.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        stats[monthKey] = (stats[monthKey] || 0) + 1;
        return stats;
      }, {});
      
      return {
        albumId,
        albumName: album.name,
        photoCount,
        totalSize,
        formattedSize: this.db.formatFileSize(totalSize),
        averageSize: photoCount > 0 ? Math.round(totalSize / photoCount) : 0,
        typeStats,
        monthStats,
        createdAt: album.createdAt,
        updatedAt: album.updatedAt
      };
      
    } catch (error) {
      console.error('获取相册统计失败:', error);
      throw error;
    }
  }

  // 搜索相册
  async searchAlbums(query) {
    try {
      if (!query || query.trim().length === 0) {
        return await this.getAllAlbums();
      }
      
      const albums = await this.db.searchAlbums(query.trim());
      
      // 为搜索结果添加额外信息
      const albumsWithInfo = await Promise.all(
        albums.map(async (album) => {
          const photos = await this.db.getPhotosByAlbum(album.id);
          const photoCount = photos.length;
          
          let coverPhoto = null;
          if (album.coverPhotoId) {
            coverPhoto = await this.db.getPhoto(album.coverPhotoId);
          } else if (photos.length > 0) {
            coverPhoto = photos[0];
          }
          
          return {
            ...album,
            photoCount,
            coverPhoto,
            isEmpty: photoCount === 0
          };
        })
      );
      
      return albumsWithInfo;
      
    } catch (error) {
      console.error('搜索相册失败:', error);
      throw error;
    }
  }

  // 复制相册
  async duplicateAlbum(albumId, newName) {
    try {
      const originalAlbum = await this.db.getAlbum(albumId);
      if (!originalAlbum) {
        throw new Error('原相册不存在');
      }
      
      // 创建新相册
      const newAlbum = await this.createAlbum({
        name: newName || `${originalAlbum.name} - 副本`,
        description: originalAlbum.description
      });
      
      // 复制照片
      const photos = await this.db.getPhotosByAlbum(albumId);
      for (const photo of photos) {
        const newPhoto = {
          ...photo,
          albumId: newAlbum.id
        };
        delete newPhoto.id; // 让数据库生成新的ID
        await this.db.addPhoto(newPhoto);
      }
      
      return newAlbum;
      
    } catch (error) {
      console.error('复制相册失败:', error);
      throw error;
    }
  }

  // 合并相册
  async mergeAlbums(sourceAlbumIds, targetAlbumId, deleteSource = false) {
    try {
      // 验证目标相册存在
      const targetAlbum = await this.db.getAlbum(targetAlbumId);
      if (!targetAlbum) {
        throw new Error('目标相册不存在');
      }
      
      // 验证源相册存在
      for (const sourceId of sourceAlbumIds) {
        if (sourceId === targetAlbumId) {
          throw new Error('不能将相册合并到自身');
        }
        
        const sourceAlbum = await this.db.getAlbum(sourceId);
        if (!sourceAlbum) {
          throw new Error(`源相册 ${sourceId} 不存在`);
        }
      }
      
      // 移动照片
      let movedCount = 0;
      for (const sourceId of sourceAlbumIds) {
        const photos = await this.db.getPhotosByAlbum(sourceId);
        
        for (const photo of photos) {
          await this.db.updatePhoto(photo.id, { albumId: targetAlbumId });
          movedCount++;
        }
        
        // 如果需要删除源相册
        if (deleteSource) {
          await this.db.deleteAlbum(sourceId);
        }
      }
      
      return {
        targetAlbumId,
        movedPhotoCount: movedCount,
        deletedAlbumCount: deleteSource ? sourceAlbumIds.length : 0
      };
      
    } catch (error) {
      console.error('合并相册失败:', error);
      throw error;
    }
  }

  // 验证相册数据
  validateAlbumData(albumData) {
    if (!albumData) {
      throw new Error('相册数据不能为空');
    }
    
    this.validateAlbumName(albumData.name);
    
    if (albumData.description && albumData.description.length > 500) {
      throw new Error('相册描述不能超过500个字符');
    }
  }

  // 验证相册名称
  validateAlbumName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('相册名称不能为空');
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new Error('相册名称不能为空');
    }
    
    if (trimmedName.length > 100) {
      throw new Error('相册名称不能超过100个字符');
    }
    
    // 检查非法字符
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedName)) {
      throw new Error('相册名称包含非法字符');
    }
  }

  // 获取相册创建建议
  async getAlbumSuggestions() {
    try {
      const photos = await this.db.getAllPhotos();
      const suggestions = [];
      
      // 按日期分组建议
      const dateGroups = photos.reduce((groups, photo) => {
        const date = new Date(photo.createdAt);
        const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        
        if (!groups[monthKey]) {
          groups[monthKey] = [];
        }
        groups[monthKey].push(photo);
        
        return groups;
      }, {});
      
      // 为每个月份生成建议
      Object.entries(dateGroups).forEach(([monthKey, monthPhotos]) => {
        if (monthPhotos.length >= 5) { // 只为有足够照片的月份生成建议
          suggestions.push({
            type: 'date',
            name: monthKey,
            description: `包含 ${monthPhotos.length} 张照片`,
            photoCount: monthPhotos.length,
            photos: monthPhotos.slice(0, 4) // 预览前4张照片
          });
        }
      });
      
      return suggestions;
      
    } catch (error) {
      console.error('获取相册建议失败:', error);
      return [];
    }
  }
}

export { AlbumManager };