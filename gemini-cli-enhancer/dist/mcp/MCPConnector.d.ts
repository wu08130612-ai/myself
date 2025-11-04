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
export declare class MCPConnector {
    private configPath;
    private servers;
    constructor();
    manage(options: MCPOptions): Promise<void>;
    private showMCPMenu;
    private loadConfiguration;
    private listServers;
    private checkServerStatus;
    private testServerConnection;
    private connectToServer;
    fixContext7(): Promise<void>;
    private checkNetworkConnectivity;
    private verifyContext7Config;
    private createDefaultConfig;
    private addContext7Config;
    private updateContext7;
    private resetContext7Connection;
    private checkContext7Dependencies;
    private testContext7Connection;
    installMCPServer(serverName: string, command: string, args?: string[]): Promise<void>;
}
//# sourceMappingURL=MCPConnector.d.ts.map