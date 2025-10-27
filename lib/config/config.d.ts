import { CfgType } from './types.js';
import * as chokidar from 'chokidar';
declare class Config {
    /** 默认配置 */
    defaultConfig: CfgType;
    /** 配置文件路径 */
    CfgPath: string;
    watch: chokidar.FSWatcher | null;
    CfgCache: null | CfgType;
    constructor();
    init(): void;
    /** 读取配置文件 */
    get getConfig(): CfgType;
    setCfg(key: string, value: any): void;
    watcher(): void;
    deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T;
    private isPlainObject;
}
export declare const Cfg: Config;
export {};
