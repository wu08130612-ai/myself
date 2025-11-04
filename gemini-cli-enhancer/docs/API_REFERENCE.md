# API 参考文档

## 核心类和接口

### BrowserController

浏览器控制器，提供 Playwright 的高级封装。

#### 构造函数
```typescript
constructor(options?: BrowserOptions)
```

**参数：**
- `options` (可选): 浏览器配置选项

**BrowserOptions 接口：**
```typescript
interface BrowserOptions {
  headless?: boolean;           // 是否无头模式，默认 false
  browser?: 'chromium' | 'firefox' | 'webkit';  // 浏览器类型
  viewport?: { width: number; height: number }; // 视窗大小
  timeout?: number;             // 默认超时时间（毫秒）
  userAgent?: string;           // 用户代理字符串
  proxy?: ProxySettings;        // 代理设置
}
```

#### 方法

##### launch()
启动浏览器实例。

```typescript
async launch(options?: LaunchOptions): Promise<void>
```

**示例：**
```typescript
const browser = new BrowserController();
await browser.launch({ headless: false });
```

##### navigate()
导航到指定URL。

```typescript
async navigate(url: string, options?: NavigationOptions): Promise<void>
```

**参数：**
- `url`: 目标URL
- `options`: 导航选项

**示例：**
```typescript
await browser.navigate('https://example.com', {
  waitUntil: 'networkidle',
  timeout: 30000
});
```

##### findElement()
查找页面元素。

```typescript
async findElement(selector: string, options?: FindOptions): Promise<ElementHandle | null>
```

**参数：**
- `selector`: CSS选择器或XPath
- `options`: 查找选项

**示例：**
```typescript
const button = await browser.findElement('#submit-btn');
const link = await browser.findElement('//a[contains(text(), "点击")]');
```

##### click()
点击元素。

```typescript
async click(selector: string, options?: ClickOptions): Promise<void>
```

**示例：**
```typescript
await browser.click('#login-button', { delay: 100 });
```

##### type()
在输入框中输入文本。

```typescript
async type(selector: string, text: string, options?: TypeOptions): Promise<void>
```

**示例：**
```typescript
await browser.type('#username', 'myuser', { delay: 50 });
```

##### screenshot()
截取页面截图。

```typescript
async screenshot(options?: ScreenshotOptions): Promise<Buffer>
```

**示例：**
```typescript
const screenshot = await browser.screenshot({
  path: 'page.png',
  fullPage: true
});
```

##### executeScript()
执行JavaScript代码。

```typescript
async executeScript<T = any>(script: string | Function, ...args: any[]): Promise<T>
```

**示例：**
```typescript
const title = await browser.executeScript('return document.title');
const result = await browser.executeScript((x, y) => x + y, 10, 20);
```

##### waitForElement()
等待元素出现。

```typescript
async waitForElement(selector: string, options?: WaitOptions): Promise<ElementHandle>
```

**示例：**
```typescript
await browser.waitForElement('.loading-complete', { timeout: 10000 });
```

##### close()
关闭浏览器。

```typescript
async close(): Promise<void>
```

---

### TaskPlanner

任务规划器，用于管理项目任务和工作流。

#### 构造函数
```typescript
constructor(configPath?: string)
```

**参数：**
- `configPath` (可选): 配置文件路径

#### 方法

##### createPlan()
创建新的任务计划。

```typescript
async createPlan(name: string, description?: string): Promise<TaskPlan>
```

**示例：**
```typescript
const planner = new TaskPlanner();
const plan = await planner.createPlan('网站重构', '重构现有网站架构');
```

##### loadPlan()
加载现有任务计划。

```typescript
async loadPlan(planId: string): Promise<TaskPlan | null>
```

##### addTask()
添加新任务。

```typescript
async addTask(task: TaskInput): Promise<Task>
```

**TaskInput 接口：**
```typescript
interface TaskInput {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
  dependencies?: string[];  // 依赖的任务ID
}
```

**示例：**
```typescript
await planner.addTask({
  title: '设计数据库架构',
  description: '设计用户和产品表结构',
  priority: 'high',
  tags: ['database', 'design'],
  dueDate: new Date('2024-02-01')
});
```

##### updateTask()
更新任务状态。

```typescript
async updateTask(taskId: string, updates: TaskUpdate): Promise<Task>
```

**TaskUpdate 接口：**
```typescript
interface TaskUpdate {
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress?: number;        // 0-100
  notes?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}
```

**示例：**
```typescript
await planner.updateTask('task_123', {
  status: 'in_progress',
  progress: 50,
  notes: '已完成数据库设计，开始实现'
});
```

##### generateReport()
生成进度报告。

```typescript
async generateReport(format?: 'json' | 'html' | 'markdown'): Promise<string>
```

**示例：**
```typescript
const report = await planner.generateReport('markdown');
console.log(report);
```

##### loadTemplate()
从模板创建任务。

```typescript
async loadTemplate(templateName: string, variables?: Record<string, any>): Promise<Task[]>
```

**示例：**
```typescript
const tasks = await planner.loadTemplate('web_automation', {
  targetUrl: 'https://example.com',
  dataFields: ['title', 'price', 'description']
});
```

---

### MCPConnector

MCP (Model Context Protocol) 连接器，用于管理和诊断MCP服务器。

#### 构造函数
```typescript
constructor(configPath?: string)
```

#### 方法

##### loadConfig()
加载MCP配置。

```typescript
async loadConfig(): Promise<MCPConfig>
```

##### listServers()
列出所有配置的MCP服务器。

```typescript
async listServers(): Promise<MCPServer[]>
```

**MCPServer 接口：**
```typescript
interface MCPServer {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  status: 'connected' | 'disconnected' | 'error';
  lastError?: string;
}
```

##### connectToServer()
连接到指定的MCP服务器。

```typescript
async connectToServer(serverName: string): Promise<boolean>
```

**示例：**
```typescript
const connector = new MCPConnector();
const success = await connector.connectToServer('context7');
if (success) {
  console.log('Context7 连接成功');
}
```

##### testConnection()
测试服务器连接。

```typescript
async testConnection(serverName: string): Promise<ConnectionTestResult>
```

**ConnectionTestResult 接口：**
```typescript
interface ConnectionTestResult {
  success: boolean;
  latency?: number;
  error?: string;
  serverInfo?: {
    version: string;
    capabilities: string[];
  };
}
```

##### diagnose()
诊断连接问题。

```typescript
async diagnose(serverName?: string): Promise<DiagnosticResult>
```

**DiagnosticResult 接口：**
```typescript
interface DiagnosticResult {
  server: string;
  issues: DiagnosticIssue[];
  suggestions: string[];
  autoFixAvailable: boolean;
}

interface DiagnosticIssue {
  type: 'network' | 'config' | 'auth' | 'version';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
}
```

##### fixContext7()
自动修复Context7连接问题。

```typescript
async fixContext7(): Promise<FixResult>
```

**FixResult 接口：**
```typescript
interface FixResult {
  success: boolean;
  steps: FixStep[];
  finalStatus: 'fixed' | 'partial' | 'failed';
  message: string;
}

interface FixStep {
  name: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  duration: number;
}
```

---

## 工具函数

### 文件操作

#### readConfig()
读取配置文件。

```typescript
async function readConfig<T = any>(filePath: string): Promise<T>
```

#### writeConfig()
写入配置文件。

```typescript
async function writeConfig<T = any>(filePath: string, data: T): Promise<void>
```

#### ensureDir()
确保目录存在。

```typescript
async function ensureDir(dirPath: string): Promise<void>
```

### 网络工具

#### checkUrl()
检查URL可访问性。

```typescript
async function checkUrl(url: string, timeout?: number): Promise<boolean>
```

#### downloadFile()
下载文件。

```typescript
async function downloadFile(url: string, outputPath: string): Promise<void>
```

### 日志工具

#### createLogger()
创建日志记录器。

```typescript
function createLogger(name: string, level?: 'debug' | 'info' | 'warn' | 'error'): Logger
```

**Logger 接口：**
```typescript
interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
```

---

## 事件系统

### BrowserController 事件

```typescript
browser.on('page-load', (url: string) => {
  console.log(`页面加载完成: ${url}`);
});

browser.on('error', (error: Error) => {
  console.error('浏览器错误:', error);
});

browser.on('console', (message: string, level: string) => {
  console.log(`浏览器控制台 [${level}]: ${message}`);
});
```

### TaskPlanner 事件

```typescript
planner.on('task-added', (task: Task) => {
  console.log(`新任务添加: ${task.title}`);
});

planner.on('task-updated', (task: Task, changes: TaskUpdate) => {
  console.log(`任务更新: ${task.title}`);
});

planner.on('plan-completed', (plan: TaskPlan) => {
  console.log(`计划完成: ${plan.name}`);
});
```

### MCPConnector 事件

```typescript
connector.on('server-connected', (serverName: string) => {
  console.log(`MCP服务器连接: ${serverName}`);
});

connector.on('server-disconnected', (serverName: string, reason: string) => {
  console.log(`MCP服务器断开: ${serverName}, 原因: ${reason}`);
});

connector.on('connection-error', (serverName: string, error: Error) => {
  console.error(`连接错误 [${serverName}]:`, error);
});
```

---

## 错误处理

### 自定义错误类型

```typescript
class BrowserError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'BrowserError';
  }
}

class TaskPlannerError extends Error {
  constructor(message: string, public taskId?: string) {
    super(message);
    this.name = 'TaskPlannerError';
  }
}

class MCPConnectionError extends Error {
  constructor(message: string, public serverName: string) {
    super(message);
    this.name = 'MCPConnectionError';
  }
}
```

### 错误处理示例

```typescript
try {
  await browser.navigate('https://example.com');
} catch (error) {
  if (error instanceof BrowserError) {
    console.error(`浏览器错误 [${error.code}]: ${error.message}`);
  } else {
    console.error('未知错误:', error);
  }
}
```

---

## 配置选项

### 全局配置

```typescript
interface GlobalConfig {
  browser: BrowserOptions;
  taskPlanner: TaskPlannerOptions;
  mcp: MCPOptions;
  logging: LoggingOptions;
}

interface TaskPlannerOptions {
  defaultPriority: 'low' | 'medium' | 'high';
  autoSave: boolean;
  templatePath: string;
}

interface MCPOptions {
  timeout: number;
  retryAttempts: number;
  cacheDir: string;
}

interface LoggingOptions {
  level: 'debug' | 'info' | 'warn' | 'error';
  file?: string;
  console: boolean;
}
```

### 环境变量

```bash
# 浏览器配置
BROWSER_HEADLESS=false
BROWSER_TIMEOUT=30000
BROWSER_USER_AGENT="Custom User Agent"

# MCP配置
CONTEXT7_API_KEY=your_api_key
MCP_TIMEOUT=10000
MCP_CACHE_DIR=/tmp/mcp-cache

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# 任务规划配置
TASK_AUTO_SAVE=true
TASK_TEMPLATE_PATH=./templates
```

---

这个API参考文档涵盖了Gemini CLI Enhancer的所有核心功能。如果你需要更详细的示例或特定功能的说明，请参考相应的源代码或创建Issue获取帮助。