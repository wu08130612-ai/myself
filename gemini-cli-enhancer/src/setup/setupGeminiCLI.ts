import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function setupGeminiCLI(): Promise<void> {
  console.log(chalk.blue('🚀 Enhanced Gemini CLI Setup'));
  console.log(chalk.gray('This will configure your Gemini CLI with enhanced capabilities\n'));

  try {
    // Step 1: Check prerequisites
    await checkPrerequisites();
    
    // Step 2: Setup configuration
    await setupConfiguration();
    
    // Step 3: Install MCP servers
    await installMCPServers();
    
    // Step 4: Configure browser automation
    await configureBrowserAutomation();
    
    // Step 5: Setup task planning
    await setupTaskPlanning();
    
    console.log(chalk.green('\n🎉 Setup completed successfully!'));
    console.log(chalk.blue('💡 Usage examples:'));
    console.log('   gemini-cli-enhancer browser --url https://example.com');
    console.log('   gemini-cli-enhancer plan --interactive');
    console.log('   gemini-cli-enhancer fix-context7');
    
  } catch (error) {
    console.error(chalk.red('❌ Setup failed:'), error);
    process.exit(1);
  }
}

async function checkPrerequisites(): Promise<void> {
  console.log(chalk.blue('🔍 Checking prerequisites...'));
  
  const requirements = [
    { name: 'Node.js', command: 'node --version', minVersion: '18.0.0' },
    { name: 'npm', command: 'npm --version', minVersion: '8.0.0' },
    { name: 'Gemini CLI', command: 'gemini --version', required: true }
  ];

  for (const req of requirements) {
    try {
      const { stdout } = await execAsync(req.command);
      const version = stdout.trim();
      console.log(chalk.green(`✅ ${req.name}: ${version}`));
      
      if (req.minVersion && !isVersionValid(version, req.minVersion)) {
        throw new Error(`${req.name} version ${version} is below minimum required ${req.minVersion}`);
      }
    } catch (error) {
      if (req.required) {
        console.error(chalk.red(`❌ ${req.name} is required but not found`));
        if (req.name === 'Gemini CLI') {
          console.log(chalk.yellow('💡 Install Gemini CLI first: npm install -g @google/generative-ai-cli'));
        }
        throw error;
      } else {
        console.log(chalk.yellow(`⚠️ ${req.name} not found (optional)`));
      }
    }
  }
}

function isVersionValid(current: string, minimum: string): boolean {
  const currentParts = current.replace(/[^\d.]/g, '').split('.').map(Number);
  const minimumParts = minimum.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, minimumParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const minimumPart = minimumParts[i] || 0;
    
    if (currentPart > minimumPart) return true;
    if (currentPart < minimumPart) return false;
  }
  
  return true;
}

async function setupConfiguration(): Promise<void> {
  console.log(chalk.blue('\n⚙️ Setting up configuration...'));
  
  const configDir = path.join(process.env.HOME || '', '.config', 'gemini-cli');
  const configPath = path.join(configDir, 'settings.json');
  
  await fs.ensureDir(configDir);
  
  let config: any = {};
  
  // Load existing config if it exists
  if (await fs.pathExists(configPath)) {
    try {
      config = await fs.readJson(configPath);
      console.log(chalk.green('✅ Loaded existing configuration'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ Existing config is invalid, creating new one'));
    }
  }

  // Ensure MCP servers section exists
  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  // Save updated config
  await fs.writeJson(configPath, config, { spaces: 2 });
  console.log(chalk.green(`✅ Configuration saved to ${configPath}`));
}

async function installMCPServers(): Promise<void> {
  console.log(chalk.blue('\n📦 Installing MCP servers...'));
  
  const { servers } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'servers',
      message: 'Select MCP servers to install:',
      choices: [
        { name: 'Context7 (File context management)', value: 'context7', checked: true },
        { name: 'Browser MCP (Web automation)', value: 'browser-mcp', checked: true },
        { name: 'File System MCP (File operations)', value: 'filesystem-mcp', checked: false },
        { name: 'Git MCP (Git operations)', value: 'git-mcp', checked: false }
      ]
    }
  ]);

  const configDir = path.join(process.env.HOME || '', '.config', 'gemini-cli');
  const configPath = path.join(configDir, 'settings.json');
  const config = await fs.readJson(configPath);

  for (const server of servers) {
    try {
      console.log(chalk.blue(`📦 Installing ${server}...`));
      
      switch (server) {
        case 'context7':
          config.mcpServers.context7 = {
            command: 'npx',
            args: ['-y', '@context7/mcp-server'],
            env: {}
          };
          break;
          
        case 'browser-mcp':
          config.mcpServers['browser-mcp'] = {
            command: 'npx',
            args: ['-y', '@browser-mcp/server'],
            env: {}
          };
          break;
          
        case 'filesystem-mcp':
          config.mcpServers['filesystem-mcp'] = {
            command: 'npx',
            args: ['-y', '@filesystem-mcp/server'],
            env: {}
          };
          break;
          
        case 'git-mcp':
          config.mcpServers['git-mcp'] = {
            command: 'npx',
            args: ['-y', '@git-mcp/server'],
            env: {}
          };
          break;
      }
      
      console.log(chalk.green(`✅ ${server} configured`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to install ${server}:`), error);
    }
  }

  await fs.writeJson(configPath, config, { spaces: 2 });
  console.log(chalk.green('✅ MCP servers configuration updated'));
}

async function configureBrowserAutomation(): Promise<void> {
  console.log(chalk.blue('\n🌐 Configuring browser automation...'));
  
  try {
    // Install Playwright browsers
    console.log(chalk.blue('📦 Installing Playwright browsers...'));
    await execAsync('npx playwright install chromium', { timeout: 120000 });
    console.log(chalk.green('✅ Playwright browsers installed'));
    
    // Create browser automation config
    const browserConfig = {
      defaultBrowser: 'chromium',
      headless: false,
      viewport: { width: 1920, height: 1080 },
      timeout: 30000,
      screenshotPath: './screenshots'
    };
    
    const configDir = path.join(process.env.HOME || '', '.config', 'gemini-cli-enhancer');
    await fs.ensureDir(configDir);
    await fs.writeJson(path.join(configDir, 'browser.json'), browserConfig, { spaces: 2 });
    
    console.log(chalk.green('✅ Browser automation configured'));
  } catch (error) {
    console.error(chalk.red('❌ Browser automation setup failed:'), error);
  }
}

async function setupTaskPlanning(): Promise<void> {
  console.log(chalk.blue('\n📋 Setting up task planning...'));
  
  try {
    // Create task planning directories
    const planningDir = path.join(process.env.HOME || '', 'Documents', 'gemini-cli-plans');
    const templatesDir = path.join(planningDir, 'templates');
    
    await fs.ensureDir(planningDir);
    await fs.ensureDir(templatesDir);
    
    // Create sample templates
    const webDevTemplate = {
      name: 'Web Development Project',
      description: 'Template for web development projects',
      tasks: [
        {
          title: 'Project Setup',
          description: 'Initialize project structure and dependencies',
          priority: 'high',
          estimatedTime: 2,
          tags: ['setup']
        },
        {
          title: 'Frontend Development',
          description: 'Implement user interface',
          priority: 'high',
          estimatedTime: 20,
          tags: ['frontend']
        },
        {
          title: 'Backend Development',
          description: 'Implement server-side logic',
          priority: 'high',
          estimatedTime: 16,
          tags: ['backend']
        },
        {
          title: 'Testing',
          description: 'Write and run tests',
          priority: 'medium',
          estimatedTime: 8,
          tags: ['testing']
        }
      ]
    };
    
    await fs.writeJson(path.join(templatesDir, 'web-development.json'), webDevTemplate, { spaces: 2 });
    
    // Create planning config
    const planningConfig = {
      defaultPlanPath: planningDir,
      templatesPath: templatesDir,
      autoSave: true,
      reminderInterval: 3600000 // 1 hour
    };
    
    const configDir = path.join(process.env.HOME || '', '.config', 'gemini-cli-enhancer');
    await fs.writeJson(path.join(configDir, 'planning.json'), planningConfig, { spaces: 2 });
    
    console.log(chalk.green(`✅ Task planning configured`));
    console.log(chalk.gray(`   Plans directory: ${planningDir}`));
    console.log(chalk.gray(`   Templates directory: ${templatesDir}`));
  } catch (error) {
    console.error(chalk.red('❌ Task planning setup failed:'), error);
  }
}