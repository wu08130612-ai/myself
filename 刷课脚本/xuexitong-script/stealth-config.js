/**
 * 隐蔽配置模块
 * 提供浏览器隐蔽设置和反检测配置
 */

class StealthConfig {
    /**
     * 获取隐蔽浏览器启动参数
     */
    static getBrowserArgs() {
        return [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript-harmony-shipping',
            '--disable-client-side-phishing-detection',
            '--disable-sync',
            '--disable-default-apps',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-default-browser-check',
            '--no-pings',
            '--window-size=1366,768'
        ];
    }

    /**
     * 获取随机User-Agent列表
     */
    static getUserAgents() {
        return [
            // Chrome Windows
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
            
            // Chrome macOS
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            
            // Firefox
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
            
            // Edge
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0'
        ];
    }

    /**
     * 获取随机视口尺寸
     */
    static getRandomViewport() {
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 1440, height: 900 },
            { width: 1536, height: 864 },
            { width: 1280, height: 720 }
        ];
        
        return viewports[Math.floor(Math.random() * viewports.length)];
    }

    /**
     * 获取浏览器上下文配置
     */
    static getContextConfig() {
        const viewport = this.getRandomViewport();
        const userAgent = this.getRandomUserAgent();
        
        return {
            viewport,
            userAgent,
            locale: 'zh-CN',
            timezoneId: 'Asia/Shanghai',
            permissions: ['notifications'],
            colorScheme: 'light',
            reducedMotion: 'no-preference',
            forcedColors: 'none',
            extraHTTPHeaders: {
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            }
        };
    }

    /**
     * 获取随机User-Agent
     */
    static getRandomUserAgent() {
        const userAgents = this.getUserAgents();
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }

    /**
     * 获取代理配置
     */
    static getProxyConfig() {
        // 这里可以配置代理服务器列表
        const proxies = [
            // { server: 'http://proxy1.example.com:8080', username: 'user', password: 'pass' },
            // { server: 'http://proxy2.example.com:8080', username: 'user', password: 'pass' }
        ];
        
        if (proxies.length > 0) {
            return proxies[Math.floor(Math.random() * proxies.length)];
        }
        
        return null;
    }

    /**
     * 获取隐蔽脚本注入代码
     */
    static getStealthScript() {
        return `
            // 隐藏webdriver属性
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });

            // 重写chrome对象
            window.chrome = {
                runtime: {},
                loadTimes: function() {},
                csi: function() {},
                app: {
                    isInstalled: false,
                    InstallState: {
                        DISABLED: 'disabled',
                        INSTALLED: 'installed',
                        NOT_INSTALLED: 'not_installed'
                    },
                    RunningState: {
                        CANNOT_RUN: 'cannot_run',
                        READY_TO_RUN: 'ready_to_run',
                        RUNNING: 'running'
                    }
                }
            };

            // 重写permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
            );

            // 重写plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });

            // 重写languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['zh-CN', 'zh', 'en'],
            });

            // 重写platform
            Object.defineProperty(navigator, 'platform', {
                get: () => 'Win32',
            });

            // 重写hardwareConcurrency
            Object.defineProperty(navigator, 'hardwareConcurrency', {
                get: () => 4,
            });

            // 重写deviceMemory
            Object.defineProperty(navigator, 'deviceMemory', {
                get: () => 8,
            });

            // 重写connection
            Object.defineProperty(navigator, 'connection', {
                get: () => ({
                    effectiveType: '4g',
                    rtt: 50,
                    downlink: 10
                }),
            });

            // 重写getBattery
            if (navigator.getBattery) {
                navigator.getBattery = () => Promise.resolve({
                    charging: true,
                    chargingTime: 0,
                    dischargingTime: Infinity,
                    level: 1
                });
            }

            // 重写getGamepads
            if (navigator.getGamepads) {
                navigator.getGamepads = () => [];
            }

            // 重写mediaDevices
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                navigator.mediaDevices.enumerateDevices = () => Promise.resolve([]);
            }

            // 重写Date对象以避免时区检测
            const originalDate = Date;
            Date = class extends originalDate {
                constructor(...args) {
                    if (args.length === 0) {
                        super();
                    } else {
                        super(...args);
                    }
                }
                
                getTimezoneOffset() {
                    return -480; // UTC+8 (中国标准时间)
                }
            };

            // 重写Math.random以提供更真实的随机性
            const originalRandom = Math.random;
            Math.random = () => {
                return originalRandom() * 0.9999999 + 0.0000001;
            };

            // 隐藏自动化特征
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
            delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
        `;
    }

    /**
     * 获取网络请求拦截配置
     */
    static getNetworkInterceptConfig() {
        return {
            // 阻止的资源类型
            blockedResourceTypes: [
                'image',
                'media',
                'font',
                'texttrack',
                'object',
                'beacon',
                'csp_report',
                'imageset'
            ],
            
            // 阻止的URL模式
            blockedUrls: [
                '*google-analytics.com*',
                '*googletagmanager.com*',
                '*facebook.com*',
                '*twitter.com*',
                '*linkedin.com*',
                '*ads*',
                '*analytics*',
                '*tracking*',
                '*metrics*'
            ],
            
            // 修改的请求头
            modifiedHeaders: {
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1'
            }
        };
    }
}

module.exports = StealthConfig;