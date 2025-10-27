import { Message } from 'node-karin';
import { EventOpt } from '../types/core.js';
declare class Api {
    private cli;
    constructor();
    search(key: string, m: Message, keyword?: string, opt?: EventOpt): Promise<boolean | import("node-karin").SendMsgResults | undefined>;
    PlayMusic(key: string, id: number, m: Message): Promise<false | undefined>;
}
export declare const api: Api;
export {};
