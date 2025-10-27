import { ApiType } from '@/types/core'
import axios from 'node-karin/axios'
import { Cfg } from '@/config'
import AES from './AES'
import RSA from './RSA'
import { md5 } from '@/modules/common'
export class KugoApi implements ApiType {
  appid: number
  mid: string
  ck: string
  token: string
  userid: number
  dfid: string
  srcappid: number
  cfg: { ck: string; mid: string; token: string; dfid: string; userid: number }
  constructor () {
    this.cfg = Cfg.getConfig.kugou
    this.appid = 1014
    this.srcappid = 2919
    this.mid = this.cfg.mid
    this.ck = this.cfg.ck
    this.token = this.cfg.token
    this.userid = this.cfg.userid
    this.dfid = this.cfg.dfid
  }

  static async create (): Promise<KugoApi> {
    const i = new KugoApi()
    await i.init()
    return i
  }

  async init () {
    if (!this.mid) {
      const guid = md5(await this.getGuid())
      this.mid = guid
      Cfg.setCfg('kugou.mid', guid)
    }
    if (!this.dfid) {
      this.dfid = await this.getDfid()
      Cfg.setCfg('kugou.dfid', this.dfid)
    }
  }

  async search (search: string, page = 1, pageSize = 10) {
    try {
      const { data } = await axios.get(`http://msearchcdn.kugou.com/api/v3/search/song?page=${page}&pagesize=${pageSize}&keyword=${encodeURI(search)}`)
      return data.data.info
    } catch (err) {
      return null
    }
  }

  async getSongInfo (albumId: string, albumAudioId: string, hash: any) {
    const params = {
      appid: this.appid,
      clienttime: Date.now(),
      clientver: 20000,
      dfid: this.dfid,
      album_id: albumId,
      album_audio_id: albumAudioId,
      hash,
      mid: this.mid,
      platid: 4,
      srcappid: this.srcappid,
      token: this.token,
      userid: this.userid,
      uuid: this.mid,
      signature: ''
    }
    params.signature = await this.getSign(params)
    const { data } = await axios.get('https://wwwapi.kugou.com/play/songinfo', {
      params
    })
    if (!data.data || typeof data.data === 'string') throw new Error(JSON.stringify(data))
    return data.data
  }

  async getGuid () {
    function e () {
      return (65536 * (1 + Math.random()) | 0).toString(16).substring(1)
    }
    return e() + e() + '-' + e() + '-' + e() + '-' + e() + '-' + e() + e() + e()
  }

  /** 生成Sign
   * @param params 参数对象
   * @param ispost 是否为POST请求
   */
  async getSign (params: Record<string, any>, ispost = false) {
    const { signature, ...p } = params
    if (ispost) {
      const str = Object.keys(p)
        .map(i => p[i])
        .sort()
        .join('')
      const hash = this.appid + str + this.appid
      const sign = md5(hash)
      return sign
    } else {
      const salt = 'NVPh5oo715z5DIWAeQlhMDsWXXQV4hwt'
      const str = Object.keys(p)
        .sort()
        .map(i => `${i}=${p[i] ?? ''}`)
        .join('')
      const hash = salt + str + salt
      const sign = md5(hash).toUpperCase()
      return sign
    }
  }

  async getDfid () {
    const params = {
      appid: 1014,
      platid: 4,
      clientver: 0,
      clienttime: new Date().getTime(),
      signature: '',
      mid: this.mid,
      userid: this.userid,
      uuid: this.mid,
      'p.token': ''
    }
    params.signature = await this.getSign(params, true)
    const { data } = await axios.post('https://userservice.kugou.com/risk/v1/r_register_dev', btoa('{"uuid":""}'), {
      params
    })
    const { data: { dfid } } = data
    if (!dfid) throw new Error(`获取dfid失败${JSON.stringify(data)}`)
    return dfid
  }

  async getLoginQrcode () {
    const params: Record<string, any> = {
      appid: this.appid,
      clientver: 8131,
      clienttime: Date.now(),
      mid: this.mid,
      uuid: this.mid,
      dfid: this.dfid,
      type: 1,
      plat: 4,
      qrcode_txt: 'https://h5.kugou.com/apps/loginQRCode/html/index.html?appid=1014&',
      srcappid: this.srcappid
    }
    params.signature = await this.getSign(params)
    const { data } = await axios.get('https://login-user.kugou.com/v2/qrcode', {
      params
    })
    // eslint-disable-next-line camelcase
    const { data: { qrcode, qrcode_img } } = data
    // eslint-disable-next-line camelcase
    if (!qrcode || !qrcode_img) throw new Error(`获取登录二维码失败\n${JSON.stringify(data)}`)
    // eslint-disable-next-line camelcase
    return { qrcode, qrcode_img }
  }

  async getUserInfoQrcode (qrcode: string) {
    const params: Record<string, any> = {
      appid: this.appid,
      clientver: 8131,
      clienttime: new Date().getTime(),
      mid: this.mid,
      uuid: this.mid,
      dfid: this.dfid,
      plat: 4,
      qrcode,
      srcappid: this.srcappid,
    }
    params.signature = await this.getSign(params)
    const { data } = await axios.get('https://login-user.kugou.com/v2/get_userinfo_qrcode', {
      params
    })
    if (typeof data.data === 'string') {
      throw new Error(data.data)
    }
    return data.data
  }

  /** 通过token获取登录ck */
  async getLoginByToken (token: string = this.token, userid: number = this.userid) {
    const now = Date.now()
    const e = AES.encrypt(JSON.stringify({ token }))
    const t = RSA.encrypt(JSON.stringify({
      clienttime_ms: now,
      key: e.key
    }))
    const params = {
      appid: this.appid,
      clientver: 1000,
      clienttime: Math.floor(now / 1000),
      mid: this.mid,
      uuid: this.mid,
      dfid: this.dfid,
      dev: 'web',
      userid,
      plat: 4,
      clienttime_ms: now,
      pk: t,
      params: e.str,
      srcappid: this.srcappid,
      signature: ''
    }
    // params.signature = md5(`1014${Object.values(params).sort().join('')}1014`)
    params.signature = await this.getSign(params)
    const { data, headers } = await axios.post('https://loginservice.kugou.com/v1/login_by_token_get', null, {
      params,
      withCredentials: !0,
    })
    if (!data.data || typeof data.data === 'string') throw new Error(JSON.stringify(data))
    return { data: data.data, cookies: headers['set-cookie'] }
  }

  writeCookie (cookies: string[]) {
    const i: string[] = []
    cookies.forEach(e => {
      const ck = e.split(';')[0].trim()
      if (ck.includes('=')) {
        i.push(ck)
      }
    })
    Cfg.setCfg('kugou.ck', i.join('; '))
  }
}
