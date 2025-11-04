import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import * as yaml from 'yaml';
export class TaskPlanner {
    currentPlan = null;
    planFile = '';
    async start(options = {}) {
        console.log(chalk.yellow('📋 Task Planner Started'));
        if (options.file) {
            await this.loadPlan(options.file);
        }
        else if (options.interactive) {
            await this.interactiveMode();
        }
        else {
            await this.showMenu();
        }
    }
    async showMenu() {
        while (true) {
            const { action } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'action',
                    message: 'Choose an action:',
                    choices: [
                        'Create New Plan',
                        'Load Existing Plan',
                        'View Current Plan',
                        'Add Task',
                        'Update Task Status',
                        'Show Task Dependencies',
                        'Generate Progress Report',
                        'Export Plan',
                        'Exit'
                    ]
                }
            ]);
            try {
                switch (action) {
                    case 'Create New Plan':
                        await this.createNewPlan();
                        break;
                    case 'Load Existing Plan':
                        await this.loadExistingPlan();
                        break;
                    case 'View Current Plan':
                        await this.viewCurrentPlan();
                        break;
                    case 'Add Task':
                        await this.addTask();
                        break;
                    case 'Update Task Status':
                        await this.updateTaskStatus();
                        break;
                    case 'Show Task Dependencies':
                        await this.showDependencies();
                        break;
                    case 'Generate Progress Report':
                        await this.generateProgressReport();
                        break;
                    case 'Export Plan':
                        await this.exportPlan();
                        break;
                    case 'Exit':
                        return;
                }
            }
            catch (error) {
                console.error(chalk.red('❌ Action failed:'), error);
            }
        }
    }
    async createNewPlan() {
        const { name, description } = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Plan name:',
                validate: (input) => input.trim().length > 0 || 'Plan name is required'
            },
            {
                type: 'input',
                name: 'description',
                message: 'Plan description:'
            }
        ]);
        this.currentPlan = {
            name: name.trim(),
            description: description.trim(),
            tasks: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        console.log(chalk.green(`✅ Created new plan: ${this.currentPlan.name}`));
    }
    async loadExistingPlan() {
        const { filename } = await inquirer.prompt([
            {
                type: 'input',
                name: 'filename',
                message: 'Enter plan file path:',
                validate: (input) => input.trim().length > 0 || 'File path is required'
            }
        ]);
        await this.loadPlan(filename.trim());
    }
    async loadPlan(filename) {
        try {
            this.planFile = path.resolve(filename);
            if (!await fs.pathExists(this.planFile)) {
                throw new Error(`Plan file not found: ${this.planFile}`);
            }
            const content = await fs.readFile(this.planFile, 'utf-8');
            this.currentPlan = yaml.parse(content);
            console.log(chalk.green(`✅ Loaded plan: ${this.currentPlan.name}`));
        }
        catch (error) {
            console.error(chalk.red('❌ Failed to load plan:'), error);
        }
    }
    async viewCurrentPlan() {
        if (!this.currentPlan) {
            console.log(chalk.yellow('⚠️ No plan loaded'));
            return;
        }
        console.log(chalk.cyan(`\n📋 Plan: ${this.currentPlan.name}`));
        console.log(chalk.gray(`Description: ${this.currentPlan.description}`));
        console.log(chalk.gray(`Tasks: ${this.currentPlan.tasks.length}`));
        console.log(chalk.gray(`Created: ${this.currentPlan.createdAt.toLocaleDateString()}`));
        if (this.currentPlan.tasks.length === 0) {
            console.log(chalk.yellow('No tasks in this plan'));
            return;
        }
        console.log('\n📝 Tasks:');
        this.currentPlan.tasks.forEach((task, index) => {
            const statusIcon = this.getStatusIcon(task.status);
            const priorityColor = this.getPriorityColor(task.priority);
            console.log(`${index + 1}. ${statusIcon} ${priorityColor(task.title)} [${task.priority}]`);
            if (task.description) {
                console.log(`   ${chalk.gray(task.description)}`);
            }
            if (task.dependencies.length > 0) {
                console.log(`   ${chalk.blue('Dependencies:')} ${task.dependencies.join(', ')}`);
            }
        });
    }
    async addTask() {
        if (!this.currentPlan) {
            console.log(chalk.yellow('⚠️ No plan loaded. Create or load a plan first.'));
            return;
        }
        const taskData = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Task title:',
                validate: (input) => input.trim().length > 0 || 'Task title is required'
            },
            {
                type: 'input',
                name: 'description',
                message: 'Task description:'
            },
            {
                type: 'list',
                name: 'priority',
                message: 'Priority:',
                choices: ['low', 'medium', 'high', 'critical']
            },
            {
                type: 'input',
                name: 'dependencies',
                message: 'Dependencies (comma-separated task IDs):'
            },
            {
                type: 'number',
                name: 'estimatedTime',
                message: 'Estimated time (hours):'
            },
            {
                type: 'input',
                name: 'tags',
                message: 'Tags (comma-separated):'
            }
        ]);
        const task = {
            id: this.generateTaskId(),
            title: taskData.title.trim(),
            description: taskData.description.trim(),
            status: 'pending',
            priority: taskData.priority,
            dependencies: taskData.dependencies ? taskData.dependencies.split(',').map((dep) => dep.trim()).filter((dep) => dep) : [],
            estimatedTime: taskData.estimatedTime || undefined,
            tags: taskData.tags ? taskData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag) : [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.currentPlan.tasks.push(task);
        this.currentPlan.updatedAt = new Date();
        console.log(chalk.green(`✅ Added task: ${task.title} (ID: ${task.id})`));
        if (this.planFile) {
            await this.savePlan();
        }
    }
    async updateTaskStatus() {
        if (!this.currentPlan || this.currentPlan.tasks.length === 0) {
            console.log(chalk.yellow('⚠️ No tasks available'));
            return;
        }
        const taskChoices = this.currentPlan.tasks.map(task => ({
            name: `${task.title} [${task.status}]`,
            value: task.id
        }));
        const { taskId, newStatus } = await inquirer.prompt([
            {
                type: 'list',
                name: 'taskId',
                message: 'Select task to update:',
                choices: taskChoices
            },
            {
                type: 'list',
                name: 'newStatus',
                message: 'New status:',
                choices: ['pending', 'in_progress', 'completed', 'blocked']
            }
        ]);
        const task = this.currentPlan.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            task.updatedAt = new Date();
            this.currentPlan.updatedAt = new Date();
            console.log(chalk.green(`✅ Updated task "${task.title}" to ${newStatus}`));
            if (this.planFile) {
                await this.savePlan();
            }
        }
    }
    async showDependencies() {
        if (!this.currentPlan || this.currentPlan.tasks.length === 0) {
            console.log(chalk.yellow('⚠️ No tasks available'));
            return;
        }
        console.log(chalk.cyan('\n🔗 Task Dependencies:'));
        this.currentPlan.tasks.forEach(task => {
            if (task.dependencies.length > 0) {
                console.log(`\n${chalk.white(task.title)} (${task.id}):`);
                task.dependencies.forEach(depId => {
                    const depTask = this.currentPlan.tasks.find(t => t.id === depId);
                    if (depTask) {
                        const statusIcon = this.getStatusIcon(depTask.status);
                        console.log(`  ${statusIcon} ${depTask.title} (${depTask.id})`);
                    }
                    else {
                        console.log(`  ❓ Unknown dependency: ${depId}`);
                    }
                });
            }
        });
    }
    async generateProgressReport() {
        if (!this.currentPlan || this.currentPlan.tasks.length === 0) {
            console.log(chalk.yellow('⚠️ No tasks available'));
            return;
        }
        const stats = {
            total: this.currentPlan.tasks.length,
            pending: this.currentPlan.tasks.filter(t => t.status === 'pending').length,
            inProgress: this.currentPlan.tasks.filter(t => t.status === 'in_progress').length,
            completed: this.currentPlan.tasks.filter(t => t.status === 'completed').length,
            blocked: this.currentPlan.tasks.filter(t => t.status === 'blocked').length
        };
        const completionRate = Math.round((stats.completed / stats.total) * 100);
        console.log(chalk.cyan(`\n📊 Progress Report for "${this.currentPlan.name}"`));
        console.log(`Total Tasks: ${stats.total}`);
        console.log(`${chalk.gray('Pending:')} ${stats.pending}`);
        console.log(`${chalk.blue('In Progress:')} ${stats.inProgress}`);
        console.log(`${chalk.green('Completed:')} ${stats.completed}`);
        console.log(`${chalk.red('Blocked:')} ${stats.blocked}`);
        console.log(`${chalk.yellow('Completion Rate:')} ${completionRate}%`);
        // Progress bar
        const progressBar = '█'.repeat(Math.floor(completionRate / 5)) + '░'.repeat(20 - Math.floor(completionRate / 5));
        console.log(`Progress: [${chalk.green(progressBar)}] ${completionRate}%`);
    }
    async exportPlan() {
        if (!this.currentPlan) {
            console.log(chalk.yellow('⚠️ No plan loaded'));
            return;
        }
        const { filename, format } = await inquirer.prompt([
            {
                type: 'input',
                name: 'filename',
                message: 'Export filename:',
                default: `${this.currentPlan.name.replace(/\s+/g, '-').toLowerCase()}-plan`
            },
            {
                type: 'list',
                name: 'format',
                message: 'Export format:',
                choices: ['yaml', 'json']
            }
        ]);
        const fullFilename = `${filename}.${format}`;
        let content;
        if (format === 'yaml') {
            content = yaml.stringify(this.currentPlan);
        }
        else {
            content = JSON.stringify(this.currentPlan, null, 2);
        }
        await fs.writeFile(fullFilename, content, 'utf-8');
        console.log(chalk.green(`✅ Plan exported to: ${fullFilename}`));
    }
    async savePlan() {
        if (!this.currentPlan || !this.planFile)
            return;
        const content = yaml.stringify(this.currentPlan);
        await fs.writeFile(this.planFile, content, 'utf-8');
    }
    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    getStatusIcon(status) {
        switch (status) {
            case 'pending': return '⏳';
            case 'in_progress': return '🔄';
            case 'completed': return '✅';
            case 'blocked': return '🚫';
            default: return '❓';
        }
    }
    getPriorityColor(priority) {
        switch (priority) {
            case 'low': return chalk.gray;
            case 'medium': return chalk.yellow;
            case 'high': return chalk.orange;
            case 'critical': return chalk.red;
            default: return chalk.white;
        }
    }
    async interactiveMode() {
        console.log(chalk.blue('🎯 Interactive Planning Mode'));
        // Auto-create a plan based on user input
        const { projectType, complexity } = await inquirer.prompt([
            {
                type: 'list',
                name: 'projectType',
                message: 'What type of project are you planning?',
                choices: [
                    'Web Development',
                    'Mobile App',
                    'API Development',
                    'Data Analysis',
                    'Machine Learning',
                    'DevOps/Infrastructure',
                    'Other'
                ]
            },
            {
                type: 'list',
                name: 'complexity',
                message: 'Project complexity:',
                choices: ['Simple', 'Medium', 'Complex', 'Enterprise']
            }
        ]);
        // Generate template tasks based on project type
        await this.generateTemplateTasks(projectType, complexity);
        console.log(chalk.green('✅ Template plan created! You can now customize it.'));
        await this.showMenu();
    }
    async generateTemplateTasks(projectType, complexity) {
        const planName = `${projectType} - ${complexity} Project`;
        this.currentPlan = {
            name: planName,
            description: `Auto-generated plan for ${projectType.toLowerCase()} project`,
            tasks: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // Generate tasks based on project type
        const templates = this.getProjectTemplates();
        const template = templates[projectType] || templates['Other'];
        template.forEach((taskTemplate, index) => {
            const task = {
                id: this.generateTaskId(),
                title: taskTemplate.title,
                description: taskTemplate.description,
                status: 'pending',
                priority: taskTemplate.priority,
                dependencies: taskTemplate.dependencies || [],
                estimatedTime: taskTemplate.estimatedTime,
                tags: taskTemplate.tags || [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            if (this.currentPlan) {
                this.currentPlan.tasks.push(task);
            }
        });
    }
    getProjectTemplates() {
        return {
            'Web Development': [
                { title: 'Project Setup', description: 'Initialize project structure and dependencies', priority: 'high', estimatedTime: 2, tags: ['setup'] },
                { title: 'UI/UX Design', description: 'Create wireframes and design mockups', priority: 'high', estimatedTime: 8, tags: ['design'] },
                { title: 'Frontend Development', description: 'Implement user interface', priority: 'high', estimatedTime: 20, tags: ['frontend'] },
                { title: 'Backend API', description: 'Develop server-side logic and APIs', priority: 'high', estimatedTime: 16, tags: ['backend'] },
                { title: 'Database Design', description: 'Design and implement database schema', priority: 'medium', estimatedTime: 6, tags: ['database'] },
                { title: 'Testing', description: 'Write and run tests', priority: 'medium', estimatedTime: 8, tags: ['testing'] },
                { title: 'Deployment', description: 'Deploy to production environment', priority: 'medium', estimatedTime: 4, tags: ['deployment'] }
            ],
            'API Development': [
                { title: 'API Design', description: 'Design API endpoints and documentation', priority: 'high', estimatedTime: 4, tags: ['design'] },
                { title: 'Authentication', description: 'Implement authentication system', priority: 'high', estimatedTime: 6, tags: ['auth'] },
                { title: 'Core Endpoints', description: 'Implement main API functionality', priority: 'high', estimatedTime: 12, tags: ['development'] },
                { title: 'Error Handling', description: 'Implement comprehensive error handling', priority: 'medium', estimatedTime: 3, tags: ['error-handling'] },
                { title: 'Rate Limiting', description: 'Implement rate limiting and security', priority: 'medium', estimatedTime: 2, tags: ['security'] },
                { title: 'Documentation', description: 'Create API documentation', priority: 'medium', estimatedTime: 4, tags: ['documentation'] },
                { title: 'Testing', description: 'Write API tests', priority: 'high', estimatedTime: 6, tags: ['testing'] }
            ],
            'Other': [
                { title: 'Planning', description: 'Define project requirements and scope', priority: 'high', estimatedTime: 4, tags: ['planning'] },
                { title: 'Research', description: 'Research technologies and approaches', priority: 'medium', estimatedTime: 6, tags: ['research'] },
                { title: 'Implementation', description: 'Core development work', priority: 'high', estimatedTime: 20, tags: ['development'] },
                { title: 'Testing', description: 'Test implementation', priority: 'medium', estimatedTime: 6, tags: ['testing'] },
                { title: 'Documentation', description: 'Create project documentation', priority: 'low', estimatedTime: 4, tags: ['documentation'] }
            ]
        };
    }
}
//# sourceMappingURL=TaskPlanner.js.map