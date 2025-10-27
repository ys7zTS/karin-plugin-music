import fs from 'node:fs';
import { existsSync, karinPathBase, logger, mkdirSync, requireFileSync } from 'node-karin';
import path from 'path';
import * as chokidar from 'chokidar';
import { Root } from '../Root.js';
class Config {
    /** 默认配置 */
    defaultConfig;
    /** 配置文件路径 */
    CfgPath;
    watch = null;
    CfgCache;
    constructor() {
        this.defaultConfig = {
            defaultPlatform: '酷狗',
            qq: {
                ck: ''
            },
            kugou: {
                ck: '',
                mid: '',
                token: '',
                dfid: '',
                userid: 0
            }
        };
        this.CfgPath = path.join(karinPathBase, Root.pluginName, 'config', 'config.json');
        this.CfgCache = null;
        this.init();
        this.watcher();
    }
    init() {
        if (!existsSync(this.CfgPath)) {
            mkdirSync(path.dirname(this.CfgPath));
            fs.writeFileSync(this.CfgPath, JSON.stringify(this.defaultConfig, null, 2), 'utf8');
        }
    }
    /** 读取配置文件 */
    get getConfig() {
        try {
            if (this.CfgCache)
                return this.CfgCache;
            const cfg = requireFileSync(this.CfgPath, { force: true });
            this.CfgCache = this.deepMerge(this.defaultConfig, cfg);
            return this.CfgCache;
        }
        catch (err) {
            logger.error(`[${Root.pluginName}] 读取配置文件失败，已加载默认配置`, err);
            return this.defaultConfig;
        }
    }
    setCfg(key, value) {
        try {
            const data = JSON.parse(fs.readFileSync(this.CfgPath, 'utf8'));
            const keys = key.split('.');
            let obj = data;
            for (let i = 0; i < keys.length - 1; i++) {
                const k = keys[i];
                if (!obj[k] || typeof obj[k] !== 'object') {
                    obj[k] = {};
                }
                obj = obj[k];
            }
            obj[keys[keys.length - 1]] = value;
            fs.writeFileSync(this.CfgPath, JSON.stringify(data, null, 2), 'utf8');
        }
        catch (e) {
            logger.error(`[${Root.pluginName}] 写入配置文件失败`, e);
        }
    }
    watcher() {
        if (this.watch)
            return;
        this.watch = chokidar.watch(this.CfgPath, {
            ignoreInitial: true,
            persistent: true,
            awaitWriteFinish: {
                stabilityThreshold: 500,
                pollInterval: 100
            }
        });
        let Timer;
        this.watch.on('change', () => {
            clearTimeout(Timer);
            Timer = setTimeout(() => {
                logger.info(`[${Root.pluginName}] 配置文件变更，已重新加载配置`);
                this.CfgCache = null;
            });
        });
    }
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] === null || source[key] === undefined) {
                continue;
            }
            const targetVal = target[key];
            const sourceVal = source[key];
            if (this.isPlainObject(targetVal) && this.isPlainObject(sourceVal)) {
                // 两个都是普通对象，递归合并
                result[key] = this.deepMerge(targetVal, sourceVal);
            }
            else {
                // 其他情况直接赋值
                result[key] = sourceVal;
            }
        }
        return result;
    }
    isPlainObject(obj) {
        return obj && typeof obj === 'object' && !Array.isArray(obj) && !(obj instanceof Date) && !(obj instanceof RegExp);
    }
}
export const Cfg = new Config();
