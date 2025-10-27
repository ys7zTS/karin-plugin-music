import { ApiType } from '../types/core.js';
export declare class KugoApi implements ApiType {
    appid: number;
    mid: string;
    ck: string;
    token: string;
    userid: number;
    dfid: string;
    srcappid: number;
    cfg: {
        ck: string;
        mid: string;
        token: string;
        dfid: string;
        userid: number;
    };
    constructor();
    static create(): Promise<KugoApi>;
    init(): Promise<void>;
    search(search: string, page?: number, pageSize?: number): Promise<any>;
    getSongInfo(albumId: string, albumAudioId: string, hash: any): Promise<any>;
    getGuid(): Promise<string>;
    /** 生成Sign
     * @param params 参数对象
     * @param ispost 是否为POST请求
     */
    getSign(params: Record<string, any>, ispost?: boolean): Promise<string>;
    getDfid(): Promise<any>;
    getLoginQrcode(): Promise<{
        qrcode: any;
        qrcode_img: any;
    }>;
    getUserInfoQrcode(qrcode: string): Promise<any>;
    /** 通过token获取登录ck */
    getLoginByToken(token?: string, userid?: number): Promise<{
        data: any;
        cookies: string[] | undefined;
    }>;
    writeCookie(cookies: string[]): void;
}
