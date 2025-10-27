/**
 * 真实选择器配置
 * 基于实际学习通页面结构的准确选择器
 * 
 * 使用说明：
 * 1. 运行 selector-inspector.js 工具
 * 2. 在真实页面上测试选择器
 * 3. 将有效的选择器更新到此文件
 */

class RealSelectorsConfig {
    constructor() {
        this.name = 'RealSelectorsConfig';
        
        // 基础选择器配置
        this.selectors = {
            // 课程列表页面选择器
            courseList: {
                // 课程容器 - 包含所有课程的主容器
                container: [
                    '.course-list',           // 常见的课程列表容器
                    '.my-course-list',        // 我的课程列表
                    '.course-container',      // 课程容器
                    '.courses-wrap',          // 课程包装器
                    '#courseList',            // ID选择器
                    '[data-role="course-list"]', // 数据属性
                    '.grid-container .course-grid', // 网格布局
                    '.main-content .course-section' // 主内容区域
                ],
                
                // 单个课程卡片
                courseCard: [
                    '.course-item',           // 课程项目
                    '.course-card',           // 课程卡片
                    '.course-box',            // 课程盒子
                    '.my-course-item',        // 我的课程项目
                    '.course-wrap',           // 课程包装
                    '[data-role="course-item"]', // 数据属性
                    '.grid-item',             // 网格项目
                    'li[class*="course"]'     // 列表项
                ],
                
                // 课程标题
                courseTitle: [
                    '.course-title',          // 课程标题
                    '.course-name',           // 课程名称
                    '.title',                 // 通用标题
                    'h3',                     // H3标签
                    'h4',                     // H4标签
                    '.name',                  // 名称
                    '[data-role="course-title"]', // 数据属性
                    '.course-info .title',    // 课程信息中的标题
                    'a[title]'                // 带标题的链接
                ],
                
                // 课程链接
                courseLink: [
                    'a[href*="course"]',      // 包含course的链接
                    'a[href*="Course"]',      // 包含Course的链接
                    'a[onclick*="course"]',   // 点击事件包含course
                    '[data-href*="course"]',  // 数据链接
                    '.course-link',           // 课程链接类
                    '.enter-course',          // 进入课程
                    '[data-role="course-link"]' // 数据属性
                ]
            },
            
            // 视频章节页面选择器
            videoSections: {
                // 章节容器
                container: [
                    '.chapter-list',          // 章节列表
                    '.video-list',            // 视频列表
                    '.content-list',          // 内容列表
                    '.section-list',          // 小节列表
                    '.lesson-list',           // 课时列表
                    '.tree-container',        // 树形容器
                    '#chapterList',           // ID选择器
                    '[data-role="chapter-list"]', // 数据属性
                    '.course-content .chapters' // 课程内容中的章节
                ],
                
                // 视频项目
                videoItem: [
                    '.video-item',            // 视频项目
                    '.chapter-item',          // 章节项目
                    '.section-item',          // 小节项目
                    '.lesson-item',           // 课时项目
                    '.content-item',          // 内容项目
                    '[data-role="video-item"]', // 数据属性
                    'li[class*="video"]',     // 包含video的列表项
                    '.tree-node'              // 树节点
                ],
                
                // 视频标题
                videoTitle: [
                    '.video-title',           // 视频标题
                    '.chapter-title',         // 章节标题
                    '.section-title',         // 小节标题
                    '.lesson-title',          // 课时标题
                    '.title',                 // 通用标题
                    '.name',                  // 名称
                    '[data-role="video-title"]', // 数据属性
                    'span.text',              // 文本span
                    'a[title]'                // 带标题的链接
                ],
                
                // 完成状态
                completionStatus: [
                    '.completed',             // 已完成
                    '.finished',              // 已结束
                    '.done',                  // 完成
                    '.status-complete',       // 完成状态
                    '.icon-complete',         // 完成图标
                    '[data-status="completed"]', // 数据状态
                    '.progress-100',          // 100%进度
                    '.check-mark'             // 勾选标记
                ],
                
                // 视频链接
                videoLink: [
                    'a[href*="video"]',       // 包含video的链接
                    'a[href*="Video"]',       // 包含Video的链接
                    'a[onclick*="video"]',    // 点击事件包含video
                    '[data-href*="video"]',   // 数据链接
                    '.video-link',            // 视频链接类
                    '.play-link',             // 播放链接
                    '[data-role="video-link"]' // 数据属性
                ]
            },
            
            // 视频播放页面选择器
            videoPlayback: {
                // 视频元素
                videoElement: [
                    'video',                  // 标准video标签
                    '#video',                 // ID选择器
                    '.video-player video',    // 播放器中的video
                    '[data-role="video"]',    // 数据属性
                    'object[type*="video"]',  // object标签
                    'embed[type*="video"]'    // embed标签
                ],
                
                // 播放按钮
                playButton: [
                    '.play-btn',              // 播放按钮
                    '.play-button',           // 播放按钮
                    '.btn-play',              // 播放按钮
                    '.video-play',            // 视频播放
                    '.control-play',          // 控制播放
                    '[title*="播放"]',        // 标题包含播放
                    '[title*="play"]',        // 标题包含play
                    '[data-role="play"]',     // 数据属性
                    'button[onclick*="play"]' // 点击事件包含play
                ],
                
                // 暂停按钮
                pauseButton: [
                    '.pause-btn',             // 暂停按钮
                    '.pause-button',          // 暂停按钮
                    '.btn-pause',             // 暂停按钮
                    '.video-pause',           // 视频暂停
                    '.control-pause',         // 控制暂停
                    '[title*="暂停"]',        // 标题包含暂停
                    '[title*="pause"]',       // 标题包含pause
                    '[data-role="pause"]'     // 数据属性
                ],
                
                // 进度条
                progressBar: [
                    '.progress-bar',          // 进度条
                    '.video-progress',        // 视频进度
                    '.seek-bar',              // 拖拽条
                    '.timeline',              // 时间线
                    '.slider',                // 滑块
                    '[data-role="progress"]', // 数据属性
                    'input[type="range"]',    // 范围输入
                    '.progress .bar'          // 进度中的条
                ],
                
                // 时间显示
                timeDisplay: [
                    '.current-time',          // 当前时间
                    '.total-time',            // 总时间
                    '.duration',              // 时长
                    '.time-display',          // 时间显示
                    '.video-time',            // 视频时间
                    '[data-role="time"]',     // 数据属性
                    '.time-info',             // 时间信息
                    '.timer'                  // 计时器
                ]
            },
            
            // 弹窗和任务点选择器
            popupsAndTasks: {
                // 弹窗容器
                popupContainer: [
                    '.popup',                 // 弹窗
                    '.modal',                 // 模态框
                    '.dialog',                // 对话框
                    '.overlay',               // 覆盖层
                    '.layer',                 // 层
                    '[data-role="popup"]',    // 数据属性
                    '.popup-container',       // 弹窗容器
                    '.modal-dialog'           // 模态对话框
                ],
                
                // 任务点
                taskPoint: [
                    '.task-point',            // 任务点
                    '.question',              // 问题
                    '.quiz',                  // 测验
                    '.exercise',              // 练习
                    '.homework',              // 作业
                    '[data-role="task"]',     // 数据属性
                    '.task-item',             // 任务项目
                    '.interactive-point'      // 交互点
                ],
                
                // 关闭按钮
                closeButton: [
                    '.close',                 // 关闭
                    '.btn-close',             // 关闭按钮
                    '.close-btn',             // 关闭按钮
                    '[title*="关闭"]',        // 标题包含关闭
                    '[title*="close"]',       // 标题包含close
                    '.modal-close',           // 模态关闭
                    '[data-role="close"]',    // 数据属性
                    'button[onclick*="close"]' // 点击事件包含close
                ],
                
                // 确认按钮
                confirmButton: [
                    '.confirm',               // 确认
                    '.btn-confirm',           // 确认按钮
                    '.ok',                    // 确定
                    '.btn-ok',                // 确定按钮
                    '.submit',                // 提交
                    '.btn-submit',            // 提交按钮
                    '[data-role="confirm"]',  // 数据属性
                    'button[type="submit"]'   // 提交类型按钮
                ]
            },
            
            // 页面导航选择器
            navigation: {
                // 下一个按钮
                nextButton: [
                    '.next',                  // 下一个
                    '.btn-next',              // 下一个按钮
                    '.next-btn',              // 下一个按钮
                    '[title*="下一个"]',      // 标题包含下一个
                    '[title*="next"]',        // 标题包含next
                    '.continue',              // 继续
                    '.btn-continue',          // 继续按钮
                    '[data-role="next"]'      // 数据属性
                ],
                
                // 上一个按钮
                prevButton: [
                    '.prev',                  // 上一个
                    '.previous',              // 上一个
                    '.btn-prev',              // 上一个按钮
                    '.prev-btn',              // 上一个按钮
                    '[title*="上一个"]',      // 标题包含上一个
                    '[title*="prev"]',        // 标题包含prev
                    '.back',                  // 返回
                    '[data-role="prev"]'      // 数据属性
                ]
            },
            
            // 学习通特定选择器 - 基于实际页面结构
            xuexitong: {
                // 登录相关
                login: {
                    // 用户名输入框
                    usernameInput: [
                        'input[name="username"]',
                        'input[name="uname"]',
                        'input[placeholder*="用户名"]',
                        'input[placeholder*="手机号"]',
                        'input[placeholder*="学号"]',
                        '#username',
                        '#uname',
                        '.username-input',
                        'input[type="text"]'
                    ],
                    
                    // 密码输入框
                    passwordInput: [
                        'input[name="password"]',
                        'input[name="pwd"]',
                        'input[placeholder*="密码"]',
                        '#password',
                        '#pwd',
                        '.password-input',
                        'input[type="password"]'
                    ],
                    
                    // 登录按钮
                    loginButton: [
                        'button[type="submit"]',
                        '.login-btn',
                        '.btn-login',
                        'input[type="submit"]',
                        'button[onclick*="login"]',
                        '#loginBtn',
                        '.submit-btn',
                        'button:contains("登录")'
                    ]
                },
                
                // 课程相关
                course: {
                    // 课程卡片
                    courseCard: [
                        '.course-card',
                        '.course-item',
                        '.my-course-item',
                        '.course-box',
                        'li[class*="course"]',
                        '[data-course-id]',
                        '.course-wrap'
                    ],
                    
                    // 课程标题
                    courseTitle: [
                        '.course-title',
                        '.course-name',
                        'h3.title',
                        'h4.title',
                        '.name',
                        'a[title]'
                    ],
                    
                    // 进入课程按钮
                    enterButton: [
                        '.enter-course',
                        '.btn-enter',
                        'a[href*="course"]',
                        'button[onclick*="course"]',
                        '.course-link'
                    ]
                },
                
                // 章节视频相关
                chapter: {
                    // 章节列表
                    chapterList: [
                        '.chapter-list',
                        '.video-list',
                        '.content-list',
                        '.tree-container',
                        '#chapterList',
                        '.course-content'
                    ],
                    
                    // 视频项目
                    videoItem: [
                        '.video-item',
                        '.chapter-item',
                        '.section-item',
                        'li[class*="video"]',
                        '.tree-node',
                        '[data-video-id]'
                    ],
                    
                    // 未完成的视频
                    incompleteVideo: [
                        '.video-item:not(.completed)',
                        '.chapter-item:not(.finished)',
                        'li:not(.done)',
                        '[data-status="incomplete"]',
                        '.status-incomplete'
                    ]
                },
                
                // 视频播放器相关
                player: {
                    // 视频元素
                    video: [
                        'video',
                        '#video',
                        '.video-player video',
                        'object[type*="video"]',
                        'embed[type*="video"]'
                    ],
                    
                    // 播放控制
                    playButton: [
                        '.play-btn',
                        '.btn-play',
                        '.video-play',
                        'button[title*="播放"]',
                        'button[onclick*="play"]'
                    ],
                    
                    // 暂停控制
                    pauseButton: [
                        '.pause-btn',
                        '.btn-pause',
                        '.video-pause',
                        'button[title*="暂停"]',
                        'button[onclick*="pause"]'
                    ],
                    
                    // 进度条
                    progressBar: [
                        '.progress-bar',
                        '.video-progress',
                        '.seek-bar',
                        'input[type="range"]',
                        '.timeline'
                    ]
                },
                
                // 弹窗和任务点
                popup: {
                    // 弹窗容器
                    container: [
                        '.popup',
                        '.modal',
                        '.dialog',
                        '.overlay',
                        '.layer',
                        '.popup-container'
                    ],
                    
                    // 任务点
                    taskPoint: [
                        '.task-point',
                        '.question',
                        '.quiz',
                        '.exercise',
                        '.homework',
                        '.interactive-point'
                    ],
                    
                    // 关闭按钮
                    closeButton: [
                        '.close',
                        '.btn-close',
                        'button[title*="关闭"]',
                        'button[onclick*="close"]',
                        '.modal-close'
                    ],
                    
                    // 确认按钮
                    confirmButton: [
                        '.confirm',
                        '.btn-confirm',
                        '.ok',
                        '.btn-ok',
                        '.submit',
                        'button[type="submit"]'
                    ]
                }
            }
        };
    }
    
    /**
     * 获取选择器组
     */
    getSelectors(category, type) {
        try {
            if (this.selectors[category] && this.selectors[category][type]) {
                return this.selectors[category][type];
            }
            return [];
        } catch (error) {
            console.error(`获取选择器失败: ${category}.${type}`, error);
            return [];
        }
    }
    
    /**
     * 尝试多个选择器，返回第一个找到的元素
     */
    async trySelectors(page, selectors, options = {}) {
        const { timeout = 5000, visible = true } = options;
        
        for (const selector of selectors) {
            try {
                console.log(`🔍 尝试选择器: ${selector}`);
                
                const element = await page.waitForSelector(selector, {
                    timeout: 1000,
                    visible: visible
                }).catch(() => null);
                
                if (element) {
                    console.log(`✅ 找到元素: ${selector}`);
                    return element;
                }
            } catch (error) {
                // 继续尝试下一个选择器
                continue;
            }
        }
        
        console.log(`❌ 所有选择器都未找到元素`);
        return null;
    }
    
    /**
     * 尝试多个选择器，返回所有找到的元素
     */
    async trySelectorsAll(page, selectors, options = {}) {
        const { minCount = 1 } = options;
        
        for (const selector of selectors) {
            try {
                console.log(`🔍 尝试选择器 (全部): ${selector}`);
                
                // 等待至少一个元素出现
                await page.waitForSelector(selector, {
                    timeout: 2000,
                    visible: true
                }).catch(() => null);
                
                const elements = await page.$$(selector);
                
                if (elements && elements.length >= minCount) {
                    console.log(`✅ 找到 ${elements.length} 个元素: ${selector}`);
                    return elements;
                }
            } catch (error) {
                // 继续尝试下一个选择器
                continue;
            }
        }
        
        console.log(`❌ 所有选择器都未找到足够的元素 (最少需要 ${minCount} 个)`);
        return [];
    }
    
    /**
     * 智能点击 - 尝试多种点击方式
     */
    async smartClick(page, element, options = {}) {
        const { delay = 1000 } = options;
        
        try {
            if (!element) {
                console.log('❌ 元素为空，无法点击');
                return false;
            }
            
            // 检查元素是否可见和可点击
            const isClickable = await element.evaluate(el => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                return rect.width > 0 && 
                       rect.height > 0 && 
                       style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       !el.disabled;
            });
            
            if (!isClickable) {
                console.log('❌ 元素不可点击');
                return false;
            }
            
            // 滚动到元素位置
            await element.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            
            // 尝试不同的点击方式
            const clickMethods = [
                // 方法1: 直接点击
                async () => {
                    console.log('🖱️ 尝试直接点击');
                    await element.click();
                    return true;
                },
                
                // 方法2: 强制点击
                async () => {
                    console.log('🖱️ 尝试强制点击');
                    await element.click({ force: true });
                    return true;
                },
                
                // 方法3: 执行onclick事件
                async () => {
                    console.log('🖱️ 尝试执行onclick事件');
                    const hasOnclick = await element.evaluate(el => {
                        if (el.onclick) {
                            el.onclick();
                            return true;
                        }
                        return false;
                    });
                    return hasOnclick;
                },
                
                // 方法4: 触发点击事件
                async () => {
                    console.log('🖱️ 尝试触发点击事件');
                    await element.evaluate(el => {
                        el.dispatchEvent(new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        }));
                    });
                    return true;
                },
                
                // 方法5: 模拟鼠标点击
                async () => {
                    console.log('🖱️ 尝试模拟鼠标点击');
                    const box = await element.boundingBox();
                    if (box) {
                        await page.mouse.click(
                            box.x + box.width / 2,
                            box.y + box.height / 2
                        );
                        return true;
                    }
                    return false;
                }
            ];
            
            // 依次尝试每种点击方式
            for (const method of clickMethods) {
                try {
                    const success = await method();
                    if (success) {
                        console.log('✅ 点击成功');
                        await page.waitForTimeout(delay);
                        return true;
                    }
                } catch (error) {
                    console.log(`点击方式失败: ${error.message}`);
                    continue;
                }
            }
            
            console.log('❌ 所有点击方式都失败了');
            return false;
            
        } catch (error) {
            console.error('智能点击失败:', error);
            return false;
        }
    }
    
    /**
     * 更新选择器配置
     */
    updateSelectors(category, type, newSelectors) {
        try {
            if (!this.selectors[category]) {
                this.selectors[category] = {};
            }
            
            this.selectors[category][type] = newSelectors;
            console.log(`✅ 更新选择器配置: ${category}.${type}`);
            
        } catch (error) {
            console.error(`更新选择器配置失败: ${category}.${type}`, error);
        }
    }
    
    /**
     * 导出选择器配置
     */
    exportConfig() {
        return JSON.stringify(this.selectors, null, 2);
    }
    
    /**
     * 导入选择器配置
     */
    importConfig(configJson) {
        try {
            const config = JSON.parse(configJson);
            this.selectors = { ...this.selectors, ...config };
            console.log('✅ 导入选择器配置成功');
        } catch (error) {
            console.error('导入选择器配置失败:', error);
        }
    }
}

module.exports = RealSelectorsConfig;