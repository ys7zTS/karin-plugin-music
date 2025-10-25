import { Cfg } from '@/config'
import { KugoApi } from '@/core/kugou'
import { delay } from '@/modules/common'
import karin, { segment } from 'node-karin'

export const kugouQrcode = karin.command(/^#酷狗(音乐)?扫码登录$/, async (m) => {
  const client = await KugoApi.create()
  const qr = await client.getLoginQrcode()
  if (!qr.qrcode_img || !qr.qrcode) return m.reply('获取二维码失败，请稍后再试~')
  const msg = await m.reply(['请使用酷狗音乐 App 扫码登录~', segment.image(qr.qrcode_img)])
  let tip = !1

  while (true) {
    const res = await client.getUserInfoQrcode(qr.qrcode)
    switch (res.status) {
      case 1:
        /** 等待扫码 */
        break
      case 2:
        if (tip) break
        tip = !0
        await m.bot.recallMsg(m.contact, msg.messageId)
        await m.reply(`二维码已扫码，请在手机上确认登录~\n当前扫码用户(${res.nickname})`)
        client.userid = res.userid
        break
      case 4: {
        const token = res.token
        const ress = await client.getLoginByToken(token)
        Cfg.setCfg('kugou.token', token)
        Cfg.setCfg('kugou.userid', ress.data.userid)
        client.writeCookie(ress.cookies!)
        const msg = [
          '登陆成功~\n',
          `用户名: ${ress.data.nickname}\n`,
          `是否VIP: ${ress.data.is_vip ? '是' : '否'}\n`,
          `VIP到期时间: ${ress.data.vip_end_time}\n`
        ]
        return m.reply(msg)
      }
      default:
        await m.bot.recallMsg(m.contact, msg.messageId)
        await m.reply('二维码过期，请重新发送#酷狗扫码登录', { reply: true })
        return false
    }
    await delay(1000)
  }
}, { perm: 'master' })
