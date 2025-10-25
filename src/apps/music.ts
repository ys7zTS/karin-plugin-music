import { api } from '@/core'
import { Root } from '@/Root'
import karin from 'node-karin'

export const music = karin.command(/^#(qq|酷狗)?点歌(.*)$/i, async (m) => {
  const reg = /^#(qq|酷狗)?点歌(.*)$/i
  const [, platform, keyword] = m.msg.match(reg) || []
  await api.search(`${Root.pluginName}:song:${m.isGroup ? m.groupId : 'friend:' + m.userId}`, m, keyword, { platform })
}, { name: '点歌' })

export const test = karin.command(/^#听([1-9]|10)$/, async (m) => {
  const id = m.msg.replace(/^#听([1-9]|10)$/, '$1')
  await api.PlayMusic(`${Root.pluginName}:song:${m.isGroup ? m.groupId : 'friend:' + m.userId}`, Number(id), m)
})

export const PlaylistPage = karin.command(/^#歌单(0*[1-9]\d*)$/, async (m) => {
  const page = Number(m.msg.replace(/^#歌单(0*[1-9]\d*)$/, '$1'))
  await api.search(`${Root.pluginName}:song:${m.isGroup ? m.groupId : 'friend:' + m.userId}`, m, undefined, { page })
})
