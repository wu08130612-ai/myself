const { chromium } = require('playwright');
const AntiDetection = require('./anti-detection');
const DurationController = require('./duration-controller');
const PerformanceOptimizer = require('./performance-optimizer');
const SelectorsConfig = require('./selectors-config');
const RealSelectorsConfig = require('./real-selectors');
const Utils = require('./utils');
const config = require('./config.json');

class XuexitongBot {
    constructor() {
        this.browser = null;
        this.page = null;
        this.antiDetection = new AntiDetection();
        this.durationController = new DurationController();
        this.performanceOptimizer = new PerformanceOptimizer();
        this.selectorsConfig = new SelectorsConfig();
        this.realSelectors = new RealSelectorsConfig();
        this.utils = new Utils();
        this.isRunning = false;
        this.currentCourse = null;
        this.completedCourses = [];
        this.startTime = null;
        this.totalStudyTime = 0;
    }

    /**
     * 启动机器人
     */
    async start() {
        try {
            console.log('🚀 启动学习通自动化脚本...');
            
            // 启动浏览器
            this.browser = await chromium.launch({ 
                headless: false,
                slowMo: 500,
                args: [
                    '--no-sandbox',
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
            
            // 初始化反检测系统
            this.antiDetection = new AntiDetection(this.page);
            await this.antiDetection.initialize();
            
            // 导航到登录页面
            await this.navigateToLogin();
            
            // 等待用户登录
            await this.waitForLogin();
            
            // 导航到课程列表页面
            await this.navigateToCourseList();

            // 开始自动化学习
            await this.startAutoStudy();
            
        } catch (error) {
            console.error('❌ 启动失败:', error);
            await this.cleanup();
        }
    }

    /**
     * 导航到登录页面
     */
    async navigateToLogin() {
        console.log('🔐 导航到学习通登录页面...');
        await this.page.goto('https://passport2.chaoxing.com/login');
        await this.page.waitForLoadState('networkidle');
        console.log('✅ 登录页面已加载');
    }

    /**
     * 等待用户登录
     */
    async waitForLogin() {
        console.log('⏳ 等待用户登录...');
        
        // 等待登录成功的标志
        try {
            await this.page.waitForURL('**/space/**', { timeout: 300000 }); // 5分钟超时
            console.log('✅ 登录成功！');
        } catch (error) {
            console.log('⚠️ 登录超时，请检查登录状态');
            throw error;
        }
    }

    /**
     * 导航到课程列表页面
     */
    async navigateToCourseList() {
        console.log('🧭 正在点击“课程”菜单...');
        try {
            const courseButtonSelector = '#first2172063';
            await this.page.waitForSelector(courseButtonSelector, { timeout: 15000 });
            await this.page.click(courseButtonSelector);
            await this.page.waitForLoadState('networkidle');
            console.log('✅ 已进入课程列表页面。');
        } catch (error) {
            console.log('⚠️ 未在左侧菜单中找到“课程”按钮。脚本将尝试直接在当前页面寻找课程。');
        }
    }

    /**
     * 开始自动学习
     */
    async startAutoStudy() {
        console.log('📚 开始自动学习流程...');
        this.isRunning = true;
        
        try {
            // 获取章节列表
            const chapters = await this.getChapterList();
            if (chapters.length === 0) {
                console.log('❌ 未能获取到任何章节，脚本停止。');
                return;
            }
            console.log(`📋 发现 ${chapters.length} 个章节`);
            
            for (const chapter of chapters) {
                if (!this.isRunning) break;
                
                console.log(`\n🎯 开始学习章节: ${chapter.name}`);
                this.durationController.startStudySession(chapter.id, chapter.name);
                
                await this.studyChapter(chapter);
                
                this.durationController.endStudySession();
                
                // 章节间休息
                await this.durationController.smartWait(60000, 0.5); // 1分钟左右休息
            }
            
            console.log('🎉 所有章节学习完成！');
            
        } catch (error) {
            console.error('❌ 自动学习出错:', error);
        }
    }

    /**
     * 获取章节列表
     */
    async getChapterList() {
        try {
            console.log('🖼️ 正在定位章节列表所在的“画中画”(iframe)...');
            const frame = this.page.frameLocator('#frame_content');
            if (!frame) {
                console.log('❌ 未找到“画中画”，无法继续。');
                return [];
            }

            console.log('🔍 正在“画中画”内查找章节列表...');
            // 等待章节目录加载
            await frame.locator('#coursetree .posCatalog_select').first().waitFor({ timeout: 20000 });
            
            console.log('🧠 正在分析章节结构...');
            const chapters = await frame.evaluate(() => {
                const chapterElements = document.querySelectorAll('#coursetree .posCatalog_select');
                return Array.from(chapterElements).map((element, index) => {
                    const titleElement = element.querySelector('span');
                    const title = titleElement ? titleElement.getAttribute('title') : `章节 ${index + 1}`;
                    // 直接从onclick属性中提取URL和参数，这是更可靠的方法
                    const onclickAttr = element.getAttribute('onclick');
                    
                    return {
                        id: element.id || `chapter_${index}`,
                        name: title,
                        onclick: onclickAttr, // 保存整个onclick字符串，后续用于点击
                        element: element // This won't be returned, just for reference here
                    };
                }).filter(chapter => chapter.onclick); // 只保留可以点击的章节
            });
            
            console.log(`✅ 成功分析出 ${chapters.length} 个章节。`);
            return chapters;

        } catch (error) {
            console.log('⚠️ 获取章节列表失败，可能是页面结构已改变或加载超时。');
            console.error(error);
            return []; // 出错时返回空数组
        }
    }

    /**
     * 进入课程
     */
    async enterCourse(course) {
        console.log(`📖 正在进入课程: ${course.title}`);
        
        try {
            // 应用反检测措施
            await this.antiDetection.simulateHumanBehavior(this.page);
            
            // 智能点击进入课程
            let success = false;
            
            // 方法1: 如果有onclick事件，尝试执行
            if (course.clickHandler) {
                try {
                    console.log('尝试执行onclick事件...');
                    await this.page.evaluate((onclick) => {
                        eval(onclick);
                    }, course.clickHandler);
                    success = true;
                    console.log('✓ onclick事件执行成功');
                } catch (error) {
                    console.log('onclick事件执行失败:', error.message);
                }
            }
            
            // 方法2: 如果有URL，直接导航
            if (!success && course.url) {
                try {
                    console.log('尝试直接导航到课程URL...');
                    await this.page.goto(course.url, { 
                        waitUntil: 'networkidle',
                        timeout: 30000 
                    });
                    success = true;
                    console.log('✓ 直接导航成功');
                } catch (error) {
                    console.log('直接导航失败:', error.message);
                }
            }
            
            // 方法3: 尝试点击课程元素
            if (!success && course.element) {
                try {
                    console.log('尝试点击课程元素...');
                    success = await this.selectors.smartClick(this.page, course.element);
                    if (success) {
                        console.log('✓ 课程元素点击成功');
                    }
                } catch (error) {
                    console.log('课程元素点击失败:', error.message);
                }
            }
            
            if (!success) {
                throw new Error('所有进入课程的方法都失败了');
            }
            
            // 等待页面加载
            await this.page.waitForLoadState('networkidle');
            await this.utils.randomDelay(3000, 5000);
            
            // 验证是否成功进入课程
            const currentUrl = this.page.url();
            const currentTitle = await this.page.title();
            
            console.log(`✅ 成功进入课程: ${currentTitle}`);
            console.log(`当前URL: ${currentUrl}`);
            
            return true;
            
        } catch (error) {
            console.error(`❌ 进入课程失败: ${course.title}`, error);
            
            // 调试截图
            try {
                await this.page.screenshot({ 
                    path: `debug-enter-course-${course.index}.png`,
                    fullPage: true 
                });
                console.log(`已保存调试截图: debug-enter-course-${course.index}.png`);
            } catch (screenshotError) {
                console.log('无法保存调试截图:', screenshotError.message);
            }
            
            return false;
        }
    }

    /**
     * 学习单个章节
     */
    async studyChapter(chapter) {
        try {
            console.log(`   -> 正在点击章节: ${chapter.name}`);
            const frame = this.page.frameLocator('#frame_content');
            const chapterSelector = `#${chapter.id}`;

            // 点击章节元素
            await frame.locator(chapterSelector).click();
            await this.page.waitForTimeout(3000); // 等待页面响应
            await this.page.waitForLoadState('networkidle');
            
            // 查找视频章节
            const videoSections = await this.findVideoSections();
            console.log(`📹 发现 ${videoSections.length} 个视频章节`);
            
            for (const section of videoSections) {
                if (!this.isRunning) break;
                
                await this.studyVideoSection(section);
                
                // 检查验证码
                await this.antiDetection.handleCaptcha();
                
                // 章节间休息
                await this.durationController.smartWait(30000, 0.3);
            }
            
        } catch (error) {
            console.error(`❌ 学习章节 ${chapter.name} 出错:`, error);
        }
    }

    /**
     * 查找视频章节
     */
    async findVideoSections() {
        try {
            console.log('🎬 开始查找视频章节...');
            
            // 等待页面加载完成
            await this.page.waitForLoadState('networkidle');
            await this.utils.randomDelay(2000, 4000);
            
            // 获取视频章节选择器
            const containerSelectors = this.realSelectors.getSelectors('videoSections', 'container');
            const sectionSelectors = this.realSelectors.getSelectors('videoSections', 'sectionItem');
            const titleSelectors = this.realSelectors.getSelectors('videoSections', 'sectionTitle');
            const linkSelectors = this.realSelectors.getSelectors('videoSections', 'sectionLink');
            const videoIconSelectors = this.realSelectors.getSelectors('videoSections', 'videoIcon');
            
            console.log('🔍 尝试查找章节容器...');
            
            // 尝试找到章节容器
            const sectionContainer = await this.realSelectors.trySelectors(
                this.page,
                containerSelectors,
                { timeout: 10000, visible: true }
            );
            
            if (sectionContainer) {
                console.log('✅ 找到章节容器');
            } else {
                console.log('⚠️ 未找到章节容器，尝试直接查找章节项');
            }
            
            // 查找所有章节项
            console.log('🔍 查找章节项...');
            const sectionItems = await this.realSelectors.trySelectorsAll(
                this.page,
                sectionSelectors,
                { minCount: 1 }
            );
            
            if (!sectionItems || sectionItems.length === 0) {
                console.log('❌ 未找到任何章节项');
                
                // 调试信息
                await this.debugPageInfo('视频章节页面');
                
                return [];
            }
            
            console.log(`✅ 找到 ${sectionItems.length} 个章节项`);
            
            // 解析视频章节信息
            const videoSections = [];
            
            for (let i = 0; i < sectionItems.length; i++) {
                try {
                    const section = sectionItems[i];
                    console.log(`🎥 解析第 ${i + 1} 个章节...`);
                    
                    // 检查是否包含视频图标
                    let hasVideoIcon = false;
                    for (const iconSelector of videoIconSelectors) {
                        try {
                            const iconElement = await section.$(iconSelector);
                            if (iconElement) {
                                hasVideoIcon = true;
                                console.log(`  🎬 发现视频图标`);
                                break;
                            }
                        } catch (error) {
                            continue;
                        }
                    }
                    
                    // 如果没有视频图标，检查文本内容是否包含视频相关关键词
                    if (!hasVideoIcon) {
                        try {
                            const sectionText = await section.textContent();
                            const videoKeywords = ['视频', 'video', '播放', '观看', '学习视频', 'mp4', 'flv'];
                            hasVideoIcon = videoKeywords.some(keyword => 
                                sectionText && sectionText.toLowerCase().includes(keyword.toLowerCase())
                            );
                            
                            if (hasVideoIcon) {
                                console.log(`  🎬 通过关键词识别为视频章节`);
                            }
                        } catch (error) {
                            console.log('  ❌ 无法获取章节文本');
                        }
                    }
                    
                    // 如果不是视频章节，跳过
                    if (!hasVideoIcon) {
                        console.log(`  ⏭️ 非视频章节，跳过`);
                        continue;
                    }
                    
                    // 获取章节标题
                    let sectionTitle = '';
                    
                    // 在章节内查找标题
                    for (const titleSelector of titleSelectors) {
                        try {
                            const titleElement = await section.$(titleSelector);
                            if (titleElement) {
                                const text = await titleElement.textContent();
                                if (text && text.trim()) {
                                    sectionTitle = text.trim();
                                    console.log(`  📝 标题: ${sectionTitle}`);
                                    break;
                                }
                            }
                        } catch (error) {
                            continue;
                        }
                    }
                    
                    // 如果在章节内没找到标题，尝试章节本身的文本
                    if (!sectionTitle) {
                        try {
                            const sectionText = await section.textContent();
                            if (sectionText && sectionText.trim()) {
                                // 取前50个字符作为标题
                                sectionTitle = sectionText.trim().substring(0, 50);
                                console.log(`  📝 章节文本标题: ${sectionTitle}`);
                            }
                        } catch (error) {
                            console.log('  ❌ 无法获取章节文本');
                        }
                    }
                    
                    // 获取章节链接
                    let sectionUrl = '';
                    let clickAction = null;
                    
                    // 在章节内查找链接
                    for (const linkSelector of linkSelectors) {
                        try {
                            const linkElement = await section.$(linkSelector);
                            if (linkElement) {
                                // 尝试获取href属性
                                const href = await linkElement.getAttribute('href');
                                if (href && href !== '#' && href !== 'javascript:void(0)') {
                                    sectionUrl = href;
                                    console.log(`  🔗 链接: ${sectionUrl}`);
                                    break;
                                }
                                
                                // 尝试获取onclick事件
                                const onclick = await linkElement.getAttribute('onclick');
                                if (onclick) {
                                    clickAction = onclick;
                                    console.log(`  🖱️ 点击事件: ${onclick.substring(0, 100)}...`);
                                    break;
                                }
                            }
                        } catch (error) {
                            continue;
                        }
                    }
                    
                    // 如果没找到链接，检查章节本身是否可点击
                    if (!sectionUrl && !clickAction) {
                        try {
                            const sectionHref = await section.getAttribute('href');
                            const sectionOnclick = await section.getAttribute('onclick');
                            
                            if (sectionHref && sectionHref !== '#') {
                                sectionUrl = sectionHref;
                                console.log(`  🔗 章节链接: ${sectionUrl}`);
                            } else if (sectionOnclick) {
                                clickAction = sectionOnclick;
                                console.log(`  🖱️ 章节点击事件: ${sectionOnclick.substring(0, 100)}...`);
                            }
                        } catch (error) {
                            console.log('  ❌ 无法获取章节链接信息');
                        }
                    }
                    
                    // 检查章节状态（是否已完成）
                    let isCompleted = false;
                    try {
                        const completedIndicators = [
                            '.completed', '.finished', '.done', 
                            '[class*="complete"]', '[class*="finish"]',
                            '.icon-check', '.checkmark'
                        ];
                        
                        for (const indicator of completedIndicators) {
                            const completedElement = await section.$(indicator);
                            if (completedElement) {
                                isCompleted = true;
                                console.log(`  ✅ 章节已完成`);
                                break;
                            }
                        }
                    } catch (error) {
                        // 忽略状态检查错误
                    }
                    
                    // 如果有有效的章节信息，添加到列表
                    if (sectionTitle && (sectionUrl || clickAction)) {
                        const sectionInfo = {
                            title: sectionTitle,
                            url: sectionUrl,
                            clickAction: clickAction,
                            element: section,
                            index: i,
                            isCompleted: isCompleted,
                            isVideo: true
                        };
                        
                        videoSections.push(sectionInfo);
                        console.log(`  ✅ 视频章节信息已添加`);
                    } else {
                        console.log(`  ⚠️ 章节信息不完整，跳过`);
                    }
                    
                } catch (error) {
                    console.error(`解析第 ${i + 1} 个章节失败:`, error);
                    continue;
                }
            }
            
            console.log(`📊 总共解析出 ${videoSections.length} 个视频章节`);
            
            if (videoSections.length === 0) {
                console.log('❌ 没有找到有效的视频章节');
                await this.debugPageInfo('视频章节解析结果');
            }
            
            return videoSections;
            
        } catch (error) {
            console.error('❌ 查找视频章节失败:', error);
            
            // 保存错误截图
            try {
                await this.page.screenshot({ 
                    path: `debug-video-sections-error-${Date.now()}.png`,
                    fullPage: true 
                });
                console.log('📸 已保存错误截图');
            } catch (screenshotError) {
                console.error('保存截图失败:', screenshotError);
            }
            
            return [];
        }
    }

    /**
     * 学习视频章节
     */
    async studyVideoSection(section) {
        try {
            console.log(`▶️ 开始学习视频: ${section.title}`);
            
            // 应用反检测措施
            await this.antiDetection.simulateHumanBehavior(this.page);
            
            // 智能点击进入视频
            let success = false;
            
            // 方法1: 如果有onclick事件，尝试执行
            if (section.onclick) {
                try {
                    console.log('尝试执行视频onclick事件...');
                    await this.page.evaluate((onclick) => {
                        eval(onclick);
                    }, section.onclick);
                    success = true;
                    console.log('✓ 视频onclick事件执行成功');
                } catch (error) {
                    console.log('视频onclick事件执行失败:', error.message);
                }
            }
            
            // 方法2: 尝试点击视频元素
            if (!success && section.element) {
                try {
                    console.log('尝试点击视频元素...');
                    await section.element.click();
                    success = true;
                    console.log('✓ 视频元素点击成功');
                } catch (error) {
                    console.log('视频元素点击失败:', error.message);
                }
            }
            
            if (!success) {
                throw new Error('所有进入视频的方法都失败了');
            }
            
            // 等待页面加载
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(3000);
            
            // 查找并点击播放按钮
            const playButtonSelectors = [
                'button[class*="play"]',
                '.play-btn',
                '.video-play',
                'button[aria-label*="play"]',
                '.control-play'
            ];
            
            let playButton = null;
            for (const selector of playButtonSelectors) {
                try {
                    playButton = await this.page.$(selector);
                    if (playButton) {
                        console.log(`找到播放按钮: ${selector}`);
                        break;
                    }
                } catch (error) {
                    continue;
                }
            }
            
            if (playButton) {
                console.log('点击播放按钮...');
                await playButton.click();
                await this.page.waitForTimeout(2000);
                console.log('✓ 播放按钮点击成功');
            } else {
                console.log('未找到播放按钮，视频可能已自动播放');
            }
            
            // 获取视频时长
            const videoDuration = await this.getVideoDuration();
            
            console.log(`视频时长: ${videoDuration / 1000}秒`);
            
            // 计算学习时长
            const studyPlan = this.durationController.calculateVideoDuration(videoDuration);
            
            // 开始智能学习
            await this.intelligentVideoStudy(studyPlan);
            
            console.log(`✅ 视频学习完成: ${section.title}`);
            
        } catch (error) {
            console.error(`❌ 学习视频章节出错:`, error);
            
            // 调试截图
            try {
                await this.page.screenshot({ 
                    path: `debug-study-video-${section.index}.png`,
                    fullPage: true 
                });
                console.log(`已保存调试截图: debug-study-video-${section.index}.png`);
            } catch (screenshotError) {
                console.log('无法保存调试截图:', screenshotError.message);
            }
        }
    }

    /**
     * 智能视频学习
     */
    async intelligentVideoStudy(studyPlan) {
        console.log('🧠 开始智能视频学习...');
        console.log(`学习计划:`, studyPlan);
        
        const startTime = Date.now();
        let currentProgress = 0;
        
        try {
            // 模拟观看过程
            for (let i = 0; i < studyPlan.segments.length; i++) {
                const segment = studyPlan.segments[i];
                console.log(`📺 观看片段 ${i + 1}/${studyPlan.segments.length}: ${segment.duration}秒`);
                
                // 应用反检测措施
                await this.antiDetection.simulateHumanBehavior(this.page);
                
                // 模拟观看行为
                await this.simulateWatchingBehavior(segment);
                
                // 检查是否有弹窗或任务点
                await this.handlePopupsAndTasks();
                
                // 更新进度
                currentProgress += segment.duration;
                const progressPercent = Math.min((currentProgress / studyPlan.totalDuration) * 100, 100);
                console.log(`📊 学习进度: ${progressPercent.toFixed(1)}%`);
                
                // 随机暂停和互动
                if (Math.random() < 0.3) { // 30%概率暂停
                    console.log('⏸️ 模拟暂停思考...');
                    await this.durationController.smartWait(2000 + Math.random() * 6000);
                    
                    // 模拟滚动或鼠标移动
                    await this.antiDetection.simulateMouseMovement(this.page);
                }
                
                // 段间休息
                if (i < studyPlan.segments.length - 1) {
                    await this.durationController.smartWait(1000 + Math.random() * 2000);
                }
            }
            
            // 等待视频完成
            console.log('⏳ 等待视频播放完成...');
            await this.waitForVideoCompletion();
            
            const totalTime = Date.now() - startTime;
            console.log(`✅ 智能学习完成，总耗时: ${Math.round(totalTime / 1000)}秒`);
            
        } catch (error) {
            console.error('❌ 智能视频学习过程中出错:', error);
            throw error;
        }
    }
    
    /**
     * 模拟观看行为
     */
    async simulateWatchingBehavior(segment) {
        const behaviors = [
            // 模拟鼠标移动
            async () => {
                await this.antiDetection.simulateMouseMovement(this.page);
            },
            // 模拟滚动
            async () => {
                await this.page.mouse.wheel(0, Math.random() * 200 - 100);
            },
            // 模拟键盘交互
            async () => {
                if (Math.random() < 0.1) { // 10%概率按空格键
                    await this.page.keyboard.press('Space');
                    await this.durationController.smartWait(500 + Math.random() * 1000);
                    await this.page.keyboard.press('Space');
                }
            },
            // 模拟点击视频区域
            async () => {
                try {
                    const videoElement = await this.selectors.trySelectors(this.page, [
                        'video',
                        '.video-player',
                        '.player-container'
                    ]);
                    if (videoElement) {
                        const box = await videoElement.boundingBox();
                        if (box) {
                            await this.page.mouse.click(
                                box.x + box.width * 0.5,
                                box.y + box.height * 0.5
                            );
                        }
                    }
                } catch (error) {
                    // 忽略点击错误
                }
            }
        ];
        
        // 随机执行1-2个行为
        const numBehaviors = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numBehaviors; i++) {
            const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
            try {
                await behavior();
                await this.durationController.smartWait(500 + Math.random() * 1500);
            } catch (error) {
                // 忽略行为执行错误
            }
        }
        
        // 等待片段时间
        await this.durationController.smartWait(segment.duration * 1000 * 0.8 + Math.random() * segment.duration * 1000 * 0.4);
    }
    
    /**
     * 处理弹窗和任务点
     */
    async handlePopupsAndTasks() {
        try {
            // 检查并处理各种弹窗
            const popupSelectors = [
                '.layui-layer-dialog',
                '.el-dialog',
                '.modal',
                '.popup',
                '[class*="dialog"]',
                '[class*="modal"]'
            ];
            
            for (const selector of popupSelectors) {
                const popup = await this.page.$(selector);
                if (popup) {
                    console.log(`发现弹窗: ${selector}`);
                    
                    // 尝试找到确认按钮
                    const confirmButtons = [
                        '.layui-layer-btn0',
                        '.el-button--primary',
                        'button[class*="confirm"]',
                        'button[class*="ok"]',
                        '.btn-primary'
                    ];
                    
                    for (const btnSelector of confirmButtons) {
                        const button = await popup.$(btnSelector);
                        if (button) {
                            console.log('点击确认按钮...');
                            await button.click();
                            await this.durationController.smartWait(1000 + Math.random() * 1000);
                            break;
                        }
                    }
                }
            }
            
            // 检查任务点
            const taskPoints = await this.page.$$('[class*="task"], [class*="point"]');
            for (const taskPoint of taskPoints) {
                try {
                    const isVisible = await taskPoint.isVisible();
                    if (isVisible) {
                        console.log('发现任务点，尝试处理...');
                        await taskPoint.click();
                        await this.durationController.smartWait(1000 + Math.random() * 2000);
                    }
                } catch (error) {
                    // 忽略任务点处理错误
                }
            }
            
        } catch (error) {
            console.log('处理弹窗和任务点时出错:', error.message);
        }
    }
    
    /**
     * 等待视频完成
     */
    async waitForVideoCompletion() {
        const maxWaitTime = 300000; // 最大等待5分钟
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            try {
                // 检查视频是否结束
                const isEnded = await this.page.evaluate(() => {
                    const video = document.querySelector('video');
                    return video ? video.ended : false;
                });
                
                if (isEnded) {
                    console.log('✓ 视频播放完成');
                    return true;
                }
                
                // 检查进度条是否到达100%
                const progress = await this.page.evaluate(() => {
                    const progressBar = document.querySelector('[class*="progress"]');
                    if (progressBar) {
                        const style = window.getComputedStyle(progressBar);
                        const width = style.width;
                        if (width && width.includes('100%')) {
                            return 100;
                        }
                    }
                    return 0;
                });
                
                if (progress >= 100) {
                    console.log('✓ 进度条显示完成');
                    return true;
                }
                
                // 检查是否有"下一个"或"继续"按钮出现
                const nextButton = await this.selectors.trySelectors(this.page, [
                    'button[class*="next"]',
                    'button[class*="continue"]',
                    '.btn-next',
                    '.continue-btn'
                ]);
                
                if (nextButton) {
                    console.log('✓ 发现继续按钮，视频可能已完成');
                    return true;
                }
                
                await this.durationController.smartWait(5000 + Math.random() * 5000);
                
            } catch (error) {
                console.log('检查视频完成状态时出错:', error.message);
                await this.durationController.smartWait(5000 + Math.random() * 5000);
            }
        }
        
        console.log('⚠️ 等待视频完成超时');
        return false;
    }

    /**
     * 停止机器人
     */
    async stop() {
        console.log('🛑 停止自动化脚本...');
        this.isRunning = false;
        
        if (this.antiDetection) {
            this.antiDetection.pause();
        }
        
        await this.cleanup();
    }

    /**
     * 获取视频时长
     */
    async getVideoDuration() {
        try {
            // 方法1: 从video元素获取
            const videoDuration = await this.page.evaluate(() => {
                const video = document.querySelector('video');
                if (video && video.duration && !isNaN(video.duration)) {
                    return video.duration * 1000; // 转换为毫秒
                }
                return null;
            });
            
            if (videoDuration) {
                console.log(`✓ 从video元素获取时长: ${Math.round(videoDuration / 1000)}秒`);
                return videoDuration;
            }
            
            // 方法2: 从时长显示元素获取
            const durationSelectors = [
                '.duration',
                '.time-total',
                '.video-duration',
                '[class*="duration"]',
                '[class*="time"]'
            ];
            
            for (const selector of durationSelectors) {
                try {
                    const element = await this.page.$(selector);
                    if (element) {
                        const text = await element.textContent();
                        if (text && text.includes(':')) {
                            const duration = this.parseTimeToSeconds(text) * 1000;
                            if (duration > 0) {
                                console.log(`✓ 从时长元素获取时长: ${Math.round(duration / 1000)}秒`);
                                return duration;
                            }
                        }
                    }
                } catch (error) {
                    continue;
                }
            }
            
            // 方法3: 从页面数据获取
            const pageData = await this.page.evaluate(() => {
                // 尝试从全局变量获取
                if (window.videoData && window.videoData.duration) {
                    return window.videoData.duration * 1000;
                }
                
                // 尝试从其他可能的数据源获取
                const scripts = document.querySelectorAll('script');
                for (const script of scripts) {
                    const content = script.textContent;
                    if (content && content.includes('duration')) {
                        const match = content.match(/duration['":\s]*(\d+)/);
                        if (match) {
                            return parseInt(match[1]) * 1000;
                        }
                    }
                }
                
                return null;
            });
            
            if (pageData) {
                console.log(`✓ 从页面数据获取时长: ${Math.round(pageData / 1000)}秒`);
                return pageData;
            }
            
            // 默认时长
            console.log('⚠️ 无法获取视频时长，使用默认值: 600秒');
            return 600000; // 10分钟
            
        } catch (error) {
            console.error('获取视频时长失败:', error);
            return 600000; // 默认10分钟
        }
    }
    
    /**
     * 清理资源
     */
    async cleanup() {
        try {
            if (this.browser) {
                await this.browser.close();
            }
            console.log('🧹 资源清理完成');
        } catch (error) {
            console.error('清理资源出错:', error);
        }
    }
    
    /**
     * 保存学习进度
     */
    async saveProgress() {
        try {
            const progress = {
                timestamp: new Date().toISOString(),
                completedCourses: this.completedCourses || [],
                currentCourse: this.currentCourse || null,
                totalStudyTime: this.totalStudyTime || 0
            };
            
            // 这里可以保存到文件或数据库
            console.log('📊 学习进度:', progress);
            
        } catch (error) {
            console.error('保存进度失败:', error);
        }
    }

    /**
     * 调试页面信息
     */
    async debugPageInfo(context = '页面调试') {
        try {
            console.log(`🔍 ${context} - 开始调试...`);
            
            const url = this.page.url();
            const title = await this.page.title();
            console.log(`📄 当前页面: ${title}`);
            console.log(`🔗 页面URL: ${url}`);
            
            // 获取页面基本信息
            const pageInfo = await this.page.evaluate(() => {
                return {
                    documentReady: document.readyState,
                    bodyExists: !!document.body,
                    totalElements: document.querySelectorAll('*').length,
                    visibleElements: document.querySelectorAll('*:not([style*="display: none"]):not([style*="visibility: hidden"])').length,
                    scripts: document.scripts.length,
                    links: document.links.length,
                    forms: document.forms.length
                };
            });
            
            console.log(`📊 页面统计:`, pageInfo);
            
            // 尝试查找常见的容器元素
            const commonSelectors = [
                'body', 'main', '.container', '.content', '.wrapper',
                '#app', '#root', '.app', '.main-content',
                '.course-list', '.video-list', '.chapter-list',
                '[class*="course"]', '[class*="video"]', '[class*="chapter"]'
            ];
            
            console.log('🔍 检查常见容器元素:');
            for (const selector of commonSelectors) {
                try {
                    const elements = await this.page.$$(selector);
                    if (elements.length > 0) {
                        console.log(`  ✅ ${selector}: ${elements.length} 个元素`);
                    }
                } catch (error) {
                    // 忽略选择器错误
                }
            }
            
            // 保存调试截图
            try {
                const timestamp = Date.now();
                await this.page.screenshot({ 
                    path: `debug-${context.replace(/\s+/g, '-')}-${timestamp}.png`,
                    fullPage: true 
                });
                console.log(`📸 已保存调试截图: debug-${context.replace(/\s+/g, '-')}-${timestamp}.png`);
            } catch (screenshotError) {
                console.error('保存截图失败:', screenshotError);
            }
            
        } catch (error) {
            console.error('调试页面信息失败:', error);
        }
    }

    /**
     * 智能点击元素
     */
    async smartClick(element, options = {}) {
        try {
            const { 
                waitForNavigation = true, 
                timeout = 30000,
                retries = 3,
                humanLike = true 
            } = options;
            
            console.log('🖱️ 准备智能点击...');
            
            // 确保元素可见
            await element.scrollIntoViewIfNeeded();
            await this.utils.randomDelay(500, 1000);
            
            // 等待元素可点击
            await element.waitForElementState('visible', { timeout: 5000 });
            
            if (humanLike) {
                // 模拟人类点击行为
                await this.antiDetection.simulateMouseMovement(this.page);
                await this.utils.randomDelay(200, 500);
            }
            
            let success = false;
            let lastError = null;
            
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    console.log(`🖱️ 点击尝试 ${attempt}/${retries}...`);
                    
                    if (waitForNavigation) {
                        // 等待导航完成
                        await Promise.all([
                            this.page.waitForLoadState('networkidle', { timeout }),
                            element.click()
                        ]);
                    } else {
                        await element.click();
                    }
                    
                    success = true;
                    console.log('✅ 点击成功');
                    break;
                    
                } catch (error) {
                    lastError = error;
                    console.log(`❌ 点击尝试 ${attempt} 失败:`, error.message);
                    
                    if (attempt < retries) {
                        await this.utils.randomDelay(1000, 2000);
                    }
                }
            }
            
            if (!success) {
                throw new Error(`智能点击失败，已尝试 ${retries} 次。最后错误: ${lastError?.message}`);
            }
            
            // 点击后等待
            if (humanLike) {
                await this.utils.randomDelay(1000, 2000);
            }
            
            return true;
            
        } catch (error) {
            console.error('智能点击失败:', error);
            throw error;
        }
    }

    /**
     * 智能导航到课程
     */
    async navigateToCourse(course) {
        try {
            console.log(`🚀 导航到课程: ${course.title}`);
            
            if (course.url && course.url !== '#') {
                // 直接导航到URL
                console.log('🔗 使用URL导航...');
                await this.page.goto(course.url, { 
                    waitUntil: 'networkidle',
                    timeout: 30000 
                });
            } else if (course.element) {
                // 点击元素
                console.log('🖱️ 点击课程元素...');
                await this.smartClick(course.element, {
                    waitForNavigation: true,
                    humanLike: true
                });
            } else if (course.clickAction) {
                // 执行点击动作
                console.log('⚡ 执行点击动作...');
                await this.page.evaluate((action) => {
                    eval(action);
                }, course.clickAction);
                
                await this.page.waitForLoadState('networkidle', { timeout: 30000 });
            } else {
                throw new Error('无法确定导航方式');
            }
            
            console.log('✅ 课程导航完成');
            return true;
            
        } catch (error) {
            console.error(`❌ 导航到课程失败: ${course.title}`, error);
            throw error;
        }
    }

    /**
     * 智能导航到视频章节
     */
    async navigateToVideoSection(section) {
        try {
            console.log(`🎬 导航到视频章节: ${section.title}`);
            
            if (section.url && section.url !== '#') {
                // 直接导航到URL
                console.log('🔗 使用URL导航...');
                await this.page.goto(section.url, { 
                    waitUntil: 'networkidle',
                    timeout: 30000 
                });
            } else if (section.element) {
                // 点击元素
                console.log('🖱️ 点击章节元素...');
                await this.smartClick(section.element, {
                    waitForNavigation: true,
                    humanLike: true
                });
            } else if (section.clickAction) {
                // 执行点击动作
                console.log('⚡ 执行点击动作...');
                await this.page.evaluate((action) => {
                    eval(action);
                }, section.clickAction);
                
                await this.page.waitForLoadState('networkidle', { timeout: 30000 });
            } else {
                throw new Error('无法确定导航方式');
            }
            
            console.log('✅ 视频章节导航完成');
            return true;
            
        } catch (error) {
            console.error(`❌ 导航到视频章节失败: ${section.title}`, error);
            throw error;
        }
    }
}

// 启动脚本
(async () => {
    const bot = new XuexitongBot();
    
    // 处理退出信号
    process.on('SIGINT', async () => {
        console.log('\n收到退出信号...');
        await bot.stop();
        process.exit(0);
    });
    
    try {
        await bot.start();
    } catch (error) {
        console.error('脚本运行出错:', error);
        await bot.cleanup();
    }
})();

console.log('脚本主逻辑正在运行...');
