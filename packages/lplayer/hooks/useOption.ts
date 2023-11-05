import type { MioOption } from "../types/option"

const useOption = () => {
  // 处理配置
  const handleOption = (mioOptions: MioOption | undefined | null) => {
    const defaultOptions: MioOption = {
      preload: "auto",
      autoplay: false,
      volume: 100,
      playbackSpeed: [0.5, 0.75, 1, 1.5, 2],
      video: {
        cover: "",
        src: ""
      }
    }
    const options = Object.assign(defaultOptions, mioOptions)
    return options
  }

  return {
    handleOption
  }
}

export default useOption
