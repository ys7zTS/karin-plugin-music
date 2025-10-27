import { md5 } from '../modules/common.js';
import crypto from 'node:crypto';
class AES {
    /**
     * 生成随机密钥
     */
    static RandomKey(length = 16) {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }
    /**
     * AES 加密
     * @param data 要加密的数据
     * @param options
     */
    static encrypt(data, opt = {}) {
        if (typeof data === 'object')
            data = JSON.stringify(data);
        const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
        const randomKey = opt.key || this.RandomKey().toLowerCase();
        const key = md5(randomKey).substring(0, 32);
        const iv = key.substring(key.length - 16, key.length);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const dest = Buffer.concat([cipher.update(buffer), cipher.final()]);
        return { str: dest.toString('hex'), key: randomKey };
    }
}
export default AES;
