/**
 * 智能时长控制模块
 * 用于管理学习时长，避免异常的学习速度被检测
 */

class DurationController {
    constructor() {
        this.courseProgress = new Map();
        this.sessionStartTime = Date.now();
        this.totalStudyTime = 0;
        this.isStudying = false;
        this.currentCourse = null;
    }

    /**
     * 开始学习会话
     */
    startStudySession(courseId, courseName) {
        this.currentCourse = {
            id: courseId,
            name: courseName,
            startTime: Date.now(),
            expectedDuration: 0,
            actualDuration: 0
        };
        
        this.isStudying = true;
        console.log(`📚 开始学习课程: ${courseName}`);
        
        // 初始化课程进度
        if (!this.courseProgress.has(courseId)) {
            this.courseProgress.set(courseId, {
                totalTime: 0,
                completedSections: 0,
                lastStudyTime: Date.now(),
                studyPattern: this.generateStudyPattern()
            });
        }
    }

    /**
     * 生成学习模式
     */
    generateStudyPattern() {
        return {
            // 每日学习时长范围 (分钟)
            dailyMinTime: 30,
            dailyMaxTime: 180,
            
            // 单次学习时长范围 (分钟)
            sessionMinTime: 15,
            sessionMaxTime: 60,
            
            // 休息间隔范围 (分钟)
            breakMinTime: 5,
            breakMaxTime: 20,
            
            // 学习速度系数 (0.8-1.2倍正常速度)
            speedFactor: 0.8 + Math.random() * 0.4,
            
            // 专注度模拟 (影响暂停频率)
            focusLevel: 0.7 + Math.random() * 0.3
        };
    }

    /**
     * 计算视频学习时长
     */
    calculateVideoDuration(videoLength) {
        const progress = this.courseProgress.get(this.currentCourse.id);
        const pattern = progress.studyPattern;
        
        // 基础观看时长 (考虑倍速和暂停)
        let baseDuration = videoLength * pattern.speedFactor;
        
        // 添加随机暂停时间
        const pauseCount = Math.floor(videoLength / 300) + Math.floor(Math.random() * 3);
        const pauseDuration = pauseCount * (5 + Math.random() * 15) * 1000;
        
        // 添加回看时间 (模拟重点内容重复观看)
        const rewindDuration = videoLength * 0.1 * Math.random();
        
        const totalDuration = baseDuration + pauseDuration + rewindDuration;
        
        console.log(`⏱️ 视频时长: ${this.formatTime(videoLength)}`);
        console.log(`📊 预计学习时长: ${this.formatTime(totalDuration)}`);
        
        return {
            originalDuration: videoLength,
            studyDuration: totalDuration,
            pausePoints: this.generatePausePoints(videoLength, pauseCount),
            rewindPoints: this.generateRewindPoints(videoLength)
        };
    }

    /**
     * 生成暂停点
     */
    generatePausePoints(videoLength, pauseCount) {
        const points = [];
        for (let i = 0; i < pauseCount; i++) {
            const position = Math.random() * videoLength;
            const duration = (5 + Math.random() * 15) * 1000; // 5-20秒暂停
            points.push({ position, duration });
        }
        return points.sort((a, b) => a.position - b.position);
    }

    /**
     * 生成回看点
     */
    generateRewindPoints(videoLength) {
        const points = [];
        const rewindCount = Math.floor(Math.random() * 3); // 0-2次回看
        
        for (let i = 0; i < rewindCount; i++) {
            const startPos = Math.random() * videoLength * 0.8; // 前80%内容
            const endPos = startPos + (30 + Math.random() * 60); // 回看30-90秒
            points.push({ startPos, endPos });
        }
        
        return points;
    }

    /**
     * 检查学习速度是否异常
     */
    checkStudySpeed(completedTime, elapsedTime) {
        const speed = completedTime / elapsedTime;
        const normalSpeedRange = { min: 0.5, max: 2.0 };
        
        if (speed < normalSpeedRange.min || speed > normalSpeedRange.max) {
            console.log(`⚠️ 学习速度异常: ${speed.toFixed(2)}x`);
            return false;
        }
        
        return true;
    }

    /**
     * 智能等待
     */
    async smartWait(baseTime, variation = 0.3) {
        const randomFactor = 1 + (Math.random() - 0.5) * variation;
        const waitTime = baseTime * randomFactor;
        
        console.log(`⏳ 智能等待: ${this.formatTime(waitTime)}`);
        
        return new Promise(resolve => {
            setTimeout(resolve, waitTime);
        });
    }

    /**
     * 模拟学习行为
     */
    async simulateStudyBehavior(page, duration) {
        const startTime = Date.now();
        const endTime = startTime + duration;
        
        while (Date.now() < endTime) {
            // 随机活动
            const activities = [
                () => this.simulateReading(page),
                () => this.simulateNotesTaking(page),
                () => this.simulateScrolling(page),
                () => this.simulateBreak()
            ];
            
            const activity = activities[Math.floor(Math.random() * activities.length)];
            await activity();
            
            // 随机间隔
            await this.smartWait(5000 + Math.random() * 15000);
        }
    }

    /**
     * 模拟阅读行为
     */
    async simulateReading(page) {
        try {
            // 模拟眼动轨迹
            const readingPattern = [
                { x: 100, y: 200 },
                { x: 600, y: 200 },
                { x: 100, y: 250 },
                { x: 500, y: 250 }
            ];
            
            for (const point of readingPattern) {
                await page.mouse.move(point.x, point.y, { steps: 3 });
                await this.smartWait(500 + Math.random() * 1000);
            }
        } catch (error) {
            console.log('阅读模拟出错:', error.message);
        }
    }

    /**
     * 模拟记笔记
     */
    async simulateNotesTaking(page) {
        try {
            // 模拟选择文本
            if (Math.random() > 0.7) {
                await page.mouse.move(200 + Math.random() * 400, 300 + Math.random() * 200);
                await page.mouse.down();
                await page.mouse.move(300 + Math.random() * 200, 320 + Math.random() * 50, { steps: 5 });
                await page.mouse.up();
                
                // 模拟复制
                await page.keyboard.down('Control');
                await page.keyboard.press('c');
                await page.keyboard.up('Control');
            }
        } catch (error) {
            console.log('笔记模拟出错:', error.message);
        }
    }

    /**
     * 模拟滚动
     */
    async simulateScrolling(page) {
        try {
            const scrollAmount = (Math.random() - 0.5) * 300;
            await page.mouse.wheel(0, scrollAmount);
        } catch (error) {
            console.log('滚动模拟出错:', error.message);
        }
    }

    /**
     * 模拟休息
     */
    async simulateBreak() {
        const breakTime = 10000 + Math.random() * 30000; // 10-40秒休息
        console.log(`☕ 模拟休息: ${this.formatTime(breakTime)}`);
        await this.smartWait(breakTime);
    }

    /**
     * 更新学习进度
     */
    updateProgress(courseId, studyTime) {
        const progress = this.courseProgress.get(courseId);
        if (progress) {
            progress.totalTime += studyTime;
            progress.lastStudyTime = Date.now();
            
            console.log(`📈 课程进度更新: 总学习时长 ${this.formatTime(progress.totalTime)}`);
        }
    }

    /**
     * 结束学习会话
     */
    endStudySession() {
        if (this.currentCourse) {
            const sessionDuration = Date.now() - this.currentCourse.startTime;
            this.updateProgress(this.currentCourse.id, sessionDuration);
            
            console.log(`✅ 学习会话结束: ${this.currentCourse.name}`);
            console.log(`⏱️ 本次学习时长: ${this.formatTime(sessionDuration)}`);
            
            this.currentCourse = null;
        }
        
        this.isStudying = false;
    }

    /**
     * 获取学习统计
     */
    getStudyStats() {
        const stats = {
            totalCourses: this.courseProgress.size,
            totalStudyTime: 0,
            averageSessionTime: 0,
            coursesProgress: []
        };

        for (const [courseId, progress] of this.courseProgress) {
            stats.totalStudyTime += progress.totalTime;
            stats.coursesProgress.push({
                courseId,
                totalTime: progress.totalTime,
                completedSections: progress.completedSections,
                lastStudyTime: progress.lastStudyTime
            });
        }

        if (stats.totalCourses > 0) {
            stats.averageSessionTime = stats.totalStudyTime / stats.totalCourses;
        }

        return stats;
    }

    /**
     * 格式化时间显示
     */
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
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
}

module.exports = DurationController;