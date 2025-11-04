import { chromium, Browser, Page, BrowserContext } from 'playwright';
import chalk from 'chalk';
import inquirer from 'inquirer';

export interface BrowserOptions {
  headless?: boolean;
  url?: string;
}

export class BrowserController {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async launch(options: BrowserOptions = {}): Promise<void> {
    try {
      console.log(chalk.blue('🚀 Launching browser...'));
      
      this.browser = await chromium.launch({
        headless: options.headless || false,
        devtools: true
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      });

      this.page = await this.context.newPage();

      if (options.url) {
        await this.navigateTo(options.url);
      }

      await this.startInteractiveMode();
    } catch (error) {
      console.error(chalk.red('❌ Failed to launch browser:'), error);
    }
  }

  async navigateTo(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    console.log(chalk.green(`🌐 Navigating to: ${url}`));
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async startInteractiveMode(): Promise<void> {
    if (!this.page) return;

    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Choose an action:',
          choices: [
            'Navigate to URL',
            'Take Screenshot',
            'Extract Page Info',
            'Find Elements',
            'Execute Script',
            'Wait for Element',
            'Close Browser'
          ]
        }
      ]);

      try {
        switch (action) {
          case 'Navigate to URL':
            await this.handleNavigation();
            break;
          case 'Take Screenshot':
            await this.takeScreenshot();
            break;
          case 'Extract Page Info':
            await this.extractPageInfo();
            break;
          case 'Find Elements':
            await this.findElements();
            break;
          case 'Execute Script':
            await this.executeScript();
            break;
          case 'Wait for Element':
            await this.waitForElement();
            break;
          case 'Close Browser':
            await this.close();
            return;
        }
      } catch (error) {
        console.error(chalk.red('❌ Action failed:'), error);
      }
    }
  }

  private async handleNavigation(): Promise<void> {
    const { url } = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Enter URL to navigate to:'
      }
    ]);

    await this.navigateTo(url);
  }

  private async takeScreenshot(): Promise<void> {
    if (!this.page) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${timestamp}.png`;
    
    await this.page.screenshot({ path: filename, fullPage: true });
    console.log(chalk.green(`📸 Screenshot saved as: ${filename}`));
  }

  private async extractPageInfo(): Promise<void> {
    if (!this.page) return;

    const info = await this.page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      elementCount: document.querySelectorAll('*').length,
      links: Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.textContent?.trim(),
        href: a.href
      })).filter(link => link.text && link.href)
    }));

    console.log(chalk.cyan('📄 Page Information:'));
    console.log(`Title: ${info.title}`);
    console.log(`URL: ${info.url}`);
    console.log(`Elements: ${info.elementCount}`);
    console.log(`Links: ${info.links.length}`);
    
    if (info.links.length > 0) {
      console.log('First 5 links:');
      info.links.slice(0, 5).forEach((link, i) => {
        console.log(`  ${i + 1}. ${link.text} -> ${link.href}`);
      });
    }
  }

  private async findElements(): Promise<void> {
    if (!this.page) return;

    const { selector } = await inquirer.prompt([
      {
        type: 'input',
        name: 'selector',
        message: 'Enter CSS selector to find elements:'
      }
    ]);

    const elements = await this.page.locator(selector).all();
    console.log(chalk.green(`Found ${elements.length} elements matching "${selector}"`));

    for (let i = 0; i < Math.min(elements.length, 5); i++) {
      const text = await elements[i].textContent();
      const tagName = await elements[i].evaluate(el => el.tagName);
      console.log(`  ${i + 1}. <${tagName.toLowerCase()}> ${text?.trim() || '(no text)'}`);
    }
  }

  private async executeScript(): Promise<void> {
    if (!this.page) return;

    const { script } = await inquirer.prompt([
      {
        type: 'input',
        name: 'script',
        message: 'Enter JavaScript to execute:'
      }
    ]);

    try {
      const result = await this.page.evaluate(script);
      console.log(chalk.green('✅ Script result:'), result);
    } catch (error) {
      console.error(chalk.red('❌ Script error:'), error);
    }
  }

  private async waitForElement(): Promise<void> {
    if (!this.page) return;

    const { selector, timeout } = await inquirer.prompt([
      {
        type: 'input',
        name: 'selector',
        message: 'Enter CSS selector to wait for:'
      },
      {
        type: 'number',
        name: 'timeout',
        message: 'Timeout in milliseconds (default 30000):',
        default: 30000
      }
    ]);

    try {
      await this.page.waitForSelector(selector, { timeout });
      console.log(chalk.green(`✅ Element "${selector}" appeared`));
    } catch (error) {
      console.error(chalk.red(`❌ Element "${selector}" did not appear within ${timeout}ms`));
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log(chalk.blue('👋 Browser closed'));
    }
  }
}