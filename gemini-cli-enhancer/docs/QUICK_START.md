# 快速开始指南

## 🚀 5分钟快速上手

### 第一步：安装和构建
```bash
# 1. 安装依赖
npm install

# 2. 安装浏览器驱动
npm run install:browsers

# 3. 构建项目
npm run build
```

### 第二步：解决 Context7 连接问题
```bash
# 运行 Context7 修复工具
npm run gemini-enhancer fix-context7
```

这个命令会：
- ✅ 检查 Context7 API 密钥配置
- ✅ 验证网络连接
- ✅ 清理缓存文件
- ✅ 重启 MCP 服务
- ✅ 测试连接状态

### 第三步：体验核心功能

#### 🌐 浏览器控制
```bash
# 启动交互式浏览器（推荐新手）
npm run gemini-enhancer browser

# 访问指定网站并截图
npm run gemini-enhancer browser --url "https://github.com" --screenshot
```

#### 📋 任务规划
```bash
# 创建你的第一个任务计划
npm run gemini-enhancer plan create --name "我的第一个项目"

# 使用预设模板快速开始
npm run gemini-enhancer plan template --type "web_automation"
```

#### 🔧 MCP 诊断
```bash
# 全面诊断 MCP 连接
npm run gemini-enhancer mcp diagnose

# 查看所有配置的服务器
npm run gemini-enhancer mcp list
```

## 🎯 常用场景示例

### 场景1：网页数据抓取
```bash
# 1. 启动浏览器
npm run gemini-enhancer browser --url "https://example.com"

# 2. 在浏览器中执行操作（会打开交互式界面）
# - 点击元素
# - 填写表单
# - 提取数据

# 3. 保存结果
npm run gemini-enhancer browser --screenshot --output "result.png"
```

### 场景2：项目任务管理
```bash
# 1. 创建项目计划
npm run gemini-enhancer plan create --name "网站重构项目"

# 2. 添加任务
npm run gemini-enhancer plan add --title "设计新界面" --priority "high"
npm run gemini-enhancer plan add --title "重构后端API" --priority "medium"

# 3. 查看进度
npm run gemini-enhancer plan view

# 4. 更新任务状态
npm run gemini-enhancer plan update --id "task_1" --status "in_progress"
```

### 场景3：MCP 服务器管理
```bash
# 1. 检查当前状态
npm run gemini-enhancer mcp list

# 2. 测试特定服务器
npm run gemini-enhancer mcp test --server "context7"

# 3. 如果有问题，运行修复
npm run gemini-enhancer fix-context7
```

## ⚡ 高效使用技巧

### 1. 使用别名简化命令
在你的 `.bashrc` 或 `.zshrc` 中添加：
```bash
alias gce="npm run gemini-enhancer"
alias gce-browser="npm run gemini-enhancer browser"
alias gce-plan="npm run gemini-enhancer plan"
alias gce-fix="npm run gemini-enhancer fix-context7"
```

然后你就可以使用：
```bash
gce-browser --url "https://github.com"
gce-plan view
gce-fix
```

### 2. 创建常用脚本
在项目根目录创建 `scripts/` 文件夹，保存常用的自动化脚本：

```javascript
// scripts/github-search.js
module.exports = async (page) => {
  await page.goto('https://github.com/search');
  await page.fill('[placeholder="Search GitHub"]', 'gemini cli');
  await page.press('[placeholder="Search GitHub"]', 'Enter');
  await page.waitForSelector('.repo-list-item');
  
  const results = await page.$$eval('.repo-list-item', items => 
    items.slice(0, 5).map(item => ({
      name: item.querySelector('h3 a').textContent,
      description: item.querySelector('p')?.textContent || '',
      stars: item.querySelector('[aria-label*="star"]')?.textContent || '0'
    }))
  );
  
  console.log('搜索结果:', JSON.stringify(results, null, 2));
};
```

运行脚本：
```bash
npm run gemini-enhancer browser --script "scripts/github-search.js"
```

### 3. 使用环境变量
创建 `.env` 文件：
```bash
CONTEXT7_API_KEY=your_api_key_here
BROWSER_HEADLESS=false
DEFAULT_TIMEOUT=30000
```

### 4. 配置开发模式
```bash
# 启动开发模式（自动重新加载）
npm run dev

# 在另一个终端中测试
npm run gemini-enhancer browser
```

## 🔍 故障排除快速指南

### 问题1：Context7 仍然无法连接
```bash
# 1. 检查 API 密钥
echo $CONTEXT7_API_KEY

# 2. 测试网络连接
curl -I https://api.context7.ai/health

# 3. 重新运行修复工具
npm run gemini-enhancer fix-context7 --force

# 4. 手动重启 Gemini CLI
gemini /mcp desc
```

### 问题2：浏览器无法启动
```bash
# 1. 重新安装浏览器
npm run install:browsers

# 2. 检查系统依赖
npx playwright install-deps

# 3. 尝试不同浏览器
npm run gemini-enhancer browser --browser firefox
```

### 问题3：构建失败
```bash
# 1. 清理缓存
npm run clean

# 2. 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 3. 重新构建
npm run build
```

## 📞 获取帮助

- 📖 查看完整文档：[README.md](../README.md)
- 🐛 报告问题：创建 GitHub Issue
- 💬 社区讨论：加入我们的讨论区
- 📧 直接联系：通过邮件获取支持

---

**现在你已经准备好使用 Gemini CLI Enhancer 了！** 🎉

下一步建议：
1. 尝试修复 Context7 连接
2. 体验浏览器自动化功能
3. 创建你的第一个任务计划
4. 探索更多高级功能