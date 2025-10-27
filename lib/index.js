import { logger } from 'node-karin';
import { Root } from './Root.js';
/** 请不要在这编写插件 不会有任何效果~ */
logger.info(`${logger.violet(`[插件:${Root.pluginVersion}]`)} ${logger.green(Root.pluginName)} 初始化完成~`);
