import { BinaryLike, createHash } from 'crypto'

export const delay = (ms: number) => new Promise(resolve => { setTimeout(resolve, ms) })

export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  // 补零处理
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0')

  return `${formattedMinutes}:${formattedSeconds}`
}

export const md5 = (str: BinaryLike) => createHash('md5').update(str).digest('hex')
