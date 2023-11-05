// 清晰度
export type Quality = 1 | 240 | 360 | 380 | 480 | 720 | 1080 | 1440 | 2160

// 类型
export type VideoType = "mp4" | "hls" | "dash" | "flv" | "auto"

// 清晰度
export type QualityType = {
  [key in Quality]?: {
    url: string
    name?: string
    type: string
  }
}

// 资源信息
export interface VideoResource {
  cover?: string
  src?: string
  type?: VideoType
  thumbnails?: string
  // 自动解析清晰度（仅支持流媒体 hls、dash）
  analyzeQuality?: boolean
  defaultQuality?: Quality
}

// 播放器配置
export interface MioOption {
  volume?: number
  autoplay?: boolean
  playbackSpeed?: number[]
  preload?: "none" | "auto" | "metadata"
  video: VideoResource
  customType?: boolean
}
