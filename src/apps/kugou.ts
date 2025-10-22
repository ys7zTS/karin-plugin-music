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
        client.writeToken(token)
        return m.reply(`登录成功~\n当前登录用户(${ress.nickname})`)
      }
      default:
        return
    }
    await delay(1000)
  }
}, { perm: 'master' })
