#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { BrowserController } from './browser/BrowserController.js';
import { TaskPlanner } from './planning/TaskPlanner.js';
import { MCPConnector } from './mcp/MCPConnector.js';
import { setupGeminiCLI } from './setup/setupGeminiCLI.js';
const program = new Command();
program
    .name('gemini-cli-enhancer')
    .description('Enhanced Gemini CLI with browser automation and task planning')
    .version('1.0.0');
program
    .command('setup')
    .description('Setup enhanced Gemini CLI with MCP tools')
    .action(async () => {
    console.log(chalk.blue('🚀 Setting up enhanced Gemini CLI...'));
    await setupGeminiCLI();
});
program
    .command('browser')
    .description('Launch browser automation interface')
    .option('-h, --headless', 'Run in headless mode')
    .option('-u, --url <url>', 'Navigate to specific URL')
    .action(async (options) => {
    console.log(chalk.green('🌐 Starting browser automation...'));
    const browser = new BrowserController();
    await browser.launch(options);
});
program
    .command('plan')
    .description('Create and manage task plans')
    .option('-f, --file <file>', 'Load plan from file')
    .option('-i, --interactive', 'Interactive planning mode')
    .action(async (options) => {
    console.log(chalk.yellow('📋 Starting task planner...'));
    const planner = new TaskPlanner();
    await planner.start(options);
});
program
    .command('mcp')
    .description('Manage MCP connections')
    .option('-l, --list', 'List available MCP servers')
    .option('-c, --connect <server>', 'Connect to MCP server')
    .action(async (options) => {
    console.log(chalk.cyan('🔌 Managing MCP connections...'));
    const connector = new MCPConnector();
    await connector.manage(options);
});
program
    .command('fix-context7')
    .description('Fix Context7 MCP connection issues')
    .action(async () => {
    console.log(chalk.red('🔧 Fixing Context7 connection...'));
    const connector = new MCPConnector();
    await connector.fixContext7();
});
program.parse();
//# sourceMappingURL=index.js.map