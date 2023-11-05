/** 播放器状态 */
export enum PlayerStatus {
  /** 无状态 */
  None = -2,
  /** 加载失败 */
  Failed = -1,
  /** 加载中 */
  Loading = 0,
  /** 播放中 */
  Playing = 1,
  /** 暂停中 */
  Paused = 2,
  /** 播放完 */
  Ended = 3
}

/** 播放器信息 */
export interface Player {
  /** 音量 0-100 */
  volume: number
  /** 静音 */
  muted: boolean
  /** 总进度 */
  duration: number
  /** 缓冲进度 */
  bufferTime: number
  /** 当前进度 */
  currentTime: number
  /** 状态  */
  status: PlayerStatus

  /** 播放速度 */
  playbackSpeed: number
  /** 当前清晰度 */
  currentQuality: number | string

  /** 镜面翻转 */
  mirror: boolean
  /** 自动播放 */
  autoplay: boolean
  /** 循环播放 */
  loop: boolean
  /** 全屏 */
  fullScreen: boolean
  /** 网页全屏 */
  webFullScreen: boolean
  /** 画中画 */
  pictureInPicture: boolean
}
