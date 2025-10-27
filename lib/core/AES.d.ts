interface AESOptions {
    key?: string;
    iv?: string;
}
declare class AES {
    /**
     * 生成随机密钥
     */
    static RandomKey(length?: number): string;
    /**
     * AES 加密
     * @param data 要加密的数据
     * @param options
     */
    static encrypt(data: any, opt?: AESOptions): {
        str: string;
        key: string;
    };
}
export default AES;
