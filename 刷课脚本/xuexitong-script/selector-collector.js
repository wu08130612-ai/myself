/**
 * 选择器收集工具
 * 用于在真实的学习通页面上收集和测试CSS选择器
 * 
 * 使用方法：
 * 1. 在浏览器控制台中运行此脚本
 * 2. 使用提供的函数来收集选择器
 * 3. 将结果复制到 real-selectors.js 中
 */

class SelectorCollector {
    constructor() {
        this.collectedSelectors = {};
        this.init();
    }

    init() {
        console.log('🔧 选择器收集工具已启动');
        console.log('📋 可用命令：');
        console.log('  - collector.findCourseElements() - 查找课程相关元素');
        console.log('  - collector.findVideoElements() - 查找视频相关元素');
        console.log('  - collector.testSelector(selector) - 测试选择器');
        console.log('  - collector.exportSelectors() - 导出收集的选择器');
        
        // 将工具绑定到全局变量
        window.collector = this;
    }

    /**
     * 查找课程相关元素
     */
    findCourseElements() {
        console.log('🔍 开始查找课程相关元素...');
        
        const results = {
            courseList: {
                container: [],
                courseCard: [],
                courseTitle: [],
                courseLink: [],
                enterButton: []
            }
        };

        // 查找课程容器
        const containerCandidates = [
            '.course-list', '.my-course-list', '.course-container', 
            '.courses-wrap', '#courseList', '[data-role="course-list"]',
            '.grid-container', '.main-content', '.content-wrapper'
        ];

        containerCandidates.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                results.courseList.container.push({
                    selector: selector,
                    count: elements.length,
                    element: elements[0]
                });
            }
        });

        // 查找课程卡片
        const cardCandidates = [
            '.course-item', '.course-card', '.course-box', 
            '.my-course-item', '.course-wrap', '[data-role="course-item"]',
            '.grid-item', 'li[class*="course"]', '.card', '.item'
        ];

        cardCandidates.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                results.courseList.courseCard.push({
                    selector: selector,
                    count: elements.length,
                    element: elements[0]
                });
            }
        });

        // 查找课程标题
        const titleCandidates = [
            '.course-title', '.course-name', '.title', 'h3', 'h4', 
            '.name', '[data-role="title"]', '.card-title', '.item-title'
        ];

        titleCandidates.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                results.courseList.courseTitle.push({
                    selector: selector,
                    count: elements.length,
                    text: elements[0].textContent?.trim().substring(0, 50),
                    element: elements[0]
                });
            }
        });

        // 查找课程链接
        const linkCandidates = [
            'a[href*="course"]', 'a[href*="study"]', '.course-link',
            '.enter-btn', '.study-btn', 'a.btn', 'button[class*="enter"]'
        ];

        linkCandidates.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                results.courseList.courseLink.push({
                    selector: selector,
                    count: elements.length,
                    href: elements[0].href || elements[0].getAttribute('onclick'),
                    element: elements[0]
                });
            }
        });

        console.log('📊 课程元素查找结果：', results);
        this.collectedSelectors.courseList = results.courseList;
        
        return results;
    }

    /**
     * 查找视频相关元素
     */
    findVideoElements() {
        console.log('🔍 开始查找视频相关元素...');
        
        const results = {
            video: {
                container: [],
                videoElement: [],
                playButton: [],
                pauseButton: [],
                progressBar: [],
                timeDisplay: []
            },
            chapter: {
                chapterList: [],
                chapterItem: [],
                videoItem: [],
                incompleteVideo: []
            }
        };

        // 查找视频容器
        const videoCandidates = [
            'video', '.video-container', '.player-container', 
            '#video', '.video-wrapper', '.player-wrapper'
        ];

        videoCandidates.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                results.video.videoElement.push({
                    selector: selector,
                    count: elements.length,
                    element: elements[0]
                });
            }
        });

        // 查找播放按钮
        const playButtonCandidates = [
            '.play-btn', '.play-button', '[title*="播放"]', 
            '[aria-label*="play"]', '.video-play', 'button[class*="play"]'
        ];

        playButtonCandidates.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                results.video.playButton.push({
                    selector: selector,
                    count: elements.length,
                    element: elements[0]
                });
            }
        });

        // 查找章节列表
        const chapterCandidates = [
            '.chapter-list', '.video-list', '.course-content',
            '.lesson-list', '.section-list', '[data-role="chapter"]'
        ];

        chapterCandidates.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                results.chapter.chapterList.push({
                    selector: selector,
                    count: elements.length,
                    element: elements[0]
                });
            }
        });

        console.log('📊 视频元素查找结果：', results);
        this.collectedSelectors.video = results.video;
        this.collectedSelectors.chapter = results.chapter;
        
        return results;
    }

    /**
     * 测试选择器
     */
    testSelector(selector) {
        try {
            const elements = document.querySelectorAll(selector);
            console.log(`🧪 测试选择器: ${selector}`);
            console.log(`📊 找到 ${elements.length} 个元素`);
            
            if (elements.length > 0) {
                console.log('✅ 选择器有效');
                elements.forEach((el, index) => {
                    if (index < 3) { // 只显示前3个
                        console.log(`  元素 ${index + 1}:`, {
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            text: el.textContent?.trim().substring(0, 50)
                        });
                    }
                });
                
                // 高亮显示找到的元素
                elements.forEach(el => {
                    el.style.outline = '3px solid red';
                    el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                });
                
                // 3秒后移除高亮
                setTimeout(() => {
                    elements.forEach(el => {
                        el.style.outline = '';
                        el.style.backgroundColor = '';
                    });
                }, 3000);
                
                return elements;
            } else {
                console.log('❌ 选择器无效，未找到元素');
                return null;
            }
        } catch (error) {
            console.error('❌ 选择器测试出错:', error);
            return null;
        }
    }

    /**
     * 获取元素的多种选择器
     */
    getElementSelectors(element) {
        const selectors = [];
        
        // ID选择器
        if (element.id) {
            selectors.push(`#${element.id}`);
        }
        
        // 类选择器
        if (element.className) {
            const classes = element.className.split(' ').filter(c => c.trim());
            if (classes.length > 0) {
                selectors.push(`.${classes.join('.')}`);
                // 单个类选择器
                classes.forEach(cls => {
                    selectors.push(`.${cls}`);
                });
            }
        }
        
        // 属性选择器
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
                selectors.push(`[${attr.name}="${attr.value}"]`);
            }
        });
        
        // 标签选择器
        selectors.push(element.tagName.toLowerCase());
        
        // 组合选择器（父元素 + 当前元素）
        if (element.parentElement) {
            const parentClass = element.parentElement.className;
            if (parentClass) {
                const parentClasses = parentClass.split(' ').filter(c => c.trim())[0];
                if (parentClasses) {
                    selectors.push(`.${parentClasses} ${element.tagName.toLowerCase()}`);
                    if (element.className) {
                        const childClass = element.className.split(' ').filter(c => c.trim())[0];
                        if (childClass) {
                            selectors.push(`.${parentClasses} .${childClass}`);
                        }
                    }
                }
            }
        }
        
        return selectors;
    }

    /**
     * 导出收集的选择器
     */
    exportSelectors() {
        console.log('📤 导出收集的选择器...');
        
        const exportData = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            selectors: this.collectedSelectors
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        
        console.log('📋 选择器数据（复制以下内容）：');
        console.log(jsonString);
        
        // 尝试复制到剪贴板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(jsonString).then(() => {
                console.log('✅ 选择器数据已复制到剪贴板');
            }).catch(err => {
                console.log('⚠️ 无法自动复制，请手动复制上面的内容');
            });
        }
        
        return exportData;
    }

    /**
     * 智能分析页面结构
     */
    analyzePage() {
        console.log('🔍 开始智能分析页面结构...');
        
        const analysis = {
            pageType: this.detectPageType(),
            mainContainers: this.findMainContainers(),
            interactiveElements: this.findInteractiveElements(),
            recommendations: []
        };
        
        console.log('📊 页面分析结果：', analysis);
        return analysis;
    }

    detectPageType() {
        const url = window.location.href;
        const title = document.title;
        
        if (url.includes('course') || title.includes('课程')) {
            return 'course_list';
        } else if (url.includes('video') || title.includes('视频')) {
            return 'video_page';
        } else if (url.includes('study') || title.includes('学习')) {
            return 'study_page';
        } else {
            return 'unknown';
        }
    }

    findMainContainers() {
        const containers = [];
        const candidates = document.querySelectorAll('div[class*="container"], div[class*="wrapper"], div[class*="content"], main, section');
        
        candidates.forEach(el => {
            if (el.offsetWidth > 200 && el.offsetHeight > 200) {
                containers.push({
                    element: el,
                    selector: this.getElementSelectors(el)[0],
                    size: { width: el.offsetWidth, height: el.offsetHeight }
                });
            }
        });
        
        return containers;
    }

    findInteractiveElements() {
        const interactive = [];
        const candidates = document.querySelectorAll('button, a, input, [onclick], [role="button"]');
        
        candidates.forEach(el => {
            if (el.offsetWidth > 0 && el.offsetHeight > 0) {
                interactive.push({
                    element: el,
                    selector: this.getElementSelectors(el)[0],
                    text: el.textContent?.trim().substring(0, 30),
                    type: el.tagName.toLowerCase()
                });
            }
        });
        
        return interactive;
    }
}

// 自动启动收集工具
const selectorCollector = new SelectorCollector();

console.log('🎯 选择器收集工具使用指南：');
console.log('1. 运行 collector.findCourseElements() 查找课程元素');
console.log('2. 运行 collector.findVideoElements() 查找视频元素');
console.log('3. 运行 collector.testSelector("您的选择器") 测试选择器');
console.log('4. 运行 collector.exportSelectors() 导出结果');
console.log('5. 运行 collector.analyzePage() 智能分析页面');