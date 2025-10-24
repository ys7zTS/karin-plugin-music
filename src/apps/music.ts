import { Cfg } from '@/config'
import { KugoApi } from '@/core/kugou'
import { formatDuration } from '@/modules/common'
import { render } from '@/modules/render'
import { Root } from '@/Root'
import karin, { segment } from 'node-karin'

const timeout = new Map<string, NodeJS.Timeout>()
export const music = karin.command(/^#(qq|酷狗)?点歌(\S+)(?:\s+(\d+))?$/i, async (m) => {
  const reg = /^#(qq|酷狗)?点歌(.*)$/
  let [, platform, keyword, page = 1] = m.msg.match(reg) || []
  if (!keyword.trim()) return m.reply('歌名不能为空')
  if (!platform) platform = Cfg.getConfig.defaultPlatform
  const client = await KugoApi.create()
  switch (platform.toLowerCase()) {
    case '酷狗': {
      const i = await client.search(keyword.trim(), Number(page), 10)
      const data: {
        keyword: string,
        platform: string,
        songs: {
          title: string,
          artist: string,
          cover: string,
          duration: string,
          vip?: boolean
        }[]
      } = {
        keyword: keyword.trim(),
        platform,
        songs: []
      }
      for (const e of i) {
        data.songs.push({
          title: e.songname,
          artist: e.singername,
          cover: (e.trans_param.union_cover as string)?.replace(/{size}/g, '300') || '',
          duration: formatDuration(e.duration)
        })
      }
      const img = await render('music/index', { data })
      m.reply(img)
      const info = await event(`${m.isGroup ? m.groupId : 'friend:' + m.userId}`, i, client)
      if (info) {
        m.reply(segment.record((info as any).play_url))
      }
      return true
    }
    default:
      return m.reply('目前仅支持 酷狗 点歌哦~')
  }
}, { name: '点歌' })

export const test = karin.command(/^#听([1-9]|10)$/, async (m) => {
  const id = m.msg.replace(/^#听([1-9]|10)$/, '$1')
  if (m.isGroup) {
    karin.emit(`${Root.pluginName}:song:${m.groupId}`, { id, rm: false })
    return true
  }
  karin.emit(`${Root.pluginName}:song:friend:${m.userId}`, { id, rm: false })
  return true
})

const event = (id: string, i: any, client: KugoApi) => {
  if (timeout.has(id)) {
    clearTimeout(timeout.get(id))
    timeout.delete(id)
  }
  karin.emit(`${Root.pluginName}:song:${id}`, { rm: true })
  return new Promise(resolve => {
    const time = setTimeout(() => {
      karin.emit(`${Root.pluginName}:song:${id}`, { rm: true })
      timeout.delete(id)
      resolve(false)
    }, 60000)
    timeout.set(id, time)
    karin.once(`${Root.pluginName}:song:${id}`, async (data) => {
      if (data.rm) return true
      if (timeout.has(id)) {
        clearTimeout(timeout.get(id))
        timeout.delete(id)
      }
      const song = i[data.id - 1]
      const info = await client.getSongInfo(song.album_id, song.album_audio_id, song.hash)
      resolve(info)
    })
  })
}
