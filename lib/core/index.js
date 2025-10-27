import { logger, segment } from 'node-karin';
import { KugoApi } from './kugou.js';
import { Cfg } from '../config/index.js';
import { formatDuration } from '../modules/common.js';
import { render } from '../modules/render.js';
import path from 'node:path';
import { Root } from '../Root.js';
class Api {
    cli;
    constructor() {
        this.cli = new Map();
    }
    async search(key, m, keyword, opt = {}) {
        try {
            const cli = this.cli.get(key);
            if (cli) {
                clearTimeout(cli.timeout);
                this.cli.delete(key);
            }
            let client;
            if (opt.page) {
                if (!cli)
                    return false;
                client = cli.client;
                keyword = cli.keyword;
            }
            else
                client = await KugoApi.create();
            if (!keyword)
                return m.reply('歌名不能为空');
            opt.platform = opt.platform || Cfg.getConfig.defaultPlatform;
            const info = await client.search(keyword, opt.page || 1, 10);
            const data = {
                keyword: keyword.trim(),
                platform: opt.platform,
                songs: []
            };
            for (const e of info) {
                data.songs.push({
                    title: e.songname,
                    artist: e.singername,
                    cover: e.trans_param.union_cover?.replace(/{size}/g, '300') || path.join(Root.pluginPath, 'resources', 'music', 'default.png'),
                    duration: formatDuration(e.duration)
                });
            }
            const img = await render('music/index', { data });
            await m.reply(img);
            this.cli.set(key, {
                timeout: setTimeout(() => {
                    this.cli.delete(key);
                }, 60000),
                client,
                keyword,
                platform: opt.platform,
                songs: info
            });
            return true;
        }
        catch (err) {
            logger.error(err);
            m.reply('处理错误');
        }
    }
    async PlayMusic(key, id, m) {
        try {
            const cli = this.cli.get(key);
            if (!cli)
                return false;
            clearTimeout(cli.timeout);
            this.cli.delete(key);
            const song = cli.songs[id - 1];
            const info = await cli.client.getSongInfo(song.album_id, song.album_audio_id, song.hash);
            m.reply(segment.record(info.play_url));
        }
        catch (err) {
            logger.error(err);
            m.reply('播放音乐错误');
        }
    }
}
export const api = new Api();
