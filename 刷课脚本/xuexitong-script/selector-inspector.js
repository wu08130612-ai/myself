/**
 * 选择器检查工具
 * 用于在真实页面上测试和获取准确的CSS选择器
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class SelectorInspector {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            courseList: [],
            videoSections: [],
            playButtons: [],
            progressBars: [],
            popups: [],
            taskPoints: []
        };
    }

    /**
     * 启动浏览器并打开页面
     */
    async launch() {
        try {
            console.log('🚀 启动选择器检查工具...');
            
            this.browser = await chromium.launch({
                headless: false,
                devtools: true,
                args: [
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            });

            const context = await this.browser.newContext({
                viewport: { width: 1366, height: 768 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });

            this.page = await context.newPage();
            
            // 注入检查脚本
            await this.injectInspectorScript();
            
            console.log('✅ 浏览器启动成功');
            console.log('📋 请按照以下步骤操作：');
            console.log('1. 手动登录学习通');
            console.log('2. 导航到课程列表页面');
            console.log('3. 在控制台输入 window.inspectCourseList() 来检查课程列表');
            console.log('4. 进入任意课程，输入 window.inspectVideoSections() 来检查视频列表');
            console.log('5. 播放任意视频，输入 window.inspectVideoPage() 来检查视频页面元素');
            
            // 导航到学习通首页
            await this.page.goto('https://www.xuexitong.com', { waitUntil: 'networkidle' });
            
            return true;
        } catch (error) {
            console.error('❌ 启动失败:', error);
            return false;
        }
    }

    /**
     * 注入检查脚本到页面
     */
    async injectInspectorScript() {
        await this.page.addInitScript(() => {
            // 课程列表检查函数
            window.inspectCourseList = function() {
                console.log('🔍 开始检查课程列表...');
                
                const results = {
                    containers: [],
                    courseCards: [],
                    courseTitles: [],
                    courseLinks: []
                };
                
                // 查找可能的课程容器
                const containerSelectors = [
                    '.course-list',
                    '.course-container',
                    '.course-wrap',
                    '.course-box',
                    '.courses',
                    '.my-course',
                    '.course-grid',
                    '[class*="course"]',
                    '[class*="Course"]',
                    '.list-group',
                    '.card-list',
                    '.grid-container'
                ];
                
                containerSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        elements.forEach((el, index) => {
                            results.containers.push({
                                selector: selector,
                                index: index,
                                element: el,
                                childCount: el.children.length,
                                className: el.className,
                                id: el.id,
                                innerHTML: el.innerHTML.substring(0, 200) + '...'
                            });
                        });
                    }
                });
                
                // 查找课程卡片
                const cardSelectors = [
                    '.course-item',
                    '.course-card',
                    '.course',
                    '.card',
                    '.item',
                    '[class*="course"]',
                    '[class*="Course"]',
                    'li',
                    '.list-item',
                    '.grid-item'
                ];
                
                cardSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 2) { // 假设课程列表至少有3个项目
                        results.courseCards.push({
                            selector: selector,
                            count: elements.length,
                            sample: elements[0]
                        });
                    }
                });
                
                // 查找课程标题
                const titleSelectors = [
                    '.course-title',
                    '.course-name',
                    '.title',
                    '.name',
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    '.text',
                    '[class*="title"]',
                    '[class*="Title"]',
                    '[class*="name"]',
                    '[class*="Name"]'
                ];
                
                titleSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        elements.forEach((el, index) => {
                            if (el.textContent && el.textContent.trim().length > 0) {
                                results.courseTitles.push({
                                    selector: selector,
                                    index: index,
                                    text: el.textContent.trim(),
                                    element: el
                                });
                            }
                        });
                    }
                });
                
                // 查找课程链接
                const linkSelectors = [
                    'a[href*="course"]',
                    'a[href*="Course"]',
                    'a[onclick*="course"]',
                    'a[onclick*="Course"]',
                    '[onclick*="course"]',
                    '[onclick*="Course"]',
                    'a',
                    '.link',
                    '[class*="link"]'
                ];
                
                linkSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((el, index) => {
                        if (el.href || el.onclick) {
                            results.courseLinks.push({
                                selector: selector,
                                index: index,
                                href: el.href,
                                onclick: el.onclick ? el.onclick.toString() : null,
                                text: el.textContent ? el.textContent.trim() : '',
                                element: el
                            });
                        }
                    });
                });
                
                console.log('📊 课程列表检查结果:', results);
                window.courseListResults = results;
                return results;
            };
            
            // 视频章节检查函数
            window.inspectVideoSections = function() {
                console.log('🔍 开始检查视频章节...');
                
                const results = {
                    containers: [],
                    videoItems: [],
                    videoTitles: [],
                    videoLinks: [],
                    completionStatus: []
                };
                
                // 查找章节容器
                const containerSelectors = [
                    '.chapter-list',
                    '.video-list',
                    '.section-list',
                    '.lesson-list',
                    '.content-list',
                    '[class*="chapter"]',
                    '[class*="Chapter"]',
                    '[class*="video"]',
                    '[class*="Video"]',
                    '[class*="section"]',
                    '[class*="Section"]',
                    '.tree',
                    '.menu',
                    '.nav'
                ];
                
                containerSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        elements.forEach((el, index) => {
                            results.containers.push({
                                selector: selector,
                                index: index,
                                element: el,
                                childCount: el.children.length,
                                className: el.className,
                                id: el.id
                            });
                        });
                    }
                });
                
                // 查找视频项目
                const itemSelectors = [
                    '.video-item',
                    '.chapter-item',
                    '.section-item',
                    '.lesson-item',
                    '.content-item',
                    '.item',
                    'li',
                    '[class*="video"]',
                    '[class*="Video"]',
                    '[class*="chapter"]',
                    '[class*="Chapter"]'
                ];
                
                itemSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 1) {
                        results.videoItems.push({
                            selector: selector,
                            count: elements.length,
                            sample: elements[0]
                        });
                    }
                });
                
                // 查找完成状态指示器
                const statusSelectors = [
                    '.completed',
                    '.finished',
                    '.done',
                    '.status',
                    '.progress',
                    '[class*="complete"]',
                    '[class*="Complete"]',
                    '[class*="finish"]',
                    '[class*="Finish"]',
                    '[class*="done"]',
                    '[class*="Done"]',
                    '.icon',
                    '.badge',
                    '.tag'
                ];
                
                statusSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((el, index) => {
                        results.completionStatus.push({
                            selector: selector,
                            index: index,
                            text: el.textContent ? el.textContent.trim() : '',
                            className: el.className,
                            element: el
                        });
                    });
                });
                
                console.log('📊 视频章节检查结果:', results);
                window.videoSectionsResults = results;
                return results;
            };
            
            // 视频页面检查函数
            window.inspectVideoPage = function() {
                console.log('🔍 开始检查视频页面...');
                
                const results = {
                    videoElements: [],
                    playButtons: [],
                    progressBars: [],
                    timeDisplays: [],
                    popups: [],
                    taskPoints: []
                };
                
                // 查找视频元素
                const videoElements = document.querySelectorAll('video');
                videoElements.forEach((el, index) => {
                    results.videoElements.push({
                        index: index,
                        src: el.src,
                        currentTime: el.currentTime,
                        duration: el.duration,
                        paused: el.paused,
                        element: el
                    });
                });
                
                // 查找播放按钮
                const playButtonSelectors = [
                    '.play-btn',
                    '.play-button',
                    '.btn-play',
                    '[class*="play"]',
                    '[class*="Play"]',
                    '.control-play',
                    '.video-play',
                    'button[title*="播放"]',
                    'button[title*="play"]',
                    '[onclick*="play"]'
                ];
                
                playButtonSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((el, index) => {
                        results.playButtons.push({
                            selector: selector,
                            index: index,
                            text: el.textContent ? el.textContent.trim() : '',
                            title: el.title,
                            element: el
                        });
                    });
                });
                
                // 查找进度条
                const progressSelectors = [
                    '.progress',
                    '.progress-bar',
                    '.video-progress',
                    '[class*="progress"]',
                    '[class*="Progress"]',
                    '.slider',
                    '.seek-bar',
                    '.timeline'
                ];
                
                progressSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((el, index) => {
                        results.progressBars.push({
                            selector: selector,
                            index: index,
                            value: el.value,
                            max: el.max,
                            style: el.style.width,
                            element: el
                        });
                    });
                });
                
                // 查找时间显示
                const timeSelectors = [
                    '.time',
                    '.duration',
                    '.current-time',
                    '.total-time',
                    '[class*="time"]',
                    '[class*="Time"]',
                    '[class*="duration"]',
                    '[class*="Duration"]'
                ];
                
                timeSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((el, index) => {
                        const text = el.textContent ? el.textContent.trim() : '';
                        if (text.match(/\d+:\d+/)) { // 包含时间格式
                            results.timeDisplays.push({
                                selector: selector,
                                index: index,
                                text: text,
                                element: el
                            });
                        }
                    });
                });
                
                // 查找弹窗和任务点
                const popupSelectors = [
                    '.popup',
                    '.modal',
                    '.dialog',
                    '.overlay',
                    '.task-point',
                    '.question',
                    '.quiz',
                    '[class*="popup"]',
                    '[class*="Popup"]',
                    '[class*="modal"]',
                    '[class*="Modal"]',
                    '[class*="task"]',
                    '[class*="Task"]'
                ];
                
                popupSelectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((el, index) => {
                        if (el.offsetWidth > 0 && el.offsetHeight > 0) { // 可见元素
                            results.popups.push({
                                selector: selector,
                                index: index,
                                text: el.textContent ? el.textContent.trim().substring(0, 100) : '',
                                className: el.className,
                                element: el
                            });
                        }
                    });
                });
                
                console.log('📊 视频页面检查结果:', results);
                window.videoPageResults = results;
                return results;
            };
            
            // 导出结果函数
            window.exportResults = function() {
                const allResults = {
                    courseList: window.courseListResults || {},
                    videoSections: window.videoSectionsResults || {},
                    videoPage: window.videoPageResults || {},
                    timestamp: new Date().toISOString(),
                    url: window.location.href
                };
                
                console.log('📤 导出所有检查结果:', allResults);
                
                // 创建下载链接
                const dataStr = JSON.stringify(allResults, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `xuexitong-selectors-${Date.now()}.json`;
                link.click();
                
                return allResults;
            };
            
            // 高亮元素函数
            window.highlightElement = function(selector) {
                // 移除之前的高亮
                document.querySelectorAll('.inspector-highlight').forEach(el => {
                    el.classList.remove('inspector-highlight');
                });
                
                // 添加高亮样式
                const style = document.createElement('style');
                style.textContent = `
                    .inspector-highlight {
                        outline: 3px solid red !important;
                        background-color: rgba(255, 0, 0, 0.1) !important;
                    }
                `;
                document.head.appendChild(style);
                
                // 高亮匹配的元素
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    el.classList.add('inspector-highlight');
                });
                
                console.log(`🎯 高亮了 ${elements.length} 个元素: ${selector}`);
                return elements.length;
            };
            
            console.log('✅ 检查脚本已注入，可用函数:');
            console.log('- window.inspectCourseList() - 检查课程列表');
            console.log('- window.inspectVideoSections() - 检查视频章节');
            console.log('- window.inspectVideoPage() - 检查视频页面');
            console.log('- window.highlightElement(selector) - 高亮元素');
            console.log('- window.exportResults() - 导出结果');
        });
    }

    /**
     * 等待用户操作
     */
    async waitForUserInput() {
        console.log('\n⏳ 等待用户操作...');
        console.log('💡 提示：');
        console.log('  - 打开浏览器开发者工具 (F12)');
        console.log('  - 在控制台中使用检查函数');
        console.log('  - 完成后按 Ctrl+C 退出');
        
        // 保持程序运行
        return new Promise((resolve) => {
            process.on('SIGINT', () => {
                console.log('\n👋 用户退出');
                resolve();
            });
        });
    }

    /**
     * 清理资源
     */
    async cleanup() {
        try {
            if (this.browser) {
                await this.browser.close();
                console.log('✅ 浏览器已关闭');
            }
        } catch (error) {
            console.error('❌ 清理失败:', error);
        }
    }

    /**
     * 运行检查工具
     */
    async run() {
        try {
            const success = await this.launch();
            if (success) {
                await this.waitForUserInput();
            }
        } catch (error) {
            console.error('❌ 运行失败:', error);
        } finally {
            await this.cleanup();
        }
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const inspector = new SelectorInspector();
    inspector.run();
}

module.exports = SelectorInspector;