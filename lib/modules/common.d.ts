import { BinaryLike } from 'crypto';
export declare const delay: (ms: number) => Promise<unknown>;
export declare const formatDuration: (seconds: number) => string;
export declare const md5: (str: BinaryLike) => string;
