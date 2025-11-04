export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dependencies: string[];
    estimatedTime?: number;
    actualTime?: number;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface TaskPlan {
    name: string;
    description: string;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
}
export interface PlannerOptions {
    file?: string;
    interactive?: boolean;
}
export declare class TaskPlanner {
    private currentPlan;
    private planFile;
    start(options?: PlannerOptions): Promise<void>;
    private showMenu;
    private createNewPlan;
    private loadExistingPlan;
    private loadPlan;
    private viewCurrentPlan;
    private addTask;
    private updateTaskStatus;
    private showDependencies;
    private generateProgressReport;
    private exportPlan;
    private savePlan;
    private generateTaskId;
    private getStatusIcon;
    private getPriorityColor;
    interactiveMode(): Promise<void>;
    private generateTemplateTasks;
    private getProjectTemplates;
}
//# sourceMappingURL=TaskPlanner.d.ts.map