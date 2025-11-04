# 故障排除指南

## 🔧 Context7 MCP 连接问题

### 问题症状
- Gemini CLI 显示 "context7 - Disconnected"
- 无法使用 Context7 相关功能
- 连接超时或认证失败

### 解决方案

#### 1. 自动修复（推荐）
```bash
npm run gemini-enhancer fix-context7
```

这个命令会自动执行以下步骤：
- ✅ 检查 API 密钥配置
- ✅ 验证网络连接
- ✅ 清理缓存文件
- ✅ 重启 MCP 服务
- ✅ 测试连接状态

#### 2. 手动诊断步骤

**步骤 1: 检查 API 密钥**
```bash
# 检查环境变量
echo $CONTEXT7_API_KEY

# 如果为空，设置 API 密钥
export CONTEXT7_API_KEY="your-api-key-here"

# 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export CONTEXT7_API_KEY="your-api-key-here"' >> ~/.zshrc
```

**步骤 2: 验证网络连接**
```bash
# 测试 Context7 API 可达性
curl -I https://api.context7.ai/health

# 检查代理设置
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

**步骤 3: 检查 Gemini CLI 配置**
```bash
# 查看当前 MCP 配置
cat ~/.config/gemini-cli/settings.json

# 或者使用 Gemini CLI 命令
gemini /mcp desc
```

**步骤 4: 清理和重启**
```bash
# 清理 MCP 缓存
rm -rf ~/.cache/gemini-cli/mcp/

# 重启 Gemini CLI
pkill -f "gemini"
gemini
```

#### 3. 配置文件修复

如果配置文件损坏，创建新的配置：

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "env": {
        "CONTEXT7_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

保存到 `~/.config/gemini-cli/settings.json`

---

## 🌐 浏览器相关问题

### 问题1: 浏览器无法启动

**错误信息：**
```
Error: Failed to launch browser
```

**解决方案：**
```bash
# 1. 重新安装浏览器驱动
npm run install:browsers

# 2. 安装系统依赖
npx playwright install-deps

# 3. 检查系统权限
sudo xattr -r -d com.apple.quarantine /path/to/browsers

# 4. 尝试不同浏览器
npm run gemini-enhancer browser --browser firefox
```

### 问题2: 页面加载超时

**错误信息：**
```
TimeoutError: Navigation timeout of 30000ms exceeded
```

**解决方案：**
```bash
# 增加超时时间
npm run gemini-enhancer browser --timeout 60000

# 或者在代码中设置
await browser.navigate('https://example.com', { timeout: 60000 });
```

### 问题3: 元素定位失败

**错误信息：**
```
Error: Element not found: #my-button
```

**解决方案：**
```javascript
// 使用更灵活的选择器
await browser.waitForElement('#my-button', { timeout: 10000 });

// 或者使用 XPath
await browser.findElement('//button[contains(text(), "点击")]');

// 检查元素是否在 iframe 中
await browser.switchToFrame('iframe-name');
```

### 问题4: 反爬虫检测

**症状：**
- 页面显示验证码
- 被重定向到错误页面
- 请求被阻止

**解决方案：**
```javascript
// 设置真实的用户代理
const browser = new BrowserController({
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
});

// 添加随机延迟
await browser.click('#button');
await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

// 模拟人类行为
await browser.hover('#element');
await browser.click('#element', { delay: 100 });
```

---

## 📋 任务规划问题

### 问题1: 任务文件损坏

**错误信息：**
```
Error: Invalid YAML format in task file
```

**解决方案：**
```bash
# 1. 验证 YAML 格式
npm install -g js-yaml
js-yaml your-task-file.yaml

# 2. 使用备份文件
cp ~/.config/gemini-enhancer/tasks/backup/plan.yaml ~/.config/gemini-enhancer/tasks/

# 3. 重新创建任务计划
npm run gemini-enhancer plan create --name "新计划"
```

### 问题2: 任务模板加载失败

**解决方案：**
```bash
# 检查模板文件是否存在
ls -la src/templates/

# 重新生成模板
npm run build

# 手动指定模板路径
npm run gemini-enhancer plan template --type "web_automation" --template-path "./custom-templates/"
```

### 问题3: 进度报告生成失败

**解决方案：**
```bash
# 检查任务数据完整性
npm run gemini-enhancer plan validate

# 生成简化报告
npm run gemini-enhancer plan report --format json

# 清理损坏的任务数据
npm run gemini-enhancer plan cleanup
```

---

## 🔨 构建和依赖问题

### 问题1: TypeScript 编译错误

**错误信息：**
```
TS2339: Property 'xxx' does not exist on type 'yyy'
```

**解决方案：**
```bash
# 1. 清理构建缓存
npm run clean

# 2. 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 3. 检查类型定义
npx tsc --noEmit

# 4. 更新类型声明文件
npm update @types/node @types/playwright
```

### 问题2: 依赖版本冲突

**错误信息：**
```
npm ERR! peer dep missing
```

**解决方案：**
```bash
# 1. 检查依赖树
npm ls

# 2. 修复依赖
npm audit fix

# 3. 手动安装缺失的依赖
npm install missing-package@version

# 4. 使用 --legacy-peer-deps
npm install --legacy-peer-deps
```

### 问题3: 构建产物异常

**解决方案：**
```bash
# 1. 完全清理重建
npm run clean
rm -rf dist/
npm run build

# 2. 检查构建配置
cat just.config.cjs

# 3. 手动构建步骤
npx tsc
cp -r src/templates dist/
```

---

## 🌍 网络和权限问题

### 问题1: 网络连接失败

**错误信息：**
```
ENOTFOUND api.context7.ai
```

**解决方案：**
```bash
# 1. 检查 DNS 解析
nslookup api.context7.ai

# 2. 检查网络连接
ping api.context7.ai

# 3. 检查防火墙设置
sudo pfctl -sr | grep context7

# 4. 使用代理
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

### 问题2: 权限不足

**错误信息：**
```
EACCES: permission denied
```

**解决方案：**
```bash
# 1. 检查文件权限
ls -la ~/.config/gemini-cli/

# 2. 修复权限
chmod 755 ~/.config/gemini-cli/
chmod 644 ~/.config/gemini-cli/settings.json

# 3. 检查目录所有权
sudo chown -R $USER:$USER ~/.config/gemini-cli/
```

### 问题3: 端口占用

**错误信息：**
```
Error: Port 3000 is already in use
```

**解决方案：**
```bash
# 1. 查找占用端口的进程
lsof -i :3000

# 2. 终止进程
kill -9 PID

# 3. 使用不同端口
npm run dev -- --port 3001
```

---

## 🐛 调试技巧

### 1. 启用详细日志
```bash
# 启用所有调试信息
DEBUG=gemini-enhancer:* npm run gemini-enhancer browser

# 只启用特定模块的日志
DEBUG=gemini-enhancer:browser npm run gemini-enhancer browser

# 保存日志到文件
DEBUG=gemini-enhancer:* npm run gemini-enhancer browser 2>&1 | tee debug.log
```

### 2. 使用开发模式
```bash
# 启动开发模式
npm run dev

# 在另一个终端中测试
npm run gemini-enhancer browser --debug
```

### 3. 检查系统信息
```bash
# Node.js 版本
node --version

# npm 版本
npm --version

# 系统信息
uname -a

# 内存使用情况
free -h  # Linux
vm_stat  # macOS
```

### 4. 生成诊断报告
```bash
# 生成完整的系统诊断报告
npm run gemini-enhancer diagnose --full > diagnostic-report.txt
```

---

## 📞 获取帮助

### 1. 自助诊断
```bash
# 运行内置诊断工具
npm run gemini-enhancer diagnose

# 检查系统健康状态
npm run gemini-enhancer health-check
```

### 2. 收集错误信息
在报告问题时，请提供以下信息：

```bash
# 系统信息
echo "OS: $(uname -a)"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"

# 错误日志
DEBUG=gemini-enhancer:* npm run gemini-enhancer <command> 2>&1 | tail -50

# 配置信息（移除敏感信息）
cat ~/.config/gemini-cli/settings.json | jq 'del(.mcpServers[].env)'
```

### 3. 社区支持
- 📖 查看文档：[README.md](../README.md)
- 🐛 报告 Bug：创建 GitHub Issue
- 💬 讨论问题：加入社区讨论
- 📧 联系支持：发送邮件获取帮助

### 4. 紧急修复
如果遇到严重问题，可以使用紧急重置：

```bash
# 备份当前配置
cp -r ~/.config/gemini-cli ~/.config/gemini-cli.backup

# 重置到默认配置
rm -rf ~/.config/gemini-cli
npm run gemini-enhancer setup

# 如果需要，恢复备份
cp -r ~/.config/gemini-cli.backup ~/.config/gemini-cli
```

---

**记住：大多数问题都可以通过重新安装依赖和清理缓存来解决！** 🔧