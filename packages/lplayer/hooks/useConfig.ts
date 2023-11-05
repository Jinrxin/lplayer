const useConfig = () => {
  // 初始化
  const configInit = () => {
    const config = localStorage.getItem("mio-player")
    if (config) return
    const defaultConfig = {
      //   quality: 720, //默认分辨率
      loop: true,
      volume: 100,
      muted: false,
      autoplay: true
    }
    localStorage.setItem("mio-player", JSON.stringify(defaultConfig))
  }

  const getConfigItem = (key: string) => {
    const config = localStorage.getItem("mio-player")
    if (!config) {
      configInit()
      return
    }
    const playerConfig = JSON.parse(config)
    return playerConfig[key]
  }

  const setConfig = (key: string, value: unknown) => {
    const readConfig = localStorage.getItem("mio-player")
    const config = JSON.parse(readConfig ? readConfig : "{}")
    config[key] = value
    localStorage.setItem("mio-player", JSON.stringify(config))
  }

  return {
    configInit,
    setConfig,
    getConfigItem
  }
}

export default useConfig
