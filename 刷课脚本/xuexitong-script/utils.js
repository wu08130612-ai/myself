/**
 * 工具函数类
 * 提供各种实用的辅助功能
 */
class Utils {
    constructor() {
        this.name = 'Utils';
    }
    
    /**
     * 随机延迟
     */
    async randomDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    
    /**
     * 智能等待
     */
    async smartWait(baseTime, variance = 0.2) {
        const varianceAmount = baseTime * variance;
        const actualTime = baseTime + (Math.random() * 2 - 1) * varianceAmount;
        return this.randomDelay(Math.max(100, actualTime * 0.8), actualTime * 1.2);
    }
    
    /**
     * 生成随机字符串
     */
    generateRandomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    /**
     * 生成随机用户代理
     */
    getRandomUserAgent() {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
        ];
        
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }
    
    /**
     * 解析时间字符串为秒数
     */
    parseTimeToSeconds(timeString) {
        try {
            if (!timeString || typeof timeString !== 'string') {
                return 0;
            }
            
            // 清理字符串，移除多余的空格和特殊字符
            const cleanTime = timeString.trim().replace(/[^\d:]/g, '');
            
            // 支持多种时间格式
            const patterns = [
                /^(\d+):(\d+):(\d+)$/, // HH:MM:SS
                /^(\d+):(\d+)$/,       // MM:SS
                /^(\d+)$/              // SS
            ];
            
            for (const pattern of patterns) {
                const match = cleanTime.match(pattern);
                if (match) {
                    if (match.length === 4) {
                        // HH:MM:SS
                        const hours = parseInt(match[1]) || 0;
                        const minutes = parseInt(match[2]) || 0;
                        const seconds = parseInt(match[3]) || 0;
                        return hours * 3600 + minutes * 60 + seconds;
                    } else if (match.length === 3) {
                        // MM:SS
                        const minutes = parseInt(match[1]) || 0;
                        const seconds = parseInt(match[2]) || 0;
                        return minutes * 60 + seconds;
                    } else if (match.length === 2) {
                        // SS
                        return parseInt(match[1]) || 0;
                    }
                }
            }
            
            // 如果都不匹配，尝试提取数字
            const numbers = cleanTime.match(/\d+/g);
            if (numbers && numbers.length > 0) {
                if (numbers.length === 1) {
                    return parseInt(numbers[0]) || 0;
                } else if (numbers.length === 2) {
                    return (parseInt(numbers[0]) || 0) * 60 + (parseInt(numbers[1]) || 0);
                } else if (numbers.length >= 3) {
                    return (parseInt(numbers[0]) || 0) * 3600 + 
                           (parseInt(numbers[1]) || 0) * 60 + 
                           (parseInt(numbers[2]) || 0);
                }
            }
            
            return 0;
            
        } catch (error) {
            console.error('解析时间字符串失败:', error);
            return 0;
        }
    }
    
    /**
     * 格式化秒数为时间字符串
     */
    formatSecondsToTime(seconds) {
        try {
            const totalSeconds = Math.floor(seconds);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;
            
            if (hours > 0) {
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            } else {
                return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        } catch (error) {
            console.error('格式化时间失败:', error);
            return '00:00';
        }
    }
    
    /**
     * 获取随机坐标
     */
    getRandomCoordinates(width, height) {
        return {
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height)
        };
    }
    
    /**
     * 模拟人类输入延迟
     */
    async humanTypeDelay() {
        // 模拟人类打字的不规律延迟
        const baseDelay = 50 + Math.random() * 100; // 50-150ms基础延迟
        const extraDelay = Math.random() < 0.1 ? Math.random() * 200 : 0; // 10%概率额外延迟
        return this.randomDelay(baseDelay, baseDelay + extraDelay);
    }
    
    /**
     * 检查元素是否可见
     */
    async isElementVisible(page, element) {
        try {
            if (!element) return false;
            
            const isVisible = await element.evaluate(el => {
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       style.opacity !== '0' &&
                       el.offsetWidth > 0 && 
                       el.offsetHeight > 0;
            });
            
            return isVisible;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 等待元素出现
     */
    async waitForElement(page, selector, timeout = 30000) {
        try {
            await page.waitForSelector(selector, { 
                visible: true, 
                timeout 
            });
            return await page.$(selector);
        } catch (error) {
            console.log(`等待元素超时: ${selector}`);
            return null;
        }
    }
    
    /**
     * 安全点击元素
     */
    async safeClick(page, element) {
        try {
            if (!element) return false;
            
            // 检查元素是否可见和可点击
            const isClickable = await element.evaluate(el => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0 && 
                       !el.disabled && 
                       window.getComputedStyle(el).pointerEvents !== 'none';
            });
            
            if (!isClickable) {
                console.log('元素不可点击');
                return false;
            }
            
            // 滚动到元素位置
            await element.scrollIntoViewIfNeeded();
            await this.randomDelay(500, 1000);
            
            // 点击元素
            await element.click();
            return true;
            
        } catch (error) {
            console.error('安全点击失败:', error);
            return false;
        }
    }
    
    /**
     * 获取当前时间戳
     */
    getCurrentTimestamp() {
        return Date.now();
    }
    
    /**
     * 格式化日期
     */
    formatDate(date = new Date()) {
        return date.toISOString().split('T')[0];
    }
    
    /**
     * 格式化时间
     */
    formatTime(date = new Date()) {
        return date.toTimeString().split(' ')[0];
    }
    
    /**
     * 日志记录
     */
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        switch (level.toLowerCase()) {
            case 'error':
                console.error(logMessage, data || '');
                break;
            case 'warn':
                console.warn(logMessage, data || '');
                break;
            case 'info':
                console.info(logMessage, data || '');
                break;
            default:
                console.log(logMessage, data || '');
        }
    }
}

module.exports = Utils;