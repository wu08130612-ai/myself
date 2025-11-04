declare module 'playwright' {
  export * from '@playwright/test';
}

declare module 'chalk' {
  const chalk: any;
  export default chalk;
}

declare module 'inquirer' {
  export interface QuestionCollection {
    type: string;
    name: string;
    message: string;
    choices?: string[] | any[];
    default?: any;
    validate?: (input: any) => boolean | string;
  }
  
  export function prompt(questions: QuestionCollection[]): Promise<any>;
}

declare module 'fs-extra' {
  export * from 'fs';
  export function ensureDir(dir: string): Promise<void>;
  export function writeJson(file: string, object: any, options?: any): Promise<void>;
  export function readJson(file: string): Promise<any>;
  export function pathExists(path: string): Promise<boolean>;
  export function copy(src: string, dest: string): Promise<void>;
  export function readFile(path: string, encoding: string): Promise<string>;
  export function writeFile(path: string, data: string, encoding: string): Promise<void>;
  export function rm(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>;
}

declare module 'yaml' {
  export function parse(str: string): any;
  export function stringify(obj: any): string;
}

declare module 'commander' {
  export class Command {
    name(name: string): this;
    description(desc: string): this;
    version(version: string): this;
    command(name: string): Command;
    action(fn: (...args: any[]) => void): this;
    parse(argv?: string[]): this;
    option(flags: string, description?: string, defaultValue?: any): this;
  }
}

declare global {
  namespace NodeJS {
    interface Process {
      exit(code?: number): never;
      cwd(): string;
      platform: string;
    }
  }
  
  var process: NodeJS.Process;
  var console: Console;
}