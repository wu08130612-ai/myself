const { task, series, parallel } = require('just-scripts');

// 清理构建目录
task('clean', () => {
  const fs = require('fs-extra');
  return fs.remove('./dist');
});

// TypeScript编译
task('build:ts', () => {
  const { spawn } = require('child_process');
  return new Promise((resolve, reject) => {
    const tsc = spawn('npx', ['tsc'], { stdio: 'inherit' });
    tsc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`TypeScript compilation failed with code ${code}`));
    });
  });
});

// 复制资源文件
task('copy:assets', () => {
  const fs = require('fs-extra');
  return Promise.all([
    fs.copy('./src/templates', './dist/templates'),
    fs.copy('./package.json', './dist/package.json')
  ]);
});

// 完整构建
task('build', series('clean', parallel('build:ts', 'copy:assets')));

// 开发模式
task('dev', () => {
  const { spawn } = require('child_process');
  const dev = spawn('npx', ['tsx', 'src/index.ts'], { stdio: 'inherit' });
  return new Promise((resolve) => {
    dev.on('close', resolve);
  });
});

// 安装Playwright浏览器
task('install:browsers', () => {
  const { spawn } = require('child_process');
  return new Promise((resolve, reject) => {
    const install = spawn('npx', ['playwright', 'install'], { stdio: 'inherit' });
    install.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Browser installation failed with code ${code}`));
    });
  });
});

// 运行测试
task('test', () => {
  const { spawn } = require('child_process');
  return new Promise((resolve, reject) => {
    const jest = spawn('npx', ['jest'], { stdio: 'inherit' });
    jest.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Tests failed with code ${code}`));
    });
  });
});

// 代码检查
task('lint', () => {
  const { spawn } = require('child_process');
  return new Promise((resolve, reject) => {
    const eslint = spawn('npx', ['eslint', 'src/**/*.ts'], { stdio: 'inherit' });
    eslint.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Linting failed with code ${code}`));
    });
  });
});

// 格式化代码
task('format', () => {
  const { spawn } = require('child_process');
  return new Promise((resolve, reject) => {
    const prettier = spawn('npx', ['prettier', '--write', 'src/**/*.ts'], { stdio: 'inherit' });
    prettier.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Formatting failed with code ${code}`));
    });
  });
});

// 完整的CI流程
task('ci', series('lint', 'build', 'test'));

// 发布准备
task('prepare', series('format', 'lint', 'build', 'test'));