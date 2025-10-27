/**
 * 反检测核心模块
 * 用于绕过学习通的各种检测机制
 */

class AntiDetection {
    constructor(page) {
        this.page = page;
        this.isActive = true;
        this.lastActivity = Date.now();
    }

    /**
     * 初始化反检测环境
     */
    async initialize() {
        // 1. 隐藏Playwright特征
        await this.hideAutomationFeatures();
        
        // 2. 启动行为模拟
        this.startBehaviorSimulation();
        
        // 4. 启动心跳包模拟
        this.startHeartbeatSimulation();
        
        console.log('🛡️ 反检测系统已启动');
    }

    /**
     * 隐藏自动化工具特征
     */
    async hideAutomationFeatures() {
        await this.page.addInitScript(() => {
            // 删除webdriver属性
            delete navigator.__proto__.webdriver;
            
            // 重写navigator.webdriver
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });

            // 重写chrome对象
            window.chrome = {
                runtime: {},
                loadTimes: function() {},
                csi: function() {},
                app: {}
            };

            // 重写permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
            );

            // 重写plugins长度
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
        });
    }

    /**
     * 检查页面是否仍然有效
     */
    async isPageValid() {
        try {
            if (!this.page || this.page.isClosed()) {
                return false;
            }
            // 尝试执行一个简单的操作来检查页面状态
            await this.page.evaluate(() => document.readyState);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 启动行为模拟
     */
    startBehaviorSimulation() {
        // 随机鼠标移动
        setInterval(async () => {
            if (!this.isActive || !(await this.isPageValid())) return;
            
            try {
                const x = Math.random() * 800 + 100;
                const y = Math.random() * 600 + 100;
                
                await this.page.mouse.move(x, y, {
                    steps: Math.floor(Math.random() * 10) + 5
                });
                
                // 随机滚动
                if (Math.random() > 0.7) {
                    await this.page.mouse.wheel(0, Math.random() * 200 - 100);
                }
                
                this.lastActivity = Date.now();
            } catch (error) {
                console.log('鼠标模拟出错:', error.message);
            }
        }, this.getRandomInterval(15000, 45000));

        // 随机点击空白区域
        setInterval(async () => {
            if (!this.isActive || !(await this.isPageValid())) return;
            
            try {
                if (Math.random() > 0.8) {
                    const x = Math.random() * 200 + 400;
                    const y = Math.random() * 200 + 300;
                    await this.page.mouse.click(x, y);
                }
            } catch (error) {
                console.log('随机点击出错:', error.message);
            }
        }, this.getRandomInterval(60000, 180000));

        // 模拟键盘活动
        setInterval(async () => {
            if (!this.isActive || !(await this.isPageValid())) return;
            
            try {
                if (Math.random() > 0.9) {
                    await this.page.keyboard.press('Tab');
                }
            } catch (error) {
                console.log('键盘模拟出错:', error.message);
            }
        }, this.getRandomInterval(120000, 300000));
    }

    /**
     * 启动心跳包模拟
     */
    startHeartbeatSimulation() {
        setInterval(async () => {
            if (!this.isActive || !(await this.isPageValid())) return;
            
            try {
                // 模拟页面焦点
                await this.page.evaluate(() => {
                    window.dispatchEvent(new Event('focus'));
                    document.dispatchEvent(new Event('visibilitychange'));
                });

                // 模拟视频播放检查
                await this.simulateVideoHeartbeat();
                
                console.log('💓 心跳包已发送');
            } catch (error) {
                console.log('心跳包发送出错:', error.message);
            }
        }, this.getRandomInterval(30000, 60000));
    }

    /**
     * 模拟视频播放心跳
     */
    async simulateVideoHeartbeat() {
        try {
            if (!(await this.isPageValid())) return;
            
            await this.page.evaluate(() => {
                // 查找视频元素
                const videos = document.querySelectorAll('video');
                videos.forEach(video => {
                    if (video.paused) {
                        // 如果视频暂停，尝试播放
                        video.play().catch(() => {});
                    }
                    
                    // 触发播放事件
                    video.dispatchEvent(new Event('timeupdate'));
                    video.dispatchEvent(new Event('progress'));
                });

                // 模拟学习进度更新
                if (window.updateStudyProgress) {
                    window.updateStudyProgress();
                }
            });
        } catch (error) {
            console.log('视频心跳模拟出错:', error.message);
        }
    }

    /**
     * 智能验证码处理
     */
    async handleCaptcha() {
        try {
            // 检测验证码弹窗
            const captchaSelectors = [
                '.captcha-modal',
                '.verify-code',
                '.validation-popup',
                '[class*="captcha"]',
                '[class*="verify"]'
            ];

            for (const selector of captchaSelectors) {
                const element = await this.page.$(selector);
                if (element) {
                    console.log('🚨 检测到验证码，暂停自动化操作');
                    this.isActive = false;
                    
                    // 等待用户手动处理
                    await this.page.waitForSelector(selector, { 
                        state: 'hidden', 
                        timeout: 300000 
                    });
                    
                    this.isActive = true;
                    console.log('✅ 验证码已处理，恢复自动化操作');
                    break;
                }
            }
        } catch (error) {
            console.log('验证码检测出错:', error.message);
        }
    }

    /**
     * 获取随机时间间隔
     */
    getRandomInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 暂停反检测系统
     */
    pause() {
        this.isActive = false;
        console.log('⏸️ 反检测系统已暂停');
    }

    /**
     * 恢复反检测系统
     */
    resume() {
        this.isActive = true;
        console.log('▶️ 反检测系统已恢复');
    }

    /**
     * 获取活动状态
     */
    getActivityStatus() {
        return {
            isActive: this.isActive,
            lastActivity: this.lastActivity,
            timeSinceLastActivity: Date.now() - this.lastActivity
        };
    }
}

module.exports = AntiDetection;