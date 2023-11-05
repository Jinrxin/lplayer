<template>
  <!-- .prevent 阻止事件捕获，防止指针选中按钮导致上下拖动错误 -->
  <div
    ref="progressRef"
    class="mio-player__progress"
    @click="change"
    @mousedown.prevent="dragStart"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @mousemove="onMove"
  >
    <div class="mio-player__progress-schedule">
      <!--  滑动条  -->
      <player-slider
        ref="sliderRef"
        v-model="sliderValue"
        :buffer="buffer"
        :height="sliderHeight"
        :thumb-show="thumbShow"
        @drag-start="isDrag = true"
        @darg-move="computeMouseRect"
        @drag-end="dragEnd"
        @change="(value) => $emit('change', value)"
      />
    </div>

    <div class="mio-player__progress-tip" :style="timeTipStyle">
      {{ tipTime }}
    </div>
    <div class="mio-player__progress-indicator" :style="indicatorStyle">
      <div class="down"><icon-play /></div>
      <div class="up"><icon-play /></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, reactive, onMounted, CSSProperties } from "vue"
import { numLimit } from "../../utils/CommonUtils"
import { secondToTime } from "../../utils/TimeUtils"
import PlayerSlider from "../player-slider/PlayerSlider.vue"
import IconPlay from "../../icon/IconPlay.vue"

const props = withDefaults(
  defineProps<{
    // 时间
    duration: number
    bufferTime: number
    currentTime: number
    // 进度条高度
    height?: number
    activeHeight?: number
  }>(),
  {
    height: 2,
    activeHeight: 4
  }
)
const emit = defineEmits<{
  change: [percent: number]
}>()

// 拖动
const isDrag = ref(false)
// 鼠标移入
const isEnter = ref(false)
const sliderValue = ref(0)
const thumbShow = ref(false)
const interval = ref<NodeJS.Timeout>()

const progressRef = ref<HTMLDivElement | null>(null)
const sliderRef = ref<InstanceType<typeof PlayerSlider> | null>(null)

const mouseRect = reactive({
  x: 0,
  max: 0
})
const progressRect = reactive({
  width: 0,
  left: 0
})

// 缓冲进度
const buffer = computed(() => {
  return (props.bufferTime * 100) / props.duration
})
const sliderHeight = computed(() => {
  return thumbShow.value ? props.activeHeight : props.height
})

// 时间提示
const tipTime = computed(() => {
  const { duration } = props
  const time = (mouseRect.x / progressRect.width) * duration
  return secondToTime(time | 0)
})
const timeTipStyle = computed<CSSProperties>(() => ({
  opacity: thumbShow.value ? 1 : 0,
  transform: `translateX(${
    mouseRect.x <= 10 ? 10 : mouseRect.x >= mouseRect.max - 10 ? mouseRect.max - 12 : mouseRect.x
  }px)`
}))
const indicatorStyle = computed<CSSProperties>(() => ({
  opacity: thumbShow.value ? 1 : 0,
  transform: `translateX(${mouseRect.x}px)`
}))

// 实时进度
watch(
  () => props.currentTime,
  (val) => {
    // 拖拽时不随视频播放改变进度值
    if (isDrag.value) return
    sliderValue.value = props.duration ? (val * 100) / props.duration : 0
  }
)

// 计算鼠标位置
const computeMouseRect = (e: MouseEvent) => {
  mouseRect.x = numLimit(e.pageX - progressRect.left, 0, progressRect.width)
}

// 当前时间跳转
const change = (e: MouseEvent) => {
  if (!sliderRef.value) return
  emit("change", sliderRef.value.setValue(e))
}

/** 鼠标事件 */
const { dragStart, dragEnd, onEnter, onMove, onLeave } = (() => {
  /** 拖拽 */
  const dragStart = (e: MouseEvent) => {
    if (!isEnter.value) isEnter.value = true
    if (!thumbShow.value) thumbShow.value = true
    if (sliderRef.value) sliderRef.value.dragStart(e)
  }
  const dragEnd = () => {
    if (!isEnter.value) {
      isEnter.value = false
      thumbShow.value = false
      document.onmousemove = null
    }
    isDrag.value = false
  }

  /** 移动 */
  const onEnter = () => {
    interval.value = setTimeout(() => {
      isEnter.value = true
      thumbShow.value = true
    }, 200)
  }
  const onMove = () => {
    if (isDrag.value) return
    document.onmousemove = computeMouseRect
  }
  const onLeave = () => {
    clearInterval(interval.value)
    if (!isDrag.value) {
      thumbShow.value = false
      document.onmousemove = null
    }
    isEnter.value = false
  }
  return { dragStart, dragEnd, onEnter, onMove, onLeave }
})()

// 初始化
const progressInit = () => {
  if (!sliderRef.value) return
  if (!progressRef.value) return
  progressRect.width = progressRef.value.clientWidth
  progressRect.left = progressRef.value.getBoundingClientRect().left
  mouseRect.max = progressRect.width
  sliderRef.value.sliderInit()
}

onMounted(() => {
  progressInit()
})

defineExpose({
  progressInit
})
</script>

<style lang="less" scoped>
.mio-player__progress {
  display: flex;
  align-items: flex-end;
  height: 10px;
  padding-bottom: 6px;
  cursor: pointer;

  &-schedule {
    position: relative;
    width: 100%;
  }

  &-tip {
    position: absolute;
    top: -26px;
    left: -9px;
    padding: 0 6px;
    width: 32px;
    height: 20px;
    font-size: 10px;
    background: rgba(0, 0, 0, 0.469);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.25s;
    user-select: none;
    pointer-events: none;
    z-index: -1;
  }

  &-indicator {
    position: absolute;
    top: -8px;
    left: 6px;
    width: 12px;
    height: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    overflow: hidden;
    transition: opacity 0.1s;
    z-index: -1;
    // pointer-events: none;

    div {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 12px;
      height: 12px;
      font-size: 12px;
      color: #fff;
      opacity: 0.9;
    }

    .down {
      transform: scale(0.5) rotate(90deg);
    }

    .up {
      transform: scale(0.5) rotate(-90deg);
    }
  }
}
</style>
