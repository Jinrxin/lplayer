import Hls from "hls.js"

const useHls = () => {
  const hls = new Hls()

  /** 视频初始化 */
  const hlsInit = (player: HTMLVideoElement, src: string, autoplay = false) => {
    // hls.destroy()
    if (Hls.isSupported()) {
      hls.loadSource(src)
      hls.attachMedia(player)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // console.log(autoplay)
        // console.log("加载成功")
        player.play()
      })
      // 监听出错事件
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log("加载失败", event, data)
      })
    } else {
      console.log("不支持的格式")
      return
    }
  }

  /** 获取视频清晰度 */
  const getQualityList = () => {
    const qualityList: number[] = []
    hls.levels.forEach((item) => {
      qualityList.push(+item.name!)
    })
    return qualityList
  }

  /** 修改视频清晰度 */
  const setQuality = (quality: number) => {
    const level = hls.levels.findIndex((item) => item.name === quality.toString())
    hls.currentLevel = level
  }

  /** 销毁 */
  const destroyHls = () => {
    hls.destroy()
  }

  return {
    hls,
    hlsInit,
    destroyHls,
    setQuality,
    getQualityList
  }
}

export default useHls
