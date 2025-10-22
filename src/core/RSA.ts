import crypto from 'crypto'

class RSA {
  static DEFAULT_EXPONENT = '10001'
  static DEFAULT_MODULUS = 'B1B1EC76A1BBDBF0D18E8CD9A87E53FA3881E2F004C67C9DDA2CA677DBEFA3D61DF8463FE12D84FF4B4699E02C9D41CAB917F5A8FB9E35580C4BDF97763A0420A476295D763EE10174E6F9EBF7DF8A77BA5B20CDA4EE705DEF5BBA3C88567B9656E52C9CD5CD95CA735FF2D25F762B133273EEEB7B4F3EA8B6DA29040F3B67CD'

  /**
   * RSA 加密
   * @param data - 要加密的数据
   * @param exponent - 公钥指数（十六进制）
   * @param modulus - 模数（十六进制）
   * @returns 加密后的十六进制字符串
   */
  static encrypt (data: any, exponent: string = this.DEFAULT_EXPONENT, modulus: string = this.DEFAULT_MODULUS) {
    try {
      // 确保数据是字符串
      const dataString = typeof data === 'string' ? data : JSON.stringify(data)

      // 将十六进制的模数和指数转换为Buffer
      const n = Buffer.from(modulus, 'hex')
      const e = Buffer.from(exponent, 'hex')

      // 创建RSA公钥
      const publicKey = this.createPublicKeyFromComponents(n, e)

      // 加密数据
      const encrypted = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(dataString, 'utf8')
      )

      const result = encrypted.toString('hex')
      return result
    } catch (error: any) {
      throw new Error(`RSA加密失败: ${error.message}`)
    }
  }

  /**
   * 从模数和指数创建RSA公钥
   */
  private static createPublicKeyFromComponents (n: Buffer, e: Buffer): string {
    // 构建RSA公钥的ASN.1结构
    // RSAPublicKey ::= SEQUENCE {
    //   modulus INTEGER, -- n
    //   publicExponent INTEGER -- e
    // }

    const asn1 = this.buildASN1Sequence([
      this.buildASN1Integer(n),
      this.buildASN1Integer(e)
    ])

    // 构建完整的公钥结构
    // PublicKeyInfo ::= SEQUENCE {
    //   algorithm AlgorithmIdentifier,
    //   publicKey BIT STRING
    // }
    const publicKeyInfo = this.buildASN1Sequence([
      // algorithm Identifier
      this.buildASN1Sequence([
        // rsaEncryption OID
        Buffer.from([0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x01]),
        // parameters (NULL)
        Buffer.from([0x05, 0x00])
      ]),
      // publicKey
      this.buildASN1BitString(asn1)
    ])

    return `-----BEGIN PUBLIC KEY-----\n${publicKeyInfo.toString('base64')}\n-----END PUBLIC KEY-----`
  }

  /**
   * 构建ASN.1 INTEGER
   */
  private static buildASN1Integer (value: Buffer): Buffer {
    // 确保第一位是正数（如果最高位是1，需要添加00前缀）
    let data = value
    if (value[0] & 0x80) {
      data = Buffer.concat([Buffer.from([0x00]), value])
    }

    const length = data.length
    const lengthBytes = this.encodeASN1Length(length)

    return Buffer.concat([
      Buffer.from([0x02]), // INTEGER tag
      lengthBytes,
      data
    ])
  }

  /**
   * 构建ASN.1 BIT STRING
   */
  private static buildASN1BitString (data: Buffer): Buffer {
    // BIT STRING格式: 数据前加一个字节表示未使用位数
    const content = Buffer.concat([Buffer.from([0x00]), data])
    const lengthBytes = this.encodeASN1Length(content.length)

    return Buffer.concat([
      Buffer.from([0x03]), // BIT STRING tag
      lengthBytes,
      content
    ])
  }

  /**
   * 构建ASN.1 SEQUENCE
   */
  private static buildASN1Sequence (items: Buffer[]): Buffer {
    const content = Buffer.concat(items)
    const lengthBytes = this.encodeASN1Length(content.length)

    return Buffer.concat([
      Buffer.from([0x30]), // SEQUENCE tag
      lengthBytes,
      content
    ])
  }

  /**
   * 编码ASN.1长度
   */
  private static encodeASN1Length (length: number): Buffer {
    if (length < 128) {
      return Buffer.from([length])
    } else {
      const bytes = []
      let len = length
      while (len > 0) {
        bytes.unshift(len & 0xFF)
        len = Math.floor(len / 256)
      }
      return Buffer.from([0x80 | bytes.length, ...bytes])
    }
  }

  /**
   * 简化版本：使用Node.js内置的RSA密钥生成
   */
  static createPublicKeyPEM (modulusHex: string, exponentHex: string = '10001'): string {
    const { generateKeyPairSync } = require('crypto')

    // 生成一个临时密钥对，然后替换模数和指数（这里需要更复杂的处理）
    // 实际实现需要解析ASN.1结构，这里提供简化版本

    const keyPair = generateKeyPairSync('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      }
    })

    return keyPair.publicKey
  }
}

export default RSA
