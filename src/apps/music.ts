import { Cfg } from '@/config'
import AES from '@/core/AES'
import { KugoApi } from '@/core/kugou'
import karin, { logger } from 'node-karin'

export const music = karin.command(/^#(qq|酷狗)?点歌(.*)$/i, async (m) => {
  const reg = /^#(qq|酷狗)?点歌(.*)$/
  let [, platform, keyword] = m.msg.match(reg) || []
  if (!platform) platform = Cfg.getConfig.general.defaule
  switch (platform.toLowerCase()) {
    case '酷狗': {
      const client = await new KugoApi().search(keyword.trim())
      logger.info(client)
      break
    }
    case 'qq':
      break
    default:
      return m.reply('目前仅支持 QQ 和 酷狗 点歌哦~')
  }
}, { name: '点歌' })

export const test = karin.command(/test/, async (e) => {
  const a = AES.encrypt(JSON.stringify({ token: '123' }))
  logger.info(a)
})
