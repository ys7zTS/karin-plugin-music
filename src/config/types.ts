export interface CfgType {
  /** 通用配置 */
  general: {
    /** 点歌默认平台 */
    defaule: 'qq'
  }
  /** QQ音乐配置 */
  qq: {
    /** cookies */
    ck: string
  },
  kugou: {
    /** cookies */
    ck: string
    /** mid */
    mid: string
    /** 鉴权token */
    token: string
    dfid: string
    userid: number
  }
}
