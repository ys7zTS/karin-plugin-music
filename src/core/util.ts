import { BinaryLike, createHash } from 'crypto'

export const md5 = (str: BinaryLike) => createHash('md5').update(str).digest('hex')
