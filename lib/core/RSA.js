import crypto from 'crypto';
/**
 * 手动实现兼容酷狗的 RSA 加密（PKCS#1 v1.5）
 * 与 node-rsa 结果不同，但与酷狗前端加密一致
 */
const rsaPublicKey = 'B1B1EC76A1BBDBF0D18E8CD9A87E53FA3881E2F004C67C9DDA2CA677DBEFA3D61DF8463FE12D84FF4B4699E02C9D41CAB917F5A8FB9E35580C4BDF97763A0420A476295D763EE10174E6F9EBF7DF8A77BA5B20CDA4EE705DEF5BBA3C88567B9656E52C9CD5CD95CA735FF2D25F762B133273EEEB7B4F3EA8B6DA29040F3B67CD';
class RSA {
    static hexToBigInt(hex) {
        return BigInt('0x' + hex);
    }
    static textToBytes(text) {
        return new TextEncoder().encode(text);
    }
    /**
     * PKCS#1 v1.5 padding (手动实现)
     * @param data 原始数据
     * @param keySize 密钥长度 (字节)
     */
    static pkcs1Pad(data, keySize = 128) {
        if (data.length > keySize - 11) {
            throw new Error('Data too long for RSA encryption');
        }
        const paddingLength = keySize - data.length - 3;
        const padding = new Uint8Array(paddingLength);
        // 填充随机非零字节
        for (let i = 0; i < paddingLength; i++) {
            let rnd = 0;
            while (rnd === 0)
                rnd = crypto.randomBytes(1)[0];
            padding[i] = rnd;
        }
        return Uint8Array.from([0x00, 0x02, ...padding, 0x00, ...data]);
    }
    /**
     * RSA 加密（返回十六进制字符串）
     */
    static encrypt(data) {
        const json = typeof data === 'string' ? data : JSON.stringify(data);
        const keyBytes = RSA.hexToBigInt(rsaPublicKey);
        const e = BigInt(65537);
        const mBytes = RSA.textToBytes(json);
        const padded = RSA.pkcs1Pad(mBytes, 128); // 1024-bit key => 128 bytes
        const m = RSA.bytesToBigInt(padded);
        // 模幂运算：c = m^e mod n
        const c = RSA.modPow(m, e, keyBytes);
        return RSA.bigIntToHex(c);
    }
    /** 大整数转字节数组 */
    static bigIntToBytes(num, length = 128) {
        const hex = num.toString(16).padStart(length * 2, '0');
        return Uint8Array.from(Buffer.from(hex, 'hex'));
    }
    /** 字节数组转大整数 */
    static bytesToBigInt(bytes) {
        return BigInt('0x' + Buffer.from(bytes).toString('hex'));
    }
    /** 模幂运算（快速幂算法） */
    static modPow(base, exp, mod) {
        let result = 1n;
        base %= mod;
        while (exp > 0n) {
            if (exp & 1n)
                result = (result * base) % mod;
            base = (base * base) % mod;
            exp >>= 1n;
        }
        return result;
    }
    /** 大整数转十六进制 */
    static bigIntToHex(num) {
        let hex = num.toString(16);
        if (hex.length % 2)
            hex = '0' + hex;
        return hex;
    }
}
export default RSA;
