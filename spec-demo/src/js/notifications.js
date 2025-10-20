// 通知管理模块 - 处理应用内通知和消息提示

class NotificationManager {
  constructor() {
    this.container = null;
    this.notifications = new Map();
    this.defaultDuration = 3000;
    this.maxNotifications = 5;
    
    this.init();
  }

  // 初始化通知系统
  init() {
    this.createContainer();
    this.setupStyles();
  }

  // 创建通知容器
  createContainer() {
    // 检查是否已存在容器
    this.container = document.getElementById('notification-container');
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    }
  }

  // 设置通知样式
  setupStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
      }
      
      .notification {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        margin-bottom: 10px;
        padding: 16px 20px;
        min-width: 300px;
        max-width: 400px;
        pointer-events: auto;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        border-left: 4px solid #007bff;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .notification.show {
        transform: translateX(0);
        opacity: 1;
      }
      
      .notification.hide {
        transform: translateX(100%);
        opacity: 0;
      }
      
      .notification-success {
        border-left-color: #28a745;
        background: #f8fff9;
      }
      
      .notification-error {
        border-left-color: #dc3545;
        background: #fff8f8;
      }
      
      .notification-warning {
        border-left-color: #ffc107;
        background: #fffdf5;
      }
      
      .notification-info {
        border-left-color: #17a2b8;
        background: #f8fcff;
      }
      
      .notification-content {
        flex: 1;
        display: flex;
        align-items: center;
      }
      
      .notification-icon {
        margin-right: 12px;
        font-size: 18px;
      }
      
      .notification-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
        color: #333;
      }
      
      .notification-title {
        font-weight: 600;
        margin-bottom: 4px;
        color: #333;
      }
      
      .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #999;
        padding: 0;
        margin-left: 12px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }
      
      .notification-close:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #666;
      }
      
      .notification-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 0 0 8px 8px;
        transition: width linear;
      }
      
      .notification-actions {
        margin-top: 8px;
        display: flex;
        gap: 8px;
      }
      
      .notification-action {
        background: none;
        border: 1px solid #ddd;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .notification-action:hover {
        background: #f5f5f5;
      }
      
      .notification-action.primary {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }
      
      .notification-action.primary:hover {
        background: #0056b3;
      }
      
      @media (max-width: 480px) {
        .notification-container {
          top: 10px;
          right: 10px;
          left: 10px;
        }
        
        .notification {
          min-width: auto;
          max-width: none;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  // 显示通知
  show(message, options = {}) {
    const config = {
      type: 'info',
      title: null,
      duration: this.defaultDuration,
      persistent: false,
      actions: [],
      icon: null,
      ...options
    };

    // 限制通知数量
    if (this.notifications.size >= this.maxNotifications) {
      const oldestId = this.notifications.keys().next().value;
      this.remove(oldestId);
    }

    const id = this.generateId();
    const notification = this.createNotification(id, message, config);
    
    this.container.appendChild(notification);
    this.notifications.set(id, {
      element: notification,
      config,
      timer: null
    });

    // 触发显示动画
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // 设置自动移除定时器
    if (!config.persistent && config.duration > 0) {
      this.setAutoRemove(id, config.duration);
    }

    return id;
  }

  // 创建通知元素
  createNotification(id, message, config) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${config.type}`;
    notification.dataset.notificationId = id;

    const icon = config.icon || this.getDefaultIcon(config.type);
    const hasActions = config.actions && config.actions.length > 0;

    notification.innerHTML = `
      <div class="notification-content">
        ${icon ? `<div class="notification-icon">${icon}</div>` : ''}
        <div class="notification-text">
          ${config.title ? `<div class="notification-title">${this.escapeHtml(config.title)}</div>` : ''}
          <div class="notification-message">${this.escapeHtml(message)}</div>
          ${hasActions ? this.renderActions(config.actions, id) : ''}
        </div>
      </div>
      <button class="notification-close" onclick="notificationManager.remove('${id}')">×</button>
      ${!config.persistent && config.duration > 0 ? '<div class="notification-progress"></div>' : ''}
    `;

    // 设置进度条动画
    if (!config.persistent && config.duration > 0) {
      const progress = notification.querySelector('.notification-progress');
      if (progress) {
        requestAnimationFrame(() => {
          progress.style.width = '100%';
          progress.style.transitionDuration = `${config.duration}ms`;
          requestAnimationFrame(() => {
            progress.style.width = '0%';
          });
        });
      }
    }

    return notification;
  }

  // 渲染操作按钮
  renderActions(actions, notificationId) {
    if (!actions || actions.length === 0) return '';
    
    const actionsHTML = actions.map((action, index) => {
      const className = action.primary ? 'notification-action primary' : 'notification-action';
      return `
        <button class="${className}" 
                onclick="notificationManager.handleAction('${notificationId}', ${index})">
          ${this.escapeHtml(action.text)}
        </button>
      `;
    }).join('');
    
    return `<div class="notification-actions">${actionsHTML}</div>`;
  }

  // 处理操作按钮点击
  handleAction(notificationId, actionIndex) {
    const notification = this.notifications.get(notificationId);
    if (!notification) return;
    
    const action = notification.config.actions[actionIndex];
    if (action && action.handler) {
      action.handler();
    }
    
    // 如果操作指定了关闭通知，则关闭
    if (!action || action.close !== false) {
      this.remove(notificationId);
    }
  }

  // 移除通知
  remove(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    // 清除定时器
    if (notification.timer) {
      clearTimeout(notification.timer);
    }

    // 添加隐藏动画
    notification.element.classList.add('hide');
    
    // 动画完成后移除元素
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
      this.notifications.delete(id);
    }, 300);
  }

  // 设置自动移除定时器
  setAutoRemove(id, duration) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    notification.timer = setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  // 清除所有通知
  clear() {
    const ids = Array.from(this.notifications.keys());
    ids.forEach(id => this.remove(id));
  }

  // 更新通知
  update(id, message, options = {}) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const messageElement = notification.element.querySelector('.notification-message');
    if (messageElement) {
      messageElement.textContent = message;
    }

    // 更新标题
    if (options.title !== undefined) {
      const titleElement = notification.element.querySelector('.notification-title');
      if (options.title) {
        if (titleElement) {
          titleElement.textContent = options.title;
        } else {
          const textContainer = notification.element.querySelector('.notification-text');
          const newTitle = document.createElement('div');
          newTitle.className = 'notification-title';
          newTitle.textContent = options.title;
          textContainer.insertBefore(newTitle, messageElement);
        }
      } else if (titleElement) {
        titleElement.remove();
      }
    }

    // 更新类型
    if (options.type) {
      notification.element.className = `notification notification-${options.type} show`;
      notification.config.type = options.type;
    }
  }

  // 便捷方法：成功通知
  success(message, options = {}) {
    return this.show(message, { ...options, type: 'success' });
  }

  // 便捷方法：错误通知
  error(message, options = {}) {
    return this.show(message, { ...options, type: 'error', duration: 5000 });
  }

  // 便捷方法：警告通知
  warning(message, options = {}) {
    return this.show(message, { ...options, type: 'warning', duration: 4000 });
  }

  // 便捷方法：信息通知
  info(message, options = {}) {
    return this.show(message, { ...options, type: 'info' });
  }

  // 便捷方法：加载通知
  loading(message, options = {}) {
    return this.show(message, {
      ...options,
      type: 'info',
      persistent: true,
      icon: '⏳'
    });
  }

  // 便捷方法：确认通知
  confirm(message, onConfirm, onCancel = null, options = {}) {
    const actions = [
      {
        text: '确认',
        primary: true,
        handler: onConfirm
      },
      {
        text: '取消',
        handler: onCancel || (() => {})
      }
    ];

    return this.show(message, {
      ...options,
      type: 'warning',
      persistent: true,
      actions
    });
  }

  // 获取默认图标
  getDefaultIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || '';
  }

  // 生成唯一ID
  generateId() {
    return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 转义HTML
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 获取通知数量
  getCount() {
    return this.notifications.size;
  }

  // 检查是否有指定类型的通知
  hasType(type) {
    for (const notification of this.notifications.values()) {
      if (notification.config.type === type) {
        return true;
      }
    }
    return false;
  }

  // 移除指定类型的所有通知
  removeByType(type) {
    const idsToRemove = [];
    for (const [id, notification] of this.notifications.entries()) {
      if (notification.config.type === type) {
        idsToRemove.push(id);
      }
    }
    idsToRemove.forEach(id => this.remove(id));
  }

  // 暂停所有自动移除定时器
  pauseAll() {
    for (const notification of this.notifications.values()) {
      if (notification.timer) {
        clearTimeout(notification.timer);
        notification.timer = null;
      }
    }
  }

  // 恢复所有自动移除定时器
  resumeAll() {
    for (const [id, notification] of this.notifications.entries()) {
      if (!notification.config.persistent && notification.config.duration > 0) {
        this.setAutoRemove(id, notification.config.duration);
      }
    }
  }

  // 销毁通知管理器
  destroy() {
    this.clear();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    const styles = document.getElementById('notification-styles');
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
    }
  }
}

// 创建全局实例
const notificationManager = new NotificationManager();

// 导出类和实例
export { NotificationManager, notificationManager };