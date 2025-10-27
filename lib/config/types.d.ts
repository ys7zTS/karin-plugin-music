export interface CfgType {
    /** 点歌默认平台 */
    defaultPlatform: 'qq' | '酷狗';
    /** QQ音乐配置 */
    qq: {
        /** cookies */
        ck: string;
    };
    kugou: {
        /** cookies */
        ck: string;
        /** mid */
        mid: string;
        /** 鉴权token */
        token: string;
        dfid: string;
        userid: number;
    };
}
