<template>
  <div
    v-if="!isDestroy"
    ref="mioPlayer"
    class="mio-player"
    tabindex="-1"
    :style="mioPlayerStyle"
    @wheel.prevent="mouseWheel"
    @mousemove="showControlBar"
    @mouseleave="hideControlBar"
  >
    <!-- 视频层 -->
    <div class="mio-player__video-container">
      <div
        class="mio-player__video"
        :class="{ 'mio-player__mirror': player.mirror }"
        :style="videoStyle"
      >
        <video
          ref="videoInstance"
          :style="videoFill"
          @play="onPlay"
          @pause="onPause"
          @ended="onEnded"
          @error="error"
          @canplay="canplay"
          @seeked="seeked"
          @waiting="waiting"
          @playing="playing"
          @timeupdate="timeUpdate"
          @ratechange="rateChange"
          @volumechange="volumeChange"
          @loadedmetadata="loadedMetadata"
        ></video>
      </div>
    </div>
    <!-- 遮罩层 -->
    <player-mask
      :status="player.status"
      :cursor-visble="controlVisible"
      @contextmenu="openContextMenu"
      @handle-play="clickMask"
      @full-screen="dbclickMask"
    />
    <!-- 消息层 -->
    <player-msg ref="playerMsg" />
    <!-- 控制栏 -->
    <player-control
      ref="playerControl"
      :player="player"
      :options="options"
      :visible="controlVisible"
      :quality-list="qualityList"
      :next="next"
      :previous="previous"
      @click="ctxShow = false"
      @mouseenter="controlBar.mouseIn = true"
      @mouseleave="controlBar.mouseIn = false"
      @mute="mute"
      @handle-play="handlePlay"
      @change-ratio="changeRatio"
      @switch-quality="switchQuality"
      @set-speed="setSpeed"
      @set-volume="setVolume"
      @set-current-time="setCurrentTime"
      @toggle-loop="toggleLoop"
      @toggle-mirror="toggleMirror"
      @toggle-auto-play="toggleAutoPlay"
      @toggle-full-screen="toggleFullScreen"
      @toggle-web-full-screen="toggleWebFullScreen"
      @toggle-picture-in-picture="togglePictureInPicture"
      @next="$emit('next')"
      @previous="$emit('previous')"
    />
    <!-- 右键菜单 -->
    <player-context ref="playerCtx" :ctx-show="ctxShow" @click="ctxShow = false" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, CSSProperties, onUnmounted } from "vue"
import { MioOption, Quality } from "./types/option"
import { Player, PlayerStatus } from "./types/player"
import { useResizeListener } from "./hooks/use/useResizeListener"
import PlayerMsg, { NotifyItem } from "./components/player-msg/PlayerMsg.vue"
import useOption from "./hooks/useOption"
import useConfig from "./hooks/useConfig"
import useShortcutKey from "./hooks/useShortcutKey"
import PlayerMask from "./components/player-mask/PlayerMask.vue"
import PlayerContext from "./components/player-context/PlayerContext.vue"
import PlayerControl from "./components/player-control/PlayerControl.vue"

const props = withDefaults(
  defineProps<{
    option: MioOption
    next?: boolean
    previous?: boolean
    target?: HTMLElement | string | null
  }>(),
  { next: false, previous: false, target: "body" }
)

const emit = defineEmits<{
  error: [Event]
  onplay: [void]
  onpause: [void]
  onended: [void]
  canplay: [void]
  seeked: [void]
  waiting: [void]
  playing: [void]
  timeupdate: [void]
  ratechange: [void]
  volumechange: [void]
  loadedmetadata: [void]
  next: [void]
  previous: [void]
  changeQuality: [number]
  customInit: [HTMLVideoElement, string, boolean]
}>()

// 参数处理
const { handleOption } = useOption()
const { configInit, getConfigItem, setConfig } = useConfig()
const { handleKeyDown, handleKeyUp } = useShortcutKey()

// 实例
const mioPlayer = ref<HTMLDivElement | null>(null)
const videoInstance = ref<HTMLVideoElement | null>(null)
const playerMsg = ref<InstanceType<typeof PlayerMsg> | null>(null)
const playerCtx = ref<InstanceType<typeof PlayerContext> | null>(null)
const playerControl = ref<InstanceType<typeof PlayerControl> | null>(null)
// 参数
const options = ref<MioOption | null>(null)
// 信息
const player = reactive<Player>({
  volume: 100,
  duration: 0,
  bufferTime: 0,
  currentTime: 0,
  playbackSpeed: 1,
  currentQuality: 1,
  loop: false,
  muted: false,
  mirror: false,
  autoplay: false,
  fullScreen: false,
  webFullScreen: false,
  pictureInPicture: false,
  status: PlayerStatus.None
})

// 静音前音量
const oldVolume = ref(0)
const ctxShow = ref(false)
const isDestroy = ref(false)
const qualityList = reactive<Quality[]>([])
// 视频比例
const videoRatio = ref<"0:0" | "4:3" | "16:9">("0:0")
const videoReact = reactive({
  width: 0,
  height: 0,
  playerWidth: 0,
  playerHeight: 0
})
const video = computed(() => videoInstance.value!)
const videoFill = computed<CSSProperties>(() => {
  return {
    "object-fit": videoRatio.value === "0:0" ? "contain" : "fill"
  }
})
const videoStyle = computed<CSSProperties>(() => {
  const aspectRatio = 1980 / 1080
  const transverseVideo = videoReact.width / videoReact.height
  // 自动
  const style = {
    width: aspectRatio > transverseVideo ? "auto" : "100%",
    height: aspectRatio > transverseVideo ? "100%" : "auto"
  }
  // 设置
  const playerRatio = videoReact.playerWidth / videoReact.playerHeight
  if (videoRatio.value === "4:3") {
    style.width = playerRatio > 4 / 3 ? `${(4 / 3) * videoReact.playerHeight}px` : "100%"
    style.height = playerRatio > 4 / 3 ? "100%" : `${(3 / 4) * videoReact.playerWidth}px`
  }
  if (videoRatio.value === "16:9") {
    style.width = playerRatio > 16 / 9 ? `${(16 / 9) * videoReact.playerHeight}px` : "100%"
    style.height = playerRatio > 16 / 9 ? "100%" : `${(9 / 16) * videoReact.playerWidth}px`
  }
  return style
})
// 动态样式
const mioPlayerStyle = computed<CSSProperties>(() => {
  const webFullScreen = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }
  // TODO 鼠标跟随控制栏隐藏失效（控制台选中元素时）
  const cursorStyle = { cursor: controlVisible.value ? "auto" : "none" }
  return player.webFullScreen ? Object.assign(cursorStyle, webFullScreen) : cursorStyle
})

/** 视频方法 */
const {
  play,
  pause,
  mute,
  toggleLoop,
  setSpeed,
  setVolume,
  setPoster,
  setResource,
  setCurrentTime,
  toggleMirror,
  toggleAutoPlay,
  toggleFullScreen,
  toggleWebFullScreen,
  togglePictureInPicture
} = (() => {
  /** 播放 */
  const play = () => videoInstance.value?.play()
  /** 暂停 */
  const pause = () => videoInstance.value?.pause()
  /** 静音 */
  const mute = () => {
    if (!videoInstance.value) return
    videoInstance.value.muted = !videoInstance.value.muted
    player.muted = videoInstance.value.muted
    if (videoInstance.value.muted) {
      oldVolume.value = player.volume
      setVolume(0)
    } else {
      setVolume(oldVolume.value ? oldVolume.value : 70)
    }
    notify({
      content: videoInstance.value.muted ? "静音" : "取消静音",
      duration: 2000
    })
  }
  /** 海报 */
  const setPoster = (cover: string) => {
    if (!videoInstance.value) return
    videoInstance.value.poster = cover
  }
  /** 音量 */
  const setVolume = (volume: number) => {
    if (!videoInstance.value) return
    if (volume !== 0) oldVolume.value = volume
    videoInstance.value.volume = volume / 100
    if (!videoInstance.value.volume) videoInstance.value.muted = true
    if (videoInstance.value.volume && videoInstance.value.muted) videoInstance.value.muted = false
    player.muted = videoInstance.value.muted
  }
  /** 倍速 */
  const setSpeed = (speed: number) => {
    if (!videoInstance.value) return
    videoInstance.value.playbackRate = speed
  }
  /** 循环 */
  const toggleLoop = (loop: boolean) => {
    if (!videoInstance.value) return
    videoInstance.value.loop = loop
    player.loop = videoInstance.value.loop
    setConfig("loop", player.loop)
  }
  /** 播放源 */
  const setResource = (src: string) => {
    if (!videoInstance.value) return
    videoInstance.value.src = src
  }
  /** 时间 */
  const setCurrentTime = (time: number) => {
    if (!videoInstance.value) return
    videoInstance.value.currentTime = time
  }
  /** 镜面翻转 */
  const toggleMirror = (mirror: boolean) => {
    player.mirror = mirror
  }
  /** 自动播放 */
  const toggleAutoPlay = (autoplay: boolean) => {
    if (!videoInstance.value) return
    videoInstance.value.autoplay = autoplay
    player.autoplay = videoInstance.value.autoplay
    setConfig("autoplay", player.autoplay)
  }
  /** 画中画 */
  const togglePictureInPicture = () => {
    if (!videoInstance.value) return
    // 检查浏览器是否支持画中画
    if ("pictureInPictureEnabled" in document) {
      if (document.pictureInPictureElement) {
        // 如果已经在画中画模式下，离开画中画
        document
          .exitPictureInPicture()
          .then(() => {
            player.pictureInPicture = false
          })
          .catch((error) => {
            player.pictureInPicture = true
            console.error("无法离开画中画模式: ", error)
          })
      } else {
        // 启用画中画
        videoInstance.value
          .requestPictureInPicture()
          .then(() => {
            player.pictureInPicture = true
          })
          .catch((error) => {
            player.pictureInPicture = false
            console.error("无法进入画中画模式: ", error)
          })
      }
    } else {
      // "不支持画中画"
    }
  }
  /** 网页全屏 */
  const toggleWebFullScreen = () => {
    // 关闭全屏
    if (player.fullScreen) {
      if (!player.webFullScreen) player.webFullScreen = true
      // 如果已经在全屏模式下，退出全屏
      document.exitFullscreen()
      return
    }
    player.webFullScreen = !player.webFullScreen
    // controlResize()
    // emit("webFullScreen", player.webFullScreen)
  }
  /** 全屏 */
  const toggleFullScreen = () => {
    if (!mioPlayer.value) return
    // 如果已经在全屏模式下，退出全屏
    if (player.fullScreen) {
      player.webFullScreen = false
      document.exitFullscreen()
    } // 否则，进入全屏
    else {
      mioPlayer.value.requestFullscreen()
    }
  }

  return {
    play,
    pause,
    mute,
    toggleLoop,
    setSpeed,
    setVolume,
    setPoster,
    setResource,
    toggleMirror,
    setCurrentTime,
    toggleAutoPlay,
    toggleFullScreen,
    toggleWebFullScreen,
    togglePictureInPicture
  }
})()

/** 视频触发事件 */
const {
  error,
  onPlay,
  onPause,
  onEnded,
  canplay,
  seeked,
  waiting,
  playing,
  timeUpdate,
  rateChange,
  volumeChange,
  loadedMetadata
} = (() => {
  /** 错误 */
  const error = (event: Event) => {
    if (!videoInstance.value) return
    if (videoInstance.value.error) {
      player.status = PlayerStatus.Failed
      console.error(videoInstance.value.error)
    }
    emit("error", event)
  }
  /** 准备就绪 */
  const loadedMetadata = () => {
    if (!videoInstance.value) return
    videoReact.width = videoInstance.value.videoWidth
    videoReact.height = videoInstance.value.videoHeight
    player.duration = videoInstance.value.duration
    emit("loadedmetadata")
    // initCurrentTime
  }
  /** 可以播放 */
  const canplay = () => {
    player.status = PlayerStatus.Paused
    emit("canplay")
  }
  /** 播放 */
  const onPlay = () => {
    player.status = PlayerStatus.Playing
    emit("onplay")
  }
  /** 暂停 */
  const onPause = () => {
    if (player.status === PlayerStatus.Failed) return
    player.status = PlayerStatus.Paused
    emit("onpause")
  }
  const onEnded = () => {
    emit("onended")
  }
  /** 缓冲开始 */
  const waiting = () => {
    player.status = PlayerStatus.Loading
    emit("waiting")
  }
  /** 缓冲结束 */
  const playing = () => {
    player.status = PlayerStatus.Playing
    emit("playing")
  }
  /** 跳帧完成 */
  const seeked = () => {
    emit("seeked")
  }
  /** 播放时间改变 */
  const timeUpdate = () => {
    if (!videoInstance.value) return
    // 当前时间
    player.currentTime = videoInstance.value.currentTime
    // 已经缓冲时间
    if (videoInstance.value.buffered.length) {
      player.bufferTime = videoInstance.value.buffered.end(videoInstance.value.buffered.length - 1)
    }
    emit("timeupdate")
  }
  /** 播放速度改变 */
  const rateChange = () => {
    if (!videoInstance.value) return
    player.playbackSpeed = videoInstance.value.playbackRate
    emit("ratechange")
  }
  /** 音量改变 */
  const volumeChange = () => {
    if (!videoInstance.value) return
    player.volume = +(videoInstance.value.volume * 100).toFixed(0)
    setConfig("muted", player.volume ? false : true)
    setConfig("volume", player.volume)
    emit("volumechange")
  }
  return {
    error,
    onPlay,
    onPause,
    onEnded,
    canplay,
    seeked,
    waiting,
    playing,
    timeUpdate,
    rateChange,
    volumeChange,
    loadedMetadata
  }
})()

/** 键鼠快捷方法 */
const {
  clickMask,
  dbclickMask,
  mouseWheel,
  keydownSpace,
  keydownM,
  keydownF,
  fastVolumeChange,
  fastCurrentTimeChange
} = (() => {
  const maskTimeout = ref<NodeJS.Timeout | null>(null)

  /** 单击播放 */
  const clickMask = () => {
    // 关闭菜单
    if (ctxShow.value) ctxShow.value = false
    // 取消上次延时未执行的方法
    if (maskTimeout.value) clearTimeout(maskTimeout.value)
    //执行延时
    maskTimeout.value = setTimeout(function () {
      handlePlay()
    }, 250)
  }
  /** 双击全屏 */
  const dbclickMask = () => {
    // 取消上次延时未执行的方法
    if (maskTimeout.value) clearTimeout(maskTimeout.value)
    toggleFullScreen()
  }
  /** TODO 鼠标滚轮事件 */
  const mouseWheel = (() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const wheel = reactive<{
      isWheel: boolean // 是否可以正常的滚动
      wheelTime: number // 上次切换的时间戳（毫秒级别）
      timer: NodeJS.Timeout | null // setTimeout句柄
      interval: number // 两次滑动之间的最小事件间隔
      distance: number // 有效滑动的最小距离
      delay: number // 节流时间
      count: number // 单位时间内触发次数
    }>({
      isWheel: true,
      wheelTime: 0,
      timer: null,
      interval: 500,
      distance: 1,
      delay: 1,
      count: 0
    })

    return (event: WheelEvent) => {
      // TODO 滚动一下触发太多次！！！
      if (!player.fullScreen && !player.webFullScreen) return
      const deltaY = event.deltaY
      if (deltaY < 0 && player.volume < 100) {
        setVolume(player.volume + 1)
      }
      if (deltaY > 0 && player.volume > 0) {
        setVolume(player.volume - 1)
      }
      // // 每100ms触发一次
      // const time = new Date().getTime()
      // if (time - wheel.wheelTime < wheel.interval) {
      //   wheel.count++
      //   return
      // }
      // wheel.wheelTime = time
      // // 排除滚动值小于1
      // const deltaY = event.deltaY
      // if (Math.abs(deltaY) < wheel.distance) return
      // console.log(Math.abs(event.deltaY))
      // if (deltaY < 0 && player.volume < 100) {
      //   if (wheel.count > 5) {
      //     setVolume(100)
      //     return
      //   }
      //   setVolume(player.volume + 1)
      // }
      // if (deltaY > 0 && player.volume > 0) {
      //   if (wheel.count > 0) {
      //     setVolume(0)
      //     return
      //   }
      //   setVolume(player.volume - 1)
      // }
    }
  })()
  /** 空格 */
  const keydownSpace = () => {
    handlePlay()
  }

  /** m 静音 */
  const keydownM = () => {
    mute()
  }

  /** f 全屏 */
  const keydownF = () => {
    toggleFullScreen()
  }

  /**
   * 进度快速切换
   * @param limit s
   */
  const fastCurrentTimeChange = (limit: number) => {
    const num = player.currentTime + limit
    if (num <= 0) {
      setCurrentTime(0)
      return
    }
    if (num >= player.duration) {
      setCurrentTime(player.duration)
      return
    }
    setCurrentTime(num)
  }
  /**
   * 音量快捷键
   * @param volume 100
   */
  const fastVolumeChange = (limit: number) => {
    const num = player.volume + limit
    if (num <= 0) {
      setVolume(0)
      return
    }
    if (num >= 100) {
      setVolume(100)
      return
    }
    setVolume(num)
  }

  return {
    clickMask,
    dbclickMask,
    mouseWheel,
    keydownSpace,
    keydownM,
    keydownF,
    fastVolumeChange,
    fastCurrentTimeChange
  }
})()

/** 控制栏模块 */
const {
  controlBar,
  controlVisible,
  hideControlBar,
  showControlBar,
  handlePlay,
  changeRatio,
  openContextMenu,
  switchQuality
} = (() => {
  /**
   * 底部控制bar集合
   */
  const controlBar = reactive({
    /** 视频内移动 */
    move: false,
    mouseIn: false,
    timer: null as null | NodeJS.Timeout
  })
  const controlVisible = computed(() => controlBar.move || controlBar.mouseIn)
  const hideControlBar = () => {
    controlBar.move = false
    // controlBar.mouseIn = false
    controlBar.timer && clearTimeout(controlBar.timer)
  }
  /** 控制bar显隐控制器 */
  const showControlBar = () => {
    if (controlBar.timer) {
      clearTimeout(controlBar.timer)
      controlBar.timer = null
    }
    controlBar.move = true
    controlBar.timer = setTimeout(hideControlBar, 5000)
  }

  /** 视频播放处理 */
  const handlePlay = () => {
    switch (player.status) {
      case PlayerStatus.None: {
        break
      }
      case PlayerStatus.Loading: {
        pause()
        break
      }
      case PlayerStatus.Playing: {
        pause()
        break
      }
      case PlayerStatus.Paused: {
        play()
        break
      }
      case PlayerStatus.Failed: {
        break
      }
    }
  }

  /** 修改视频比例 */
  const changeRatio = (ratio: "0:0" | "4:3" | "16:9") => {
    videoRatio.value = ratio
  }

  /** 打开右键菜单 */
  const openContextMenu = (e: MouseEvent) => {
    if (!videoInstance.value || !mioPlayer.value) return
    ctxShow.value = true
    const x = e.clientX - (mioPlayer.value.getBoundingClientRect().left || 0)
    const y = e.clientY - (mioPlayer.value.getBoundingClientRect().top || 0)
    playerCtx.value?.open(x, y, videoReact)
  }

  /** 修改清晰度 */
  const switchQuality = (quality: Quality) => {
    player.currentQuality = quality
    emit("changeQuality", quality as number)
  }
  return {
    controlBar,
    controlVisible,
    hideControlBar,
    showControlBar,
    handlePlay,
    changeRatio,
    openContextMenu,
    switchQuality
  }
})()

/** 其他方法 */
const {
  notify,
  clearNotify,
  getVideoType,
  playerRectInit,
  controlResize,
  getMioPlayer,
  getResizeTarget
} = (() => {
  /**
   * 消息提示
   * @param item
   */
  const notify = (item: NotifyItem) => {
    return playerMsg.value!.notify(item)
  }
  const clearNotify = () => {
    return playerMsg.value!.clearNotify()
  }

  /** 获取视频类型 */
  const getVideoType = (src?: string) => {
    if (!options.value) return null
    const videoType = options.value.video.type
    const urlType = src ? src.split(".").pop() : options.value.video.src?.split(".").pop()
    // 优先级 链接类型、视频类型
    return urlType || videoType
  }

  /** 控制栏重绘 */
  const getMioPlayer = (): HTMLElement => {
    if (!mioPlayer.value) return document.querySelector("mio-player")!
    return mioPlayer.value!
  }
  const getResizeTarget = (): HTMLElement => {
    const { target } = props
    if (!target) {
      return mioPlayer.value!
    } else {
      return typeof target === "string"
        ? document.querySelector(target) || mioPlayer.value!
        : target
    }
  }
  const controlResize = () => {
    if (!playerControl.value) return
    playerRectInit()
    playerControl.value.controlStyleInit()
  }
  /** 获取播放器rect */
  const playerRectInit = () => {
    if (!mioPlayer.value) return
    videoReact.playerWidth = mioPlayer.value.clientWidth
    videoReact.playerHeight = mioPlayer.value.clientHeight
  }
  return {
    notify,
    clearNotify,
    getVideoType,
    playerRectInit,
    getMioPlayer,
    controlResize,
    getResizeTarget
  }
})()

/** 事件监听 */
const { addListener, removeListener } = (() => {
  /** 画中画 */
  const listenPicInPicLeave = () => {
    if (!videoInstance.value) return
    // 监听 leavepictureinpicture 事件
    videoInstance.value.onleavepictureinpicture = () => {
      // 在退出画中画模式后执行的操作
      player.pictureInPicture = false
    }
  }
  /** 全屏 */
  const listenfullScreenChange = () => {
    if (!mioPlayer.value) return
    mioPlayer.value.onfullscreenchange = () => {
      if (document.fullscreenElement) {
        // 进入全屏模式
        player.fullScreen = true
      } else {
        // 退出全屏模式
        player.fullScreen = false
      }
      // controlResize()
    }
  }
  /** 键盘快捷 */
  const listenKeyBoradEvent = () => {
    document.onkeydown = (e: KeyboardEvent) =>
      handleKeyDown(e, {
        " ": keydownSpace,
        m: keydownM,
        f: keydownF,
        arrowright: () => fastCurrentTimeChange(5),
        arrowleft: () => fastCurrentTimeChange(-5),
        arrowup: () => fastVolumeChange(10),
        arrowdown: () => fastVolumeChange(-10)
      })

    document.onkeyup = (e: KeyboardEvent) => handleKeyUp(e)
  }

  /** 添加监听 */
  const addListener = () => {
    listenKeyBoradEvent()
    listenPicInPicLeave()
    listenfullScreenChange()
  }

  const removeListener = () => {
    if (!videoInstance.value || !mioPlayer.value) return
    videoInstance.value.onleavepictureinpicture = null
    mioPlayer.value.onfullscreenchange = null
    document.onkeydown = null
    document.onkeyup = null
    destroy()
  }
  return {
    addListener,
    removeListener
  }
})()

/** 播放器方法 */
const { changeVideo, setQualityList, seek, destroy } = (() => {
  /**
   * 切换视频
   * @param src 视频地址
   */
  const changeVideo = (src: string) => {
    player.currentTime = 0
    player.duration = 0
    player.status = PlayerStatus.None
    resourceInit(src)
    // toggleAutoPlay(player.autoplay)
  }

  /**
   * 设置清晰度
   * @param qualityList 清晰度列表
   */
  const setQualityList = (list: number[]) => {
    if (!options.value?.customType) return
    qualityList.length = 0
    // 去重
    qualityList.push(...Array.from(new Set(list as Quality[])))
  }

  /**
   * 跳转时间
   * @param time 时间
   */
  const seek = (time: number) => {
    if (player.status === PlayerStatus.None || player.status === PlayerStatus.Failed) return
    if (time > player.duration) setCurrentTime(player.duration)
    else if (time < 0) setCurrentTime(0)
    else {
      setCurrentTime(time)
    }
  }

  /** 销毁组件 */
  const destroy = () => (isDestroy.value = true)

  return { changeVideo, setQualityList, seek, destroy }
})()

/** 初始化视频资源 */
const resourceInit = (src: string) => {
  if (!src) player.status = PlayerStatus.Failed
  const type = getVideoType(src)
  if (!type) player.status = PlayerStatus.Failed
  if (type === "mp4" || type === "mkv" || type === "auto") setResource(src)
  if ((type === "m3u8" || type === "mpd" || type === "flv") && videoInstance.value) {
    if (options.value?.customType) {
      emit("customInit", videoInstance.value, src, player.autoplay)
    } else {
      player.status = PlayerStatus.Failed
      console.log("视频格式不支持")
    }
  }
}

/** 播放器初始化 */
const playerInit = () => {
  if (!videoInstance.value || !mioPlayer.value || !playerControl.value) return
  clearNotify()
  playerRectInit()
  // // 修改默认配置
  configInit()
  player.volume = getConfigItem("volume")
  setVolume(player.volume)
  player.loop = getConfigItem("loop")
  toggleLoop(player.loop)
  player.autoplay = getConfigItem("autoplay")
  toggleAutoPlay(player.autoplay)
  // // 参数
  options.value = handleOption(props.option)
  if (options.value.video.cover) setPoster(options.value.video.cover)
  resourceInit(options.value.video.src!)

  // 事件监听
  addListener()
}

useResizeListener(getMioPlayer, controlResize)
useResizeListener(getResizeTarget(), controlResize)
onMounted(playerInit)
onUnmounted(removeListener)

defineExpose({
  video,
  notify,
  seek,
  destroy,
  changeVideo,
  setQualityList
})
</script>

<style lang="less" scoped>
.mio-player {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  &__video-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #000000;
  }

  &__video {
    video {
      display: block;
      width: 100%;
      height: 100%;
      margin: auto;
      outline: none;
      content-visibility: visible;
    }
  }

  &__control-container {
    position: absolute;
  }

  &__mirror {
    transform: rotateY(180deg);
  }
}
</style>
