import crypto from 'crypto'
import CryptoJS from 'crypto-js'

type AESMode = 'node' | 'kugou'

interface AESOptions {
  mode?: AESMode
  key?: string
}

/**
 * AES 加密工具类
 * 支持：
 *  - mode: 'node'（Node.js 原生 crypto）
 *  - mode: 'kugou'（与酷狗官方 AES 加密结果一致）
 */
class AES {
  /**
   * 生成随机密钥
   */
  static generateRandomKey (length = 16): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
  }

  /**
   * Node 模式：派生 key 和 iv
   */
  static deriveNodeKeyAndIV (key: string) {
    const keyHash = crypto.createHash('md5').update(key).digest('hex')
    const derivedKey = keyHash.substring(0, 32)
    const iv = crypto.createHash('md5').update(derivedKey).digest('hex')
    return { derivedKey, iv }
  }

  /**
   * 酷狗模式：与官方一致
   */
  static deriveKugouKeyAndIV (key: string) {
    const keyHash = CryptoJS.MD5(key).toString().toUpperCase()
    const aesKey = CryptoJS.enc.Utf8.parse(keyHash.substring(0, 32))
    const iv = CryptoJS.enc.Utf8.parse(keyHash.substring(keyHash.length - 16))
    return { aesKey, iv, keyHash }
  }

  /**
   * AES 加密
   * @param data 要加密的数据
   * @param options 选项：{ mode?: 'node' | 'kugou', key?: string }
   */
  static encrypt (data: any, options: AESOptions = {}) {
    const { mode = 'node', key = AES.generateRandomKey(16) } = options
    const dataString = typeof data === 'string' ? data : JSON.stringify(data)

    if (mode === 'kugou') {
      // 🎵 酷狗模式
      const { aesKey, iv } = AES.deriveKugouKeyAndIV(key)
      const encrypted = CryptoJS.AES.encrypt(dataString, aesKey, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      return { key, encryptedStr: encrypted.ciphertext.toString(CryptoJS.enc.Hex) }
    } else {
      // 🧩 Node 模式
      const { derivedKey, iv } = AES.deriveNodeKeyAndIV(key)
      const cipher = crypto.createCipheriv(
        'aes-128-cbc',
        Buffer.from(derivedKey, 'hex'),
        Buffer.from(iv, 'hex')
      )
      cipher.setAutoPadding(true)
      let encrypted = cipher.update(dataString, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      return { key, encryptedStr: encrypted }
    }
  }

  /**
   * AES 解密
   * @param encryptedData 加密的十六进制字符串
   * @param options 选项：{ mode?: 'node' | 'kugou', key: string }
   */
  static decrypt (encryptedData: string, options: AESOptions & { key: string }) {
    const { mode = 'node', key } = options

    if (mode === 'kugou') {
      const { aesKey, iv } = AES.deriveKugouKeyAndIV(key)
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(encryptedData)
      })

      const decrypted = CryptoJS.AES.decrypt(cipherParams, aesKey, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })

      return decrypted.toString(CryptoJS.enc.Utf8)
    } else {
      const { derivedKey, iv } = AES.deriveNodeKeyAndIV(key)
      const decipher = crypto.createDecipheriv(
        'aes-128-cbc',
        Buffer.from(derivedKey, 'hex'),
        Buffer.from(iv, 'hex')
      )
      decipher.setAutoPadding(true)
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    }
  }
}

export default AES
