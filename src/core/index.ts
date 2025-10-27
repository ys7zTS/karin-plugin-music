import { logger, Message, segment } from 'node-karin'
import { KugoApi } from './kugou'
import { EventOpt } from '@/types/core'
import { Cfg } from '@/config'
import { formatDuration } from '@/modules/common'
import { render } from '@/modules/render'
import path from 'node:path'
import { Root } from '@/Root'

interface CLIMap {
  timeout: NodeJS.Timeout
  client: KugoApi
  keyword: string
  platform: string
  songs: any
}

class Api {
  private cli: Map<string, CLIMap>
  constructor () {
    this.cli = new Map()
  }

  async search (key: string, m: Message, keyword?: string, opt: EventOpt = {}) {
    try {
      const cli = this.cli.get(key)
      if (cli) {
        clearTimeout(cli.timeout)
        this.cli.delete(key)
      }
      let client
      if (opt.page) {
        if (!cli) return false
        client = cli.client
        keyword = cli.keyword
      } else client = await KugoApi.create()
      if (!keyword) return m.reply('歌名不能为空')
      opt.platform = opt.platform || Cfg.getConfig.defaultPlatform
      const info = await client.search(keyword, opt.page || 1, 10)
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
        platform: opt.platform,
        songs: []
      }
      for (const e of info) {
        data.songs.push({
          title: e.songname,
          artist: e.singername,
          cover: (e.trans_param.union_cover as string)?.replace(/{size}/g, '300') || path.join(Root.pluginPath, 'resources', 'music', 'default.png'),
          duration: formatDuration(e.duration)
        })
      }
      const img = await render('music/index', { data })
      await m.reply(img)
      this.cli.set(key, {
        timeout: setTimeout(() => {
          this.cli.delete(key)
        }, 60000),
        client,
        keyword,
        platform: opt.platform,
        songs: info
      })
      return true
    } catch (err) {
      logger.error(err)
      m.reply('处理错误')
    }
  }

  async PlayMusic (key: string, id: number, m: Message) {
    try {
      const cli = this.cli.get(key)
      if (!cli) return false
      clearTimeout(cli.timeout)
      this.cli.delete(key)
      const song = cli.songs[id - 1]
      const info = await cli.client.getSongInfo(song.album_id, song.album_audio_id, song.hash)
      m.reply(segment.record((info as any).play_url))
    } catch (err) {
      logger.error(err)
      m.reply('播放音乐错误')
    }
  }
}

export const api = new Api()
