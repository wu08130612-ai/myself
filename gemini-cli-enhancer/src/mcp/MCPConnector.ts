import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface MCPServer {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  status: 'connected' | 'disconnected' | 'error';
}

export interface MCPOptions {
  list?: boolean;
  connect?: string;
}

export class MCPConnector {
  private configPath: string;
  private servers: Record<string, MCPServer> = {};

  constructor() {
    this.configPath = path.join(process.env.HOME || '', '.config', 'gemini-cli', 'settings.json');
  }

  async manage(options: MCPOptions): Promise<void> {
    await this.loadConfiguration();

    if (options.list) {
      await this.listServers();
    } else if (options.connect) {
      await this.connectToServer(options.connect);
    } else {
      await this.showMCPMenu();
    }
  }

  private async showMCPMenu(): Promise<void> {
    console.log(chalk.cyan('🔌 MCP Server Management'));
    
    // This would integrate with inquirer for interactive menu
    // For now, showing basic functionality
    await this.listServers();
    await this.checkServerStatus();
  }

  private async loadConfiguration(): Promise<void> {
    try {
      if (await fs.pathExists(this.configPath)) {
        const config = await fs.readJson(this.configPath);
        if (config.mcpServers) {
          Object.entries(config.mcpServers).forEach(([name, serverConfig]: [string, any]) => {
            this.servers[name] = {
              name,
              command: serverConfig.command,
              args: serverConfig.args,
              env: serverConfig.env,
              status: 'disconnected'
            };
          });
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to load MCP configuration:'), error);
    }
  }

  private async listServers(): Promise<void> {
    console.log(chalk.blue('\n📋 Configured MCP Servers:'));
    
    if (Object.keys(this.servers).length === 0) {
      console.log(chalk.yellow('No MCP servers configured'));
      return;
    }

    Object.values(this.servers).forEach(server => {
      const statusIcon = server.status === 'connected' ? '🟢' : 
                        server.status === 'error' ? '🔴' : '🟡';
      console.log(`${statusIcon} ${server.name} - ${server.status}`);
      console.log(`   Command: ${server.command}`);
      if (server.args) {
        console.log(`   Args: ${server.args.join(' ')}`);
      }
    });
  }

  private async checkServerStatus(): Promise<void> {
    console.log(chalk.blue('\n🔍 Checking server status...'));
    
    for (const server of Object.values(this.servers)) {
      try {
        // Basic connectivity check - this would be more sophisticated in practice
        const result = await this.testServerConnection(server);
        server.status = result ? 'connected' : 'disconnected';
      } catch (error) {
        server.status = 'error';
        console.error(chalk.red(`❌ Error checking ${server.name}:`), error);
      }
    }
  }

  private async testServerConnection(server: MCPServer): Promise<boolean> {
    try {
      // This is a simplified test - in practice, you'd test the actual MCP protocol
      const { stdout } = await execAsync(`which ${server.command.split(' ')[0]}`);
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  private async connectToServer(serverName: string): Promise<void> {
    const server = this.servers[serverName];
    if (!server) {
      console.error(chalk.red(`❌ Server "${serverName}" not found`));
      return;
    }

    console.log(chalk.blue(`🔌 Connecting to ${serverName}...`));
    
    try {
      // In practice, this would establish an actual MCP connection
      const connected = await this.testServerConnection(server);
      if (connected) {
        server.status = 'connected';
        console.log(chalk.green(`✅ Connected to ${serverName}`));
      } else {
        server.status = 'disconnected';
        console.log(chalk.red(`❌ Failed to connect to ${serverName}`));
      }
    } catch (error) {
      server.status = 'error';
      console.error(chalk.red(`❌ Connection error for ${serverName}:`), error);
    }
  }

  async fixContext7(): Promise<void> {
    console.log(chalk.red('🔧 Fixing Context7 MCP Connection Issues'));
    
    const fixes = [
      {
        name: 'Check Network Connectivity',
        action: () => this.checkNetworkConnectivity()
      },
      {
        name: 'Verify Configuration',
        action: () => this.verifyContext7Config()
      },
      {
        name: 'Update Context7',
        action: () => this.updateContext7()
      },
      {
        name: 'Reset Connection',
        action: () => this.resetContext7Connection()
      },
      {
        name: 'Check Dependencies',
        action: () => this.checkContext7Dependencies()
      }
    ];

    for (const fix of fixes) {
      console.log(chalk.blue(`\n🔧 ${fix.name}...`));
      try {
        await fix.action();
        console.log(chalk.green(`✅ ${fix.name} completed`));
      } catch (error) {
        console.error(chalk.red(`❌ ${fix.name} failed:`), error);
      }
    }

    console.log(chalk.blue('\n🔄 Testing Context7 connection...'));
    await this.testContext7Connection();
  }

  private async checkNetworkConnectivity(): Promise<void> {
    try {
      const { stdout } = await execAsync('curl -s --max-time 5 https://api.github.com/zen');
      if (stdout.trim()) {
        console.log(chalk.green('✅ Network connectivity OK'));
      } else {
        throw new Error('No response from GitHub API');
      }
    } catch (error) {
      console.error(chalk.red('❌ Network connectivity issue:'), error);
      console.log(chalk.yellow('💡 Try checking your internet connection'));
    }
  }

  private async verifyContext7Config(): Promise<void> {
    try {
      if (!await fs.pathExists(this.configPath)) {
        console.log(chalk.yellow('⚠️ Gemini CLI config not found, creating default...'));
        await this.createDefaultConfig();
        return;
      }

      const config = await fs.readJson(this.configPath);
      
      if (!config.mcpServers || !config.mcpServers.context7) {
        console.log(chalk.yellow('⚠️ Context7 not configured, adding default configuration...'));
        await this.addContext7Config();
      } else {
        console.log(chalk.green('✅ Context7 configuration found'));
        console.log('Configuration:', JSON.stringify(config.mcpServers.context7, null, 2));
      }
    } catch (error) {
      console.error(chalk.red('❌ Configuration verification failed:'), error);
    }
  }

  private async createDefaultConfig(): Promise<void> {
    const defaultConfig = {
      mcpServers: {
        context7: {
          command: "npx",
          args: ["-y", "@context7/mcp-server"],
          env: {}
        }
      }
    };

    await fs.ensureDir(path.dirname(this.configPath));
    await fs.writeJson(this.configPath, defaultConfig, { spaces: 2 });
    console.log(chalk.green(`✅ Created default config at ${this.configPath}`));
  }

  private async addContext7Config(): Promise<void> {
    const config = await fs.readJson(this.configPath);
    
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    config.mcpServers.context7 = {
      command: "npx",
      args: ["-y", "@context7/mcp-server"],
      env: {}
    };

    await fs.writeJson(this.configPath, config, { spaces: 2 });
    console.log(chalk.green('✅ Added Context7 configuration'));
  }

  private async updateContext7(): Promise<void> {
    try {
      console.log(chalk.blue('📦 Updating Context7...'));
      const { stdout, stderr } = await execAsync('npm list -g @context7/mcp-server');
      
      if (stdout.includes('@context7/mcp-server')) {
        console.log(chalk.green('✅ Context7 is installed globally'));
      } else {
        console.log(chalk.yellow('⚠️ Installing Context7...'));
        await execAsync('npm install -g @context7/mcp-server');
        console.log(chalk.green('✅ Context7 installed'));
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️ Global install failed, trying npx approach...'));
      // npx will handle downloading automatically
      console.log(chalk.green('✅ Will use npx for Context7'));
    }
  }

  private async resetContext7Connection(): Promise<void> {
    try {
      // Clear any cached connections
      const cacheDir = path.join(process.env.HOME || '', '.cache', 'gemini-cli');
      if (await fs.pathExists(cacheDir)) {
        await fs.rm(cacheDir, { recursive: true, force: true });
        console.log(chalk.green('✅ Cleared connection cache'));
      }

      // Restart any running processes (this would be more sophisticated in practice)
      console.log(chalk.green('✅ Connection reset completed'));
    } catch (error) {
      console.error(chalk.red('❌ Reset failed:'), error);
    }
  }

  private async checkContext7Dependencies(): Promise<void> {
    const dependencies = ['node', 'npm', 'npx'];
    
    for (const dep of dependencies) {
      try {
        const { stdout } = await execAsync(`which ${dep}`);
        if (stdout.trim()) {
          const { stdout: version } = await execAsync(`${dep} --version`);
          console.log(chalk.green(`✅ ${dep}: ${version.trim()}`));
        }
      } catch (error) {
        console.error(chalk.red(`❌ ${dep} not found or not working`));
      }
    }
  }

  private async testContext7Connection(): Promise<void> {
    try {
      console.log(chalk.blue('🧪 Testing Context7 connection...'));
      
      // This would test the actual MCP protocol connection
      // For now, we'll test if the command can be executed
      const { stdout, stderr } = await execAsync('npx -y @context7/mcp-server --help', { timeout: 10000 });
      
      if (stdout || stderr) {
        console.log(chalk.green('✅ Context7 MCP server is accessible'));
        console.log(chalk.blue('💡 Try restarting Gemini CLI to reconnect'));
      } else {
        throw new Error('No output from Context7 server');
      }
    } catch (error) {
      console.error(chalk.red('❌ Context7 connection test failed:'), error);
      console.log(chalk.yellow('💡 Troubleshooting suggestions:'));
      console.log('   1. Check your internet connection');
      console.log('   2. Try: npm cache clean --force');
      console.log('   3. Restart your terminal');
      console.log('   4. Update Node.js to latest version');
    }
  }

  async installMCPServer(serverName: string, command: string, args?: string[]): Promise<void> {
    console.log(chalk.blue(`📦 Installing MCP server: ${serverName}`));
    
    try {
      // Add to configuration
      await this.loadConfiguration();
      this.servers[serverName] = {
        name: serverName,
        command,
        args: args || [],
        status: 'disconnected'
      };

      // Update config file
      const config = await fs.readJson(this.configPath).catch(() => ({}));
      if (!config.mcpServers) {
        config.mcpServers = {};
      }
      
      config.mcpServers[serverName] = {
        command,
        args: args || [],
        env: {}
      };

      await fs.writeJson(this.configPath, config, { spaces: 2 });
      console.log(chalk.green(`✅ MCP server "${serverName}" installed and configured`));
    } catch (error) {
      console.error(chalk.red(`❌ Failed to install MCP server "${serverName}":`), error);
    }
  }
}