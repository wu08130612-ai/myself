/**
 * 性能优化模块
 * 提升脚本运行效率和稳定性
 */

class PerformanceOptimizer {
    constructor() {
        this.memoryUsage = [];
        this.performanceMetrics = {
            startTime: null,
            pageLoadTimes: [],
            actionTimes: [],
            errorCount: 0,
            successCount: 0
        };
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 2000,
            backoffMultiplier: 1.5
        };
    }

    /**
     * 启动性能监控
     */
    startMonitoring() {
        this.performanceMetrics.startTime = Date.now();
        
        // 定期检查内存使用情况
        this.memoryMonitorInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, 30000); // 每30秒检查一次

        console.log('📊 性能监控已启动');
    }

    /**
     * 停止性能监控
     */
    stopMonitoring() {
        if (this.memoryMonitorInterval) {
            clearInterval(this.memoryMonitorInterval);
        }
        
        this.generatePerformanceReport();
        console.log('📊 性能监控已停止');
    }

    /**
     * 检查内存使用情况
     */
    checkMemoryUsage() {
        const usage = process.memoryUsage();
        this.memoryUsage.push({
            timestamp: Date.now(),
            heapUsed: usage.heapUsed / 1024 / 1024, // MB
            heapTotal: usage.heapTotal / 1024 / 1024, // MB
            external: usage.external / 1024 / 1024, // MB
            rss: usage.rss / 1024 / 1024 // MB
        });

        // 保持最近100条记录
        if (this.memoryUsage.length > 100) {
            this.memoryUsage = this.memoryUsage.slice(-100);
        }

        // 检查内存泄漏
        const currentUsage = this.memoryUsage[this.memoryUsage.length - 1];
        if (currentUsage.heapUsed > 200) { // 超过200MB警告
            console.warn(`⚠️ 内存使用较高: ${currentUsage.heapUsed.toFixed(2)}MB`);
        }
    }

    /**
     * 记录页面加载时间
     */
    recordPageLoadTime(startTime, endTime) {
        const loadTime = endTime - startTime;
        this.performanceMetrics.pageLoadTimes.push(loadTime);
        
        if (loadTime > 10000) { // 超过10秒警告
            console.warn(`⚠️ 页面加载较慢: ${loadTime}ms`);
        }
    }

    /**
     * 记录操作执行时间
     */
    recordActionTime(action, startTime, endTime) {
        const actionTime = endTime - startTime;
        this.performanceMetrics.actionTimes.push({
            action,
            time: actionTime,
            timestamp: Date.now()
        });
    }

    /**
     * 记录成功操作
     */
    recordSuccess() {
        this.performanceMetrics.successCount++;
    }

    /**
     * 记录错误
     */
    recordError(error) {
        this.performanceMetrics.errorCount++;
        console.error(`❌ 操作失败: ${error.message}`);
    }

    /**
     * 智能重试机制
     */
    async retryOperation(operation, context = '') {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                const result = await operation();
                this.recordSuccess();
                return result;
            } catch (error) {
                lastError = error;
                this.recordError(error);
                
                if (attempt < this.retryConfig.maxRetries) {
                    const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
                    console.log(`🔄 重试操作 (${attempt}/${this.retryConfig.maxRetries}) ${context}, ${delay}ms后重试...`);
                    await this.sleep(delay);
                } else {
                    console.error(`❌ 操作最终失败 ${context}: ${error.message}`);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * 优化页面性能
     */
    async optimizePage(page) {
        try {
            // 禁用不必要的资源加载
            await page.route('**/*', (route) => {
                const resourceType = route.request().resourceType();
                const url = route.request().url();
                
                // 阻止加载广告、统计、字体等不必要资源
                if (
                    resourceType === 'image' && (url.includes('ad') || url.includes('banner')) ||
                    resourceType === 'font' ||
                    url.includes('google-analytics') ||
                    url.includes('baidu') ||
                    url.includes('cnzz') ||
                    url.includes('stat')
                ) {
                    route.abort();
                } else {
                    route.continue();
                }
            });

            // 设置页面性能优化
            await page.addInitScript(() => {
                // 禁用动画以提升性能
                const style = document.createElement('style');
                style.textContent = `
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                `;
                document.head.appendChild(style);
            });

            console.log('⚡ 页面性能优化已应用');
        } catch (error) {
            console.warn('⚠️ 页面性能优化失败:', error.message);
        }
    }

    /**
     * 检查页面是否仍然有效
     */
    async isPageValid(page) {
        try {
            if (!page || page.isClosed()) {
                return false;
            }
            // 尝试执行一个简单的操作来检查页面状态
            await page.evaluate(() => document.readyState);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 智能等待元素
     */
    async waitForElement(page, selector, options = {}) {
        const defaultOptions = {
            timeout: 10000,
            visible: true,
            ...options
        };

        const startTime = Date.now();
        
        try {
            if (!(await this.isPageValid(page))) {
                throw new Error('页面已关闭或无效');
            }
            
            const element = await page.waitForSelector(selector, defaultOptions);
            const endTime = Date.now();
            this.recordActionTime('waitForElement', startTime, endTime);
            return element;
        } catch (error) {
            const endTime = Date.now();
            this.recordActionTime('waitForElement_failed', startTime, endTime);
            throw error;
        }
    }

    /**
     * 智能点击元素
     */
    async smartClick(page, selector, options = {}) {
        const startTime = Date.now();
        
        try {
            if (!(await this.isPageValid(page))) {
                throw new Error('页面已关闭或无效');
            }
            
            // 等待元素可见
            await this.waitForElement(page, selector, { timeout: 5000 });
            
            // 滚动到元素位置
            await page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, selector);
            
            // 等待一下确保滚动完成
            await this.sleep(500);
            
            // 点击元素
            await page.click(selector, options);
            
            const endTime = Date.now();
            this.recordActionTime('smartClick', startTime, endTime);
            
        } catch (error) {
            const endTime = Date.now();
            this.recordActionTime('smartClick_failed', startTime, endTime);
            throw error;
        }
    }

    /**
     * 生成性能报告
     */
    generatePerformanceReport() {
        const runtime = Date.now() - this.performanceMetrics.startTime;
        const avgPageLoadTime = this.performanceMetrics.pageLoadTimes.length > 0 
            ? this.performanceMetrics.pageLoadTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.pageLoadTimes.length 
            : 0;
        
        const currentMemory = this.memoryUsage.length > 0 
            ? this.memoryUsage[this.memoryUsage.length - 1] 
            : null;

        const report = {
            runtime: this.formatTime(runtime),
            successRate: this.performanceMetrics.successCount / (this.performanceMetrics.successCount + this.performanceMetrics.errorCount) * 100,
            avgPageLoadTime: avgPageLoadTime.toFixed(2) + 'ms',
            totalErrors: this.performanceMetrics.errorCount,
            totalSuccess: this.performanceMetrics.successCount,
            currentMemoryUsage: currentMemory ? `${currentMemory.heapUsed.toFixed(2)}MB` : 'N/A'
        };

        console.log('\n📊 性能报告:');
        console.log(`⏱️  运行时间: ${report.runtime}`);
        console.log(`✅ 成功率: ${report.successRate.toFixed(2)}%`);
        console.log(`📄 平均页面加载时间: ${report.avgPageLoadTime}`);
        console.log(`❌ 错误次数: ${report.totalErrors}`);
        console.log(`✅ 成功次数: ${report.totalSuccess}`);
        console.log(`💾 当前内存使用: ${report.currentMemoryUsage}`);

        return report;
    }

    /**
     * 格式化时间
     */
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟${seconds % 60}秒`;
        } else if (minutes > 0) {
            return `${minutes}分钟${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    /**
     * 睡眠函数
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.stopMonitoring();
        this.memoryUsage = [];
        this.performanceMetrics = {
            startTime: null,
            pageLoadTimes: [],
            actionTimes: [],
            errorCount: 0,
            successCount: 0
        };
    }
}

module.exports = PerformanceOptimizer;