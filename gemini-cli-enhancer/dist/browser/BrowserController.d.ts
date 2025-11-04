export interface BrowserOptions {
    headless?: boolean;
    url?: string;
}
export declare class BrowserController {
    private browser;
    private context;
    private page;
    launch(options?: BrowserOptions): Promise<void>;
    navigateTo(url: string): Promise<void>;
    startInteractiveMode(): Promise<void>;
    private handleNavigation;
    private takeScreenshot;
    private extractPageInfo;
    private findElements;
    private executeScript;
    private waitForElement;
    close(): Promise<void>;
}
//# sourceMappingURL=BrowserController.d.ts.map