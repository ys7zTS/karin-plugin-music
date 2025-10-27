declare class RSA {
    static hexToBigInt(hex: string): bigint;
    static textToBytes(text: string): Uint8Array;
    /**
     * PKCS#1 v1.5 padding (手动实现)
     * @param data 原始数据
     * @param keySize 密钥长度 (字节)
     */
    static pkcs1Pad(data: Uint8Array, keySize?: number): Uint8Array;
    /**
     * RSA 加密（返回十六进制字符串）
     */
    static encrypt(data: any): string;
    /** 大整数转字节数组 */
    static bigIntToBytes(num: bigint, length?: number): Uint8Array;
    /** 字节数组转大整数 */
    static bytesToBigInt(bytes: Uint8Array): bigint;
    /** 模幂运算（快速幂算法） */
    static modPow(base: bigint, exp: bigint, mod: bigint): bigint;
    /** 大整数转十六进制 */
    static bigIntToHex(num: bigint): string;
}
export default RSA;
