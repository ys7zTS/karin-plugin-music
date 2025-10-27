/** 默认参数 */
/**
 * 渲染
 * @param name 文件名称 不包含`.html`
 * @param params 渲染参数
 */
export declare const render: (name: string, params: Record<string, any>) => Promise<import("node-karin").ImageElement>;
