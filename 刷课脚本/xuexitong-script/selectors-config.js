/**
 * 学习通页面选择器配置
 * 基于真实学习通页面结构分析 (chaoxing.com)
 * 参考: http://mooc1-2.chaoxing.com/visit/courses 页面结构
 */

class SelectorsConfig {
    constructor() {
        // 登录页面选择器 (passport2.chaoxing.com)
        this.login = {
            usernameInput: 'input[name="uname"], input[placeholder*="手机号"], input[placeholder*="用户名"], #phone',
            passwordInput: 'input[name="password"], input[type="password"], #pwd',
            loginButton: '#loginBtn, .login_btn, button[type="submit"], input[value*="登录"]',
            captchaInput: 'input[name="captcha"], input[placeholder*="验证码"]',
            captchaImage: 'img[src*="captcha"], .captcha-img, #captchaImg'
        };

        // 课程列表选择器 (基于真实DOM结构: ul > li 结构)
        this.courseList = {
            // 课程列表容器 - 学习通使用ul结构包含多个li课程项
            courseContainer: [
                'ul.courselist',
                'ul[class*="course"]', 
                '.course-list ul',
                'ul.clearfix'
            ],
            // 课程卡片 - 每个课程是一个li元素
            courseCards: [
                'ul.courselist > li',
                'ul[class*="course"] > li',
                '.course-list ul > li',
                'li[onclick*="course"]',
                'li[class*="course"]'
            ],
            // 课程标题 - 通常在li内的特定位置
            courseTitle: [
                'li h3',
                'li .course-name',
                'li .coursename', 
                'li .title',
                'li a[title]',
                'li span.course-title'
            ],
            // 课程链接 - li元素通常包含onclick或内部a标签
            courseLink: [
                'li[onclick*="course"]',
                'li a[href*="course"]',
                'li a[href*="study"]',
                'li .course-link',
                'li a'
            ],
            // 进入课程的可点击元素
            enterButton: [
                'li[onclick]',
                'li a',
                'li .enter-btn',
                'li .study-btn'
            ]
        };

        // 视频播放相关选择器
        this.video = {
            // 视频播放器
            videoPlayer: [
                'video',
                '.video-player video',
                '#video-player video',
                'iframe[src*="video"]'
            ],
            // 播放按钮
            playButton: [
                '.play-btn',
                '.video-play',
                'button[class*="play"]',
                '.control-play',
                '.vjs-play-control',
                '.dplayer-play-icon'
            ],
            // 暂停按钮
            pauseButton: [
                '.pause-btn',
                '.video-pause',
                'button[class*="pause"]',
                '.control-pause'
            ],
            // 进度条
            progressBar: [
                '.progress-bar',
                '.video-progress',
                '.vjs-progress-control',
                'input[type="range"]'
            ],
            // 时间显示
            timeDisplay: [
                '.time-display',
                '.video-time',
                '.vjs-current-time',
                '.current-time'
            ]
        };

        // 章节和课程内容选择器
        this.content = {
            // 章节列表
            chapterList: [
                '.chapter-list',
                '.content-list',
                '.lesson-list',
                'ul[class*="chapter"]',
                '.course-content ul'
            ],
            // 章节项目
            chapterItem: [
                '.chapter-item',
                '.lesson-item',
                'li[class*="chapter"]',
                'li[class*="lesson"]',
                '.content-item'
            ],
            // 视频章节
            videoChapter: [
                'li:has(video)',
                'li[class*="video"]',
                '.video-lesson',
                'li:contains("视频")'
            ],
            // 章节标题
            chapterTitle: [
                '.chapter-title',
                '.lesson-title',
                'h3', 'h4', 'h5',
                '.title'
            ]
        };

        // 学习进度相关选择器
        this.progress = {
            // 进度百分比
            progressPercent: [
                '.progress-percent',
                '.study-progress',
                '[class*="progress"][class*="percent"]'
            ],
            // 完成状态
            completedStatus: [
                '.completed',
                '.finished',
                '[class*="complete"]',
                '.status-done'
            ],
            // 学习时长
            studyTime: [
                '.study-time',
                '.duration',
                '[class*="time"]'
            ]
        };

        // 视频播放页面选择器 (基于真实播放页面结构)
        this.videoPage = {
            // 视频章节列表 - 学习通使用特定的章节结构
            chapterList: [
                '.chapter_list',
                '.chapter-list',
                '.catalog_list',
                '.catalog-list',
                'ul.chapter',
                '.directory ul'
            ],
            // 视频章节项 - 每个章节通常是li元素
            videoSections: [
                '.chapter_list li',
                '.chapter-list li',
                '.catalog_list li',
                'ul.chapter li',
                'li[class*="chapter"]',
                'li[onclick*="video"]',
                'li[data-id]'
            ],
            // 视频标题
            videoTitle: [
                'li .chapter-title',
                'li .video-title',
                'li .title',
                'li span.name',
                'li a[title]',
                'li .text'
            ],
            // 视频播放器容器
            videoPlayer: [
                '#video',
                '.video-player',
                'video',
                'iframe[src*="video"]',
                '.player-container video',
                '#videoPlayer'
            ],
            // 播放按钮
            playButton: [
                '.play-btn',
                '.video-play',
                'button[class*="play"]',
                '.player-control .play',
                '.vjs-play-control'
            ],
            // 暂停按钮
            pauseButton: [
                '.pause-btn',
                '.video-pause',
                'button[class*="pause"]',
                '.player-control .pause',
                '.vjs-pause-control'
            ],
            // 进度条
            progressBar: [
                '.progress-bar',
                '.video-progress',
                '.vjs-progress-control',
                'input[type="range"]',
                '.player-progress'
            ],
            // 时间显示
            timeDisplay: [
                '.time-display',
                '.video-time',
                '.vjs-current-time',
                '.current-time'
            ],
            // 全屏按钮
            fullscreenButton: [
                '.fullscreen-btn',
                '.vjs-fullscreen-control',
                'button[class*="fullscreen"]'
            ]
        };

        // 任务点相关选择器
        this.taskPoint = {
            // 任务点容器
            taskContainer: [
                '.task-point',
                '.mission-point',
                '.point-container',
                '[class*="task"][class*="point"]'
            ],
            // 任务点状态
            taskStatus: [
                '.task-status',
                '.point-status',
                '.status',
                '[class*="status"]'
            ],
            // 完成标记
            completedMark: [
                '.completed',
                '.finished',
                '.done',
                '[class*="complete"]'
            ]
        };

        // 页面导航选择器
        this.navigation = {
            // 下一页/下一章
            nextButton: [
                '.next-btn',
                '.btn-next',
                'button:contains("下一")',
                'a:contains("下一")',
                '[class*="next"]'
            ],
            // 上一页/上一章
            prevButton: [
                '.prev-btn',
                '.btn-prev',
                'button:contains("上一")',
                'a:contains("上一")',
                '[class*="prev"]'
            ],
            // 返回课程列表
            backButton: [
                '.back-btn',
                '.btn-back',
                'button:contains("返回")',
                'a:contains("返回")',
                '[class*="back"]'
            ]
        };

        // 弹窗和提示选择器
        this.popup = {
            // 弹窗容器
            modal: [
                '.modal',
                '.popup',
                '.dialog',
                '[class*="modal"]',
                '[class*="popup"]'
            ],
            // 关闭按钮
            closeButton: [
                '.close',
                '.btn-close',
                'button:contains("关闭")',
                'button:contains("确定")',
                '[class*="close"]'
            ],
            // 确认按钮
            confirmButton: [
                '.confirm',
                '.btn-confirm',
                'button:contains("确定")',
                'button:contains("确认")',
                '[class*="confirm"]'
            ]
        };
    }

    /**
     * 尝试多个选择器，返回第一个找到的元素
     * @param {Page} page - Puppeteer页面对象
     * @param {Array} selectors - 选择器数组
     * @param {Object} options - 选项
     * @returns {Promise<ElementHandle|null>}
     */
    async trySelectors(page, selectors, options = {}) {
        const { timeout = 5000, visible = true } = options;
        
        for (const selector of selectors) {
            try {
                const element = await page.waitForSelector(selector, {
                    timeout: timeout / selectors.length,
                    visible
                });
                if (element) {
                    console.log(`✓ 找到元素: ${selector}`);
                    return element;
                }
            } catch (error) {
                // 继续尝试下一个选择器
                continue;
            }
        }
        
        console.log(`✗ 未找到任何匹配的元素: ${selectors.join(', ')}`);
        return null;
    }

    /**
     * 尝试多个选择器，返回所有找到的元素
     * @param {Page} page - Puppeteer页面对象
     * @param {Array} selectors - 选择器数组
     * @returns {Promise<Array>}
     */
    async trySelectorsAll(page, selectors) {
        for (const selector of selectors) {
            try {
                const elements = await page.$$(selector);
                if (elements && elements.length > 0) {
                    console.log(`✓ 找到 ${elements.length} 个元素: ${selector}`);
                    return elements;
                }
            } catch (error) {
                // 继续尝试下一个选择器
                continue;
            }
        }
        
        console.log(`✗ 未找到任何匹配的元素: ${selectors.join(', ')}`);
        return [];
    }

    /**
     * 智能点击元素（处理各种点击方式）
     * @param {Page} page - Puppeteer页面对象
     * @param {ElementHandle} element - 要点击的元素
     * @param {Object} options - 选项
     */
    async smartClick(page, element, options = {}) {
        const { delay = 100, force = false } = options;
        
        try {
            // 首先尝试普通点击
            await element.click({ delay });
            console.log('✓ 普通点击成功');
            return true;
        } catch (error) {
            console.log('普通点击失败，尝试其他方式...');
            
            try {
                // 尝试JavaScript点击
                await page.evaluate(el => el.click(), element);
                console.log('✓ JavaScript点击成功');
                return true;
            } catch (jsError) {
                console.log('JavaScript点击失败，尝试模拟点击...');
                
                try {
                    // 获取元素位置并模拟点击
                    const box = await element.boundingBox();
                    if (box) {
                        await page.mouse.click(
                            box.x + box.width / 2,
                            box.y + box.height / 2
                        );
                        console.log('✓ 模拟点击成功');
                        return true;
                    }
                } catch (mouseError) {
                    console.log('所有点击方式都失败了');
                    return false;
                }
            }
        }
    }

    /**
     * 获取多个选择器的组合查询
     */
    getCombinedSelector(selectorArray) {
        return selectorArray.join(', ');
    }

    /**
     * 根据页面类型获取相应的选择器配置
     */
    getSelectorsForPage(pageType) {
        switch (pageType) {
            case 'login':
                return this.login;
            case 'courseList':
                return this.courseList;
            case 'video':
                return this.video;
            case 'content':
                return this.content;
            case 'progress':
                return this.progress;
            case 'popup':
                return this.popup;
            default:
                return {};
        }
    }

    /**
     * 获取课程列表的完整选择器
     */
    getCourseListSelectors() {
        return {
            container: this.getCombinedSelector(this.courseList.courseCards),
            title: this.getCombinedSelector(this.courseList.courseTitle),
            link: this.getCombinedSelector(this.courseList.courseLink),
            enterButton: this.getCombinedSelector(this.courseList.enterButton)
        };
    }

    /**
     * 获取视频播放的完整选择器
     */
    getVideoSelectors() {
        return {
            player: this.getCombinedSelector(this.video.videoPlayer),
            playButton: this.getCombinedSelector(this.video.playButton),
            pauseButton: this.getCombinedSelector(this.video.pauseButton),
            progressBar: this.getCombinedSelector(this.video.progressBar),
            timeDisplay: this.getCombinedSelector(this.video.timeDisplay)
        };
    }

    /**
     * 获取章节内容的完整选择器
     */
    getContentSelectors() {
        return {
            chapterList: this.getCombinedSelector(this.content.chapterList),
            chapterItem: this.getCombinedSelector(this.content.chapterItem),
            videoChapter: this.getCombinedSelector(this.content.videoChapter),
            chapterTitle: this.getCombinedSelector(this.content.chapterTitle)
        };
    }
}

module.exports = SelectorsConfig;