import dashjs from "dashjs"

const useDash = () => {
  const dash = dashjs.MediaPlayer().create()

  /** 视频初始化 */
  const dashInit = (player: HTMLVideoElement, src: string, autoplay = false, startTime = 0) => {
    dash.initialize(player, src, autoplay, startTime)
  }

  /** 获取轨道列表 */
  const getBitrateList = () => {
    const qualityList: number[] = []
    if (dash.isReady())
      // 获取当前轨道比特率列表
      dash.getBitrateInfoListFor("video").forEach((item) => {
        qualityList.push(+item.height!)
      })
    return qualityList
  }

  /** 切换轨道（清晰度） */
  const setBitrate = (quality: number) => {
    if (!dash.isReady()) return
    const bitrateList = dash.getBitrateInfoListFor("video")
    const qualityIndex = bitrateList.findIndex((item) => item.height === quality)
    // 自动选择清晰度 开启ABR
    if (qualityIndex === -1 && quality === 1) {
      dash.updateSettings({
        streaming: {
          abr: {
            autoSwitchBitrate: {
              video: true,
              audio: true
            }
          }
        }
      })
    }
    // 手动选择清晰度
    else {
      dash.updateSettings({
        streaming: {
          abr: {
            autoSwitchBitrate: {
              video: false,
              audio: false
            }
          }
        }
      })
      dash.setQualityFor("video", qualityIndex, false)
    }
  }

  /** 销毁 */
  const destroyDash = () => {
    // if (dash.isReady()) dash.destroy()
    if (dash.isReady()) dash.reset()
  }

  return {
    dash,
    destroyDash,
    dashInit,
    setBitrate,
    getBitrateList
  }
}
export default useDash
