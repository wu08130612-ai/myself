# Gemini CLI Enhancer

一个强大的 Gemini CLI 增强工具，集成了浏览器控制、任务规划和 MCP 连接故障排除功能。

## 🚀 功能特性

### 1. 浏览器自动化控制
- 基于 Playwright 的跨浏览器支持
- 智能等待和元素定位
- 页面截图和数据提取
- 交互式浏览器操作模式

### 2. 智能任务规划
- 规范驱动开发 (Specification-Driven Development)
- 任务模板和自动化工作流
- 进度跟踪和报告生成
- YAML 格式的任务配置

### 3. MCP 连接故障排除
- Context7 连接问题诊断
- 自动化修复建议
- 网络和配置验证
- 缓存清理和服务重启

## 📦 安装和设置

### 前置要求
- Node.js 18+ 
- npm 或 yarn
- Gemini CLI (已安装)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd gemini-cli-enhancer
```

2. **安装依赖**
```bash
npm install
```

3. **安装浏览器驱动**
```bash
npm run install:browsers
```

4. **构建项目**
```bash
npm run build
```

5. **运行设置向导**
```bash
npm run gemini-enhancer setup
```

## 🎯 使用指南

### 基本命令

#### 1. 设置和初始化
```bash
# 运行完整设置向导
npm run gemini-enhancer setup

# 检查系统前置条件
npm run gemini-enhancer setup --check-only
```

#### 2. 浏览器控制
```bash
# 启动交互式浏览器模式
npm run gemini-enhancer browser

# 导航到指定页面
npm run gemini-enhancer browser --url "https://example.com"

# 执行自动化脚本
npm run gemini-enhancer browser --script "path/to/script.js"

# 截图功能
npm run gemini-enhancer browser --screenshot --output "screenshot.png"
```

#### 3. 任务规划
```bash
# 创建新的任务计划
npm run gemini-enhancer plan create --name "我的项目"

# 从模板创建任务
npm run gemini-enhancer plan template --type "web_automation"

# 查看当前任务状态
npm run gemini-enhancer plan view

# 添加新任务
npm run gemini-enhancer plan add --title "新任务" --priority "high"

# 更新任务状态
npm run gemini-enhancer plan update --id "task_id" --status "completed"

# 生成进度报告
npm run gemini-enhancer plan report
```

#### 4. MCP 故障排除
```bash
# 诊断 MCP 连接问题
npm run gemini-enhancer mcp diagnose

# 修复 Context7 连接
npm run gemini-enhancer fix-context7

# 列出所有 MCP 服务器
npm run gemini-enhancer mcp list

# 测试特定服务器连接
npm run gemini-enhancer mcp test --server "context7"
```

## 🔧 配置文件

### 1. MCP 服务器配置
创建或编辑 `~/.config/gemini-cli/settings.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "env": {
        "CONTEXT7_API_KEY": "your-api-key-here"
      }
    },
    "browser-mcp": {
      "command": "npx",
      "args": ["-y", "@browser-mcp/server"]
    }
  }
}
```

### 2. 浏览器配置
在项目根目录创建 `playwright.config.js`:

```javascript
module.exports = {
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
};
```

### 3. 任务模板配置
任务模板位于 `src/templates/task-templates.yaml`，你可以自定义模板：

```yaml
custom_workflow:
  name: "自定义工作流"
  description: "你的自定义任务流程"
  tasks:
    - id: "step1"
      title: "第一步"
      description: "描述第一步要做什么"
      priority: "high"
      status: "pending"
```

## 🛠️ 高级用法

### 1. 浏览器自动化脚本

创建自定义浏览器脚本 `scripts/my-automation.js`:

```javascript
// 示例：自动登录脚本
module.exports = async (page) => {
  await page.goto('https://example.com/login');
  await page.fill('#username', 'your-username');
  await page.fill('#password', 'your-password');
  await page.click('#login-button');
  await page.waitForNavigation();
  
  // 截图确认登录成功
  await page.screenshot({ path: 'login-success.png' });
};
```

运行脚本：
```bash
npm run gemini-enhancer browser --script "scripts/my-automation.js"
```

### 2. 自定义任务工作流

创建 YAML 任务文件 `workflows/my-workflow.yaml`:

```yaml
name: "网站数据抓取项目"
description: "抓取电商网站产品信息"
created: "2024-01-01"
tasks:
  - id: "setup_browser"
    title: "配置浏览器环境"
    description: "设置代理和用户代理"
    priority: "high"
    status: "pending"
    
  - id: "navigate_site"
    title: "访问目标网站"
    description: "导航到产品列表页面"
    priority: "high"
    status: "pending"
    
  - id: "extract_data"
    title: "提取产品数据"
    description: "抓取产品名称、价格、描述"
    priority: "medium"
    status: "pending"
```

加载工作流：
```bash
npm run gemini-enhancer plan load --file "workflows/my-workflow.yaml"
```

### 3. MCP 服务器扩展

添加自定义 MCP 服务器到配置：

```json
{
  "mcpServers": {
    "my-custom-server": {
      "command": "node",
      "args": ["path/to/my-server.js"],
      "env": {
        "API_KEY": "your-key",
        "DEBUG": "true"
      }
    }
  }
}
```

## 🔍 故障排除

### 常见问题

#### 1. Context7 连接失败
```bash
# 运行诊断
npm run gemini-enhancer fix-context7

# 手动检查步骤
curl -I https://api.context7.ai/health
echo $CONTEXT7_API_KEY
```

#### 2. 浏览器启动失败
```bash
# 重新安装浏览器
npm run install:browsers

# 检查系统依赖
npx playwright install-deps
```

#### 3. TypeScript 编译错误
```bash
# 清理并重新构建
npm run clean
npm run build

# 检查类型错误
npx tsc --noEmit
```

### 日志和调试

启用详细日志：
```bash
DEBUG=gemini-enhancer:* npm run gemini-enhancer <command>
```

查看构建日志：
```bash
npm run build -- --verbose
```

## 📚 API 参考

### BrowserController 类

```typescript
import { BrowserController } from './src/browser/BrowserController';

const browser = new BrowserController();

// 启动浏览器
await browser.launch({ headless: false });

// 导航页面
await browser.navigate('https://example.com');

// 查找元素
const element = await browser.findElement('#my-button');

// 执行脚本
const result = await browser.executeScript('return document.title');
```

### TaskPlanner 类

```typescript
import { TaskPlanner } from './src/planning/TaskPlanner';

const planner = new TaskPlanner();

// 创建新计划
await planner.createPlan('我的项目', '项目描述');

// 添加任务
await planner.addTask({
  id: 'task1',
  title: '任务标题',
  description: '任务描述',
  priority: 'high',
  status: 'pending'
});
```

### MCPConnector 类

```typescript
import { MCPConnector } from './src/mcp/MCPConnector';

const connector = new MCPConnector();

// 加载配置
await connector.loadConfig();

// 连接服务器
await connector.connectToServer('context7');

// 诊断问题
await connector.fixContext7();
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果你遇到问题或需要帮助：

1. 查看 [故障排除](#故障排除) 部分
2. 搜索现有的 [Issues](https://github.com/your-repo/issues)
3. 创建新的 Issue 并提供详细信息
4. 加入我们的社区讨论

---

**享受使用 Gemini CLI Enhancer！** 🎉