<template>
  <div
    v-if="player.status !== PlayerStatus.Failed && player.status !== PlayerStatus.None"
    class="mio-player__control"
    @click="$emit('click')"
    @contextmenu.prevent="$emit('click')"
  >
    <div class="mio-player__control-mask" :style="controlStyle"></div>
    <div class="mio-player__control-container">
      <!-- 进度条 -->
      <div class="mio-player__control-top" :style="controlStyle">
        <player-progress
          ref="playerProgress"
          :duration="player.duration"
          :buffer-time="player.bufferTime"
          :current-time="player.currentTime"
          @change="setCurrentTime"
        />
      </div>
      <!-- 控制栏 -->
      <div class="mio-player__control-bottom" :style="controlStyle">
        <div class="mio-player__control-bottom--left">
          <!-- Previous -->
          <div
            v-if="previous"
            class="mio-player__control-btn mio-player__control-previous"
            aria-label="Previous"
            @click="$emit('previous')"
          >
            <icon-previous />
          </div>
          <!-- 播放 -->
          <div
            class="mio-player__control-btn mio-player__control-play"
            aria-label="播放/暂停"
            @click="$emit('handlePlay')"
          >
            <transition name="play">
              <div v-if="player.status !== PlayerStatus.Playing" class="icon-play">
                <icon-play />
              </div>
            </transition>
            <transition name="pause">
              <div v-if="player.status === PlayerStatus.Playing" class="icon-pause">
                <icon-pause />
              </div>
            </transition>
          </div>
          <!-- Next -->
          <div
            v-if="next"
            class="mio-player__control-btn mio-player__control-next"
            aria-label="Next"
            @click="$emit('next')"
          >
            <icon-next />
          </div>
          <div class="mio-player__control-btn mio-player__control-time">
            <div class="mio-player__control-time-label">
              <span class="mio-player__control-time-current">
                {{ currentTime }}
              </span>
              <span class="mio-player__control-time-divide"> / </span>
              <span class="mio-player__control-time-duration">
                {{ duration }}
              </span>
            </div>
          </div>
        </div>
        <div class="mio-player__control-bottom--center"></div>
        <div class="mio-player__control-bottom--right">
          <!-- 清晰度 -->
          <div
            class="mio-player__control-btn mio-player__control-quality"
            role="button"
            aria-label="清晰度"
            @mouseenter="ctrlEnter('quality')"
            @mouseleave="ctrlLeave"
          >
            <div class="mio-player__control-quality-result">
              {{ qualityMap.get(player.currentQuality) }}
            </div>
            <transition name="menu">
              <ul
                v-show="menuName === 'quality' && qualityList.length > 1"
                class="mio-player__control-menu menu-quality"
              >
                <li
                  v-for="(item, index) in qualityList"
                  :key="index"
                  class="mio-player__control-quality-item"
                  :data-value="item.quality"
                  @click="setQuality(item.quality)"
                >
                  <span>
                    {{ item.name }}
                  </span>
                </li>
              </ul>
            </transition>
          </div>
          <!-- 倍速 -->
          <div
            class="mio-player__control-btn mio-player__control-speed"
            role="button"
            aria-label="倍速"
            @mouseenter="ctrlEnter('speed')"
            @mouseleave="ctrlLeave"
          >
            <div class="mio-player__control-speed-result">
              {{ player.playbackSpeed === 1 ? "倍速" : `${player.playbackSpeed}x` }}
            </div>
            <transition name="menu">
              <ul v-show="menuName === 'speed'" class="mio-player__control-menu menu-speed">
                <li
                  v-for="(item, index) in options.playbackSpeed"
                  :key="index"
                  class="mio-player__control-speed-item"
                  :data-value="item"
                  @click="$emit('setSpeed', item)"
                >
                  <span> {{ item }}x </span>
                </li>
              </ul>
            </transition>
          </div>
          <!-- 音量 -->
          <div
            class="mio-player__control-btn mio-player__control-volume"
            role="button"
            aria-label="音量"
            @mouseenter="ctrlEnter('volume')"
            @mouseleave="ctrlLeave"
          >
            <div class="mio-player__control-btn-icon" @click="$emit('mute')">
              <icon-volume v-if="!player.muted && player.volume" />
              <icon-muted v-else />
            </div>
            <transition name="menu" @enter="volumeSlider?.sliderYInit">
              <div
                v-show="menuName === 'volume' || isVolumeDrag"
                class="mio-player__control-menu menu-volume"
              >
                <div class="mio-player__control-volume-number">
                  {{ player.volume }}
                </div>
                <div
                  class="mio-player__control-volume-progress"
                  @mousedown.prevent="startDrag"
                  @mouseenter="volumeEnter"
                >
                  <div class="mio-player__control-volume-progress-wrapper">
                    <player-slider-y
                      ref="volumeSlider"
                      v-model="player.volume"
                      @change="(volume) => $emit('setVolume', volume)"
                      @drag-start="isVolumeDrag = true"
                      @drag-end="isVolumeDrag = false"
                    />
                  </div>
                </div>
              </div>
            </transition>
          </div>
          <!-- 设置 -->
          <div
            class="mio-player__control-btn mio-player__control-setting"
            role="button"
            aria-label="设置"
            tabindex="0"
            @mouseenter="ctrlEnter('setting')"
            @mouseleave="ctrlLeave"
          >
            <div class="mio-player__control-btn-icon icon-setting">
              <icon-setting />
            </div>
            <transition name="menu">
              <div
                v-show="menuName === 'setting' || moreSetting"
                class="mio-player__control-menu menu-setting"
              >
                <div class="menu-setting-left">
                  <!-- 镜面 -->
                  <div class="setting-item" @click.prevent="$emit('toggleMirror', !player.mirror)">
                    <label> 镜面翻转 </label>
                    <mio-switch
                      id="auto"
                      :width="36"
                      :height="20"
                      :checked="player.mirror"
                      @change="(value) => $emit('toggleMirror', value)"
                    />
                  </div>
                  <!-- 循环 -->
                  <div class="setting-item" @click.prevent="$emit('toggleLoop', !player.loop)">
                    <label> 循环播放 </label>
                    <mio-switch
                      id="auto"
                      :width="36"
                      :height="20"
                      :checked="player.loop"
                      @change="(value) => $emit('toggleLoop', value)"
                    />
                  </div>
                  <!-- 自动播放 -->
                  <div
                    class="setting-item"
                    @click.prevent="$emit('toggleAutoPlay', !player.autoplay)"
                  >
                    <label> 自动播放 </label>
                    <mio-switch
                      id="auto"
                      :width="36"
                      :height="20"
                      :checked="player.autoplay"
                      @change="(value) => $emit('toggleAutoPlay', value)"
                    />
                  </div>
                  <!-- 更多 -->
                  <div class="setting-more" @click="moreSetting = true">更多播放器设置 ></div>
                </div>
                <div
                  class="menu-setting-right"
                  :class="{ 'more-active': moreSetting }"
                  @mouseleave="ctrlLeave"
                >
                  <!-- 视频比例 -->
                  <div class="setting-right-item">
                    <div class="item-title">视频比例</div>
                    <div class="item-content">
                      <div class="mio-radio-group">
                        <label for="ratio1" class="mio-radio-item">
                          <input
                            id="ratio1"
                            v-model="videoRatio"
                            value="0:0"
                            type="radio"
                            name="mio-radio-ratio"
                            class="mio-radio-input"
                            @change="changeRatio"
                          />
                          <span
                            class="mio-radio-label"
                            :class="{ 'radio-active': videoRatio === '0:0' }"
                          >
                            自动
                          </span>
                        </label>
                        <label for="ratio2" class="mio-radio-item">
                          <input
                            id="ratio2"
                            v-model="videoRatio"
                            value="4:3"
                            type="radio"
                            name="mio-radio-ratio"
                            class="mio-radio-input"
                            @change="changeRatio"
                          />
                          <span
                            class="mio-radio-label"
                            :class="{ 'radio-active': videoRatio === '4:3' }"
                          >
                            4:3
                          </span>
                        </label>
                        <label for="ratio3" class="mio-radio-item">
                          <input
                            id="ratio3"
                            v-model="videoRatio"
                            value="16:9"
                            type="radio"
                            name="mio-radio-ratio"
                            class="mio-radio-input"
                            @change="changeRatio"
                          />
                          <span
                            class="mio-radio-label"
                            :class="{ 'radio-active': videoRatio === '16:9' }"
                          >
                            16:9
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="menu-setting-right-mask"></div>
              </div>
            </transition>
          </div>
          <!-- 画中画 -->
          <div
            class="mio-player__control-btn"
            role="button"
            aria-label="画中画"
            tabindex="0"
            @mouseenter="ctrlEnter('picInPic')"
            @mouseleave="ctrlLeave"
            @click="togglePictureInPicture"
          >
            <div class="mio-player__control-btn-icon">
              <icon-pic-in-pic />
            </div>
            <transition name="menu">
              <div
                v-show="menuName === 'picInPic'"
                class="mio-player__control-tip"
                :style="{ width: `${player.pictureInPicture ? 80 : 50}px` }"
              >
                {{ player.pictureInPicture ? "退出画中画" : "画中画" }}
              </div>
            </transition>
          </div>
          <!-- 网页全屏 -->
          <div
            class="mio-player__control-btn"
            role="button"
            aria-label="网页全屏"
            tabindex="0"
            @mouseenter="ctrlEnter('webFull')"
            @mouseleave="ctrlLeave"
            @click="toggleWebFullScreen"
          >
            <div class="mio-player__control-btn-icon">
              <icon-web-full-screen v-if="!player.webFullScreen || player.fullScreen" />
              <icon-web-full-screen-exit v-else />
            </div>
            <transition name="menu">
              <div
                v-show="menuName === 'webFull'"
                class="mio-player__control-tip"
                :style="{ width: `${player.webFullScreen && !player.fullScreen ? 100 : 60}px` }"
              >
                {{ player.webFullScreen && !player.fullScreen ? "退出网页全屏" : "网页全屏" }}
              </div>
            </transition>
          </div>
          <!-- 全屏 -->
          <div
            class="mio-player__control-btn"
            role="button"
            aria-label="全屏"
            tabindex="0"
            @mouseenter="ctrlEnter('fullScreen')"
            @mouseleave="ctrlLeave"
            @click="toggleFullScreen"
          >
            <div class="mio-player__control-btn-icon">
              <icon-full-screen v-if="!player.fullScreen" />
              <icon-full-screen-exit v-else />
            </div>
            <transition name="menu">
              <div
                v-show="menuName === 'fullScreen'"
                class="mio-player__control-tip"
                :style="{ width: `${player.fullScreen ? 70 : 50}px` }"
              >
                {{ player.fullScreen ? "退出全屏" : "全屏" }}
              </div>
            </transition>
          </div>
        </div>
      </div>
      <!-- 默认进度条 -->
      <div class="mio-player__control-area" :style="sliderPreviewStyle">
        <player-slider-preview :value="sliderPreviewValue" :buffer="player.bufferTime" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, CSSProperties } from "vue"
import { secondToTime } from "../../utils/TimeUtils"
import { MioOption, Quality } from "../../types/option"
import { Player, PlayerStatus } from "../../types/player"
import useOption from "../../hooks/useOption"
import useConfig from "../../hooks/useConfig"
import PlayerProgress from "../player-progress/PlayerProgress.vue"
import PlayerSliderPreview from "../player-slider/PlayerSliderPreview.vue"
import PlayerSliderY from "../player-slider/PlayerSliderY.vue"
import MioSwitch from "../mio/mio-switch/MioSwitch.vue"
import {
  IconPlay,
  IconPause,
  IconMuted,
  IconVolume,
  IconPicInPic,
  IconFullScreen,
  IconFullScreenExit,
  IconWebFullScreen,
  IconWebFullScreenExit,
  IconSetting,
  IconPrevious,
  IconNext
} from "../../icon"

const props = withDefaults(
  defineProps<{
    player: Player
    options: MioOption | null
    visible: boolean
    next?: boolean
    previous?: boolean
    qualityList?: Quality[]
  }>(),
  { next: false, previous: false, qualityList: () => [] }
)
const emit = defineEmits<{
  click: [void]
  next: [void]
  previous: [void]
  handlePlay: [void]
  mute: [void]
  switchQuality: [Quality]
  setVolume: [volume: number]
  setSpeed: [speed: number]
  setCurrentTime: [number]
  changeRatio: [string]
  toggleLoop: [boolean]
  toggleMirror: [boolean]
  toggleAutoPlay: [boolean]
  toggleFullScreen: [void]
  toggleWebFullScreen: [void]
  togglePictureInPicture: [void]
}>()

const { setConfig } = useConfig()
const { handleOption } = useOption()

const moreSetting = ref(false)
const videoRatio = ref<"0:0" | "4:3" | "16:9">("0:0")
const playerProgress = ref<InstanceType<typeof PlayerProgress> | null>(null)

const options = computed(() => {
  let option = props.options
  if (!option) {
    // 默认配置
    option = handleOption(null)
  }
  option.playbackSpeed?.reverse()
  return option
})

const player = computed(() => props.player)
const visible = computed(() => props.visible)
const duration = computed(() => secondToTime(player.value.duration))
const currentTime = computed(() => secondToTime(player.value.currentTime))

const controlStyle = computed<CSSProperties>(() => {
  return {
    opacity: visible.value ? 1 : 0,
    visibility: visible.value ? "visible" : "hidden"
  }
})

const sliderPreviewStyle = computed<CSSProperties>(() => {
  return {
    opacity: visible.value ? 0 : 1,
    visibility: visible.value ? "hidden" : "visible"
  }
})

// 预览值
const sliderPreviewValue = computed(() => {
  return (player.value.currentTime * 100) / player.value.duration || 0
})

// 二级菜单显隐
const { menuName, ctrlEnter, ctrlLeave } = (() => {
  const menuShow = ref(false)
  const menuName = ref<string | null>(null)
  const menuInterval = ref<NodeJS.Timeout>()

  const ctrlEnter = (name: string) => {
    menuName.value = name
    menuShow.value = true
    clearInterval(menuInterval.value)
  }
  const ctrlLeave = () => {
    menuInterval.value = setTimeout(() => {
      menuName.value = ""
      menuShow.value = false
      moreSetting.value && (moreSetting.value = false)
    }, 200)
  }
  return {
    menuName,
    ctrlEnter,
    ctrlLeave
  }
})()

/** 清晰度模块 */
const { qualityMap, qualityList, setQuality } = (() => {
  // 流畅度对应
  const qualityMap = new Map<number | string, number | string>([
    [1, "自动"],
    [180, "180 流畅"],
    [240, "240 流畅"],
    [270, "270 流畅"],
    [360, "360 流畅"],
    [380, "380 流畅"],
    [432, "432 清晰"],
    [480, "480 清晰"],
    [576, "576 清晰"],
    [720, "720 高清"],
    [1080, "1080 高清"],
    [1440, "2k 超清"],
    [2160, "4k 超清"]
  ])
  const qualityList = computed(() => {
    if (!options.value) return
    const list = props.qualityList.map((item) => ({
      quality: item,
      name: qualityMap.get(item) as string
    }))
    if (!list.find((item) => item.quality === 1)) {
      list.unshift({
        quality: 1,
        name: "自动"
      })
    }
    return list.reverse()
  })

  // 设置清晰度
  const setQuality = (quality: Quality) => {
    menuName.value = ""
    if (player.value.currentQuality === quality) return
    // // 清晰度配置
    setConfig("quality", quality)
    emit("switchQuality", quality)
  }
  return {
    qualityMap,
    qualityList,
    setQuality
  }
})()

/** 音量模块 */
const { volumeSlider, isVolumeDrag, startDrag, volumeEnter } = (() => {
  const volumeSlider = ref<InstanceType<typeof PlayerSliderY> | null>(null)

  const isVolumeDrag = ref(false)
  // 拖动
  // TODO 向下拖动音量条时，会触碰到播放进度条，导致监听鼠标信息错误
  const startDrag = () => {
    if (!volumeSlider.value) return
    volumeSlider.value.dragStart()
  }

  // 解决上述额问题 ？
  const volumeEnter = () => {
    if (!volumeSlider.value) return
    if (!isVolumeDrag.value) return
    volumeSlider.value.onEnter()
  }

  return {
    volumeSlider,
    isVolumeDrag,
    startDrag,
    volumeEnter
  }
})()

/** 其他功能 */
const {
  setCurrentTime,
  changeRatio,
  toggleFullScreen,
  toggleWebFullScreen,
  togglePictureInPicture
} = (() => {
  /**
   * 设置当前播放时间
   * @param value 滑动条进度百分比
   */
  const setCurrentTime = (value: number) => {
    emit("setCurrentTime", (value * player.value.duration) / 100)
  }

  /** 视频比例 */
  const changeRatio = () => {
    emit("changeRatio", videoRatio.value)
  }

  /** 全屏 */
  const toggleFullScreen = () => {
    menuName.value = ""
    emit("toggleFullScreen")
  }
  /** 网页全屏 */
  const toggleWebFullScreen = () => {
    menuName.value = ""
    emit("toggleWebFullScreen")
  }
  /** 画中画 */
  const togglePictureInPicture = () => {
    menuName.value = ""
    emit("togglePictureInPicture")
  }
  return {
    setCurrentTime,
    changeRatio,
    toggleFullScreen,
    toggleWebFullScreen,
    togglePictureInPicture
  }
})()

// 节点重绘
const controlStyleInit = () => {
  if (!playerProgress.value || !volumeSlider.value) return
  volumeSlider.value.sliderYInit()
  playerProgress.value.progressInit()
}

defineExpose({
  controlStyleInit
})
</script>

<style lang="less" scoped>
.mio-player__control {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  transition: all 0.25s ease-in-out;
  @btn-width: 36px;
  @btn-htight: 22px;
  @btn-color: #e2e2e2;
  @menu-background: #272626;

  div {
    transition: all 0.25s ease-in-out;
  }

  &-mask {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAADGCAYAAAAT+OqFAAAAdklEQVQoz42QQQ7AIAgEF/T/D+kbq/RWAlnQyyazA4aoAB4FsBSA/bFjuF1EOL7VbrIrBuusmrt4ZZORfb6ehbWdnRHEIiITaEUKa5EJqUakRSaEYBJSCY2dEstQY7AuxahwXFrvZmWl2rh4JZ07z9dLtesfNj5q0FU3A5ObbwAAAABJRU5ErkJggg==)
      repeat-x bottom;
    pointer-events: none;
    z-index: -100;
  }

  &-top {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 44px;
    padding: 0 12px;
    box-sizing: border-box;
  }

  &-bottom {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 35px;
    margin: 20px 0 0;
    padding: 0 12px;
    box-sizing: border-box;

    &--left {
      display: inline-flex;
      flex: none;
    }

    &--center {
      display: flex;
      flex-direction: row;
      flex: 1;
    }

    &--right {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
    }
  }

  &-btn {
    position: relative;
    width: @btn-width;
    height: @btn-htight;
    line-height: @btn-htight;
    text-align: center;
    font-size: 12px;
    border: none;
    outline: none;
    cursor: pointer;

    &:hover {
      margin-top: -12px;
      padding-top: 12px;
    }

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: @btn-width;
      height: @btn-htight;

      &:hover {
        animation: control-icons 0.5s ease-in-out;
      }
    }
  }

  &-play {
    position: relative;
    .icon-play,
    .icon-pause {
      position: absolute;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      &:hover {
        margin-top: 0;
        padding-top: 0;
      }
    }
  }

  &-play,
  &-previous,
  &-next {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    line-height: 22px;
    text-align: center;
    font-size: 12px;
    border: none;
    outline: none;
    cursor: pointer;
  }

  &-time {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100px;
    font-size: 12px;
    user-select: none;
    color: @btn-color;
    cursor: text;
  }

  &-menu {
    position: absolute;
    bottom: 42px;
    left: 50%;
    border-radius: 6px;
    background-color: @menu-background;
    transform: translateX(-50%);
    list-style-type: none;
    margin: 0;
    padding: 0;

    &.menu-quality {
      width: 120px;
      overflow: hidden;
    }

    &.menu-speed {
      overflow: hidden;
    }

    &.menu-volume {
      height: 100px;
      width: 32px;
      padding-bottom: 10px;
      transition: all 0.3s;
    }

    &.menu-setting {
      display: flex;
      flex-direction: row;
      justify-content: center;

      .menu-setting-left {
        position: relative;
        width: 126px;
        border-radius: 8px;
        padding: 8px 12px;
        box-sizing: border-box;
      }
      .menu-setting-right {
        position: absolute;
        left: 100%;
        bottom: 0;
        width: 220px;
        height: 180px;
        opacity: 0;
        border-radius: 8px;
        padding: 8px 12px;
        box-sizing: border-box;
        background-color: @menu-background;
        transition: all 0.25s ease-in-out;
      }
      // TODO 菜单右侧渐进
      .menu-setting-right-mask {
        position: absolute;
        left: 100%;
        bottom: 0;
        width: 220px;
        height: 180px;
        border-radius: 8px;
        padding: 8px 12px;
        box-sizing: border-box;
        background-color: transparent;
      }
      .more-active {
        opacity: 1;
        transform: translateX(-100%);
      }
    }
  }

  &-quality {
    flex: none;
    font-size: 12px;
    margin-right: 10px;
    width: auto;
    text-align: center;
    &-result {
      font-weight: 600;
      color: @btn-color;
      cursor: pointer;
    }
    &-item {
      display: flex;
      align-items: center;
      height: 40px;
      user-select: none;
      color: @btn-color;

      &:hover {
        color: white;
        background-color: black;
      }
    }

    span {
      margin: auto;
      text-align: center;
    }
  }

  &-speed {
    &-result {
      font-weight: 600;
      color: @btn-color;
      cursor: pointer;
    }

    &-item {
      display: flex;
      align-items: center;
      height: 30px;
      padding: 0 12px;
      color: @btn-color;

      // TODO less 透明颜色变量
      &:hover {
        color: white;
        background-color: black;
      }
    }

    span {
      margin: auto;
      text-align: center;
    }
  }

  &-volume {
    &-number {
      height: 28px;
      line-height: 28px;
      margin-bottom: 2px;
      text-align: center;
      color: @btn-color;
      user-select: none;
    }
    &-progress {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 70px;
      padding-bottom: 4px;
      box-sizing: border-box;

      &-wrapper {
        width: 2px;
        height: 100%;
        background-color: @btn-color;
      }
    }
  }

  &-setting {
    @color: @btn-color;
    @active-cover: #00aeec;

    &:hover {
      .icon-setting {
        animation: control-icon-setting 0.5s ease;
      }
    }

    .setting-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      height: 32px;

      label {
        color: @color;
        font-size: 12px;

        &:hover {
          color: @active-cover;
          cursor: pointer;
        }
      }
    }
    .setting-more {
      margin-top: 4px;
      margin-left: -2px;
      color: @color;
      font-size: 12px;
      &:hover {
        color: @active-cover;
        cursor: pointer;
      }
    }

    .setting-right-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      width: 100%;

      .item-title {
        height: 16px;
        line-height: 16px;
        margin-bottom: 4px;
        color: @btn-color;
      }

      .item-content {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        height: 100%;
        line-height: normal;
        user-select: none;
        vertical-align: middle;
      }

      label {
        color: @color;
        font-size: 12px;

        &:hover {
          color: @active-cover;
          cursor: pointer;
        }
      }
    }

    .mio-radio-group {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      column-gap: 6px;
      width: 100%;
      height: 100%;
    }

    .mio-radio-item {
      position: relative;
      display: flex;
      flex-direction: row;
      justify-content: center;
      flex: 1;
      text-align: center;

      &:hover {
        .mio-radio-label {
          color: white;
        }
      }
    }

    .mio-radio-input {
      cursor: pointer;
      height: 100%;
      left: 0;
      margin: 0;
      opacity: 0;
      position: absolute;
      top: 0;
      width: 100%;
      outline: none;
      text-decoration: none;
      box-sizing: border-box;
      padding: 0;
    }

    .mio-radio-label {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 4px 0;
      box-sizing: border-box;
      font-size: 12px;
      pointer-events: none;
      background-color: #999;
      border-radius: 2px;
      transition: all 0.2s;
      pointer-events: none;
    }

    .radio-active {
      background-color: #00aeec;
    }
  }

  &-tip {
    position: absolute;
    bottom: 42px;
    // 父元素
    left: 50%;
    border-radius: 6px;
    width: 80px;
    height: 30px;
    line-height: 30px;
    padding: 0 6px;
    box-sizing: border-box;
    // 自身
    transform: translateX(-50%);
    z-index: -999;
    color: @btn-color;
    background-color: @menu-background;
    cursor: pointer;
  }
}

// 播放按钮
.play-enter-active,
.pause-enter-active,
.play-leave-active,
.pause-leave-active {
  transition: all 0.25s ease;
}
.play-enter-from,
.play-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
.pause-enter-from,
.pause-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

// 菜单
.menu-enter-active {
  transition: all 0.3s ease;
}
.menu-enter-from {
  opacity: 0;
  bottom: 36px;
}
.menu-leave-to {
  opacity: 0;
}
@keyframes control-icons {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(0.9);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes control-icon-setting {
  0% {
    transform: scale(1) rotate(0);
  }
  50% {
    transform: scale(0.9) rotate(45deg);
  }
  100% {
    transform: scale(1) rotate(180deg);
  }
}
</style>
