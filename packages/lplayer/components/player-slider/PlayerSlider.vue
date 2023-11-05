<template>
  <div ref="sliderRef" class="player-slider">
    <!-- 跑道 -->
    <div class="player-slider__runway" :style="{ height: `${height}px` }">
      <!-- 缓存 -->
      <div v-show="buffer" class="player-slider__buffer" :style="bufferStyle"></div>
      <!-- 当前进度 -->
      <div class="player-slider__current" :style="currentStyle"></div>
      <!-- 提示点 -->
      <div class="player-slider__thumb" :style="thumbStyle">
        <div class="player-slider__thumb-inner" :style="thumbInnerStyle">
          <div class="block" :style="{ transform: `scale(${props.thumbShow ? 1 : 0})` }"></div>
          <!-- 自定义 -->
          <!-- <div class="block" :style="{ transform: `scale(${props.thumbShow ? 1 : 0})` }">
            <img
              style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
              "
              src="@/assets/img/thumb.jpg"
              alt=""
            />
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, CSSProperties } from "vue"
import { numLimit } from "../../utils/CommonUtils"

const props = withDefaults(
  defineProps<{
    // 实时占比（百分比 0 - 100）
    modelValue: number
    buffer?: number
    height?: number
    min?: number
    max?: number
    thumbSize?: number
    thumbShow?: boolean
  }>(),
  {
    buffer: 0,
    height: 2,
    min: 0,
    max: 100,
    thumbSize: 8,
    thumbShow: false
  }
)
const emit = defineEmits<{
  // 进度改变
  dragStart: [void]
  dragEnd: [void]
  dargMove: [e: MouseEvent]
  change: [percent: number]
  // 更新当前进度
  "update:modelValue": [value: number]
}>()

// 是否在拖动
const isDrag = ref(false)
// 操作时占比
const realValue = ref(props.modelValue)
const sliderRef = ref<HTMLDivElement | null>(null)
const sliderRect = reactive({
  width: 0,
  left: 0
})

// 当前进度
const currentStyle = computed<CSSProperties>(() => {
  return {
    transform: `scaleX(${(props.modelValue / props.max).toFixed(4)})`
  }
})
// 缓冲进度
const bufferStyle = computed<CSSProperties>(() => {
  return {
    transform: `scaleX(${props.buffer / props.max})`
  }
})
// 按钮
const thumbStyle = computed<CSSProperties>(() => {
  return {
    transform: `translateX(${
      (sliderRect.width * props.modelValue) / props.max - props.thumbSize / 2
    }px)`
  }
})
const thumbInnerStyle = computed<CSSProperties>(() => {
  return {
    top: `-${(props.thumbSize - props.height) / 2}px`,
    width: `${props.thumbSize}px`,
    height: `${props.thumbSize}px`
  }
})

// 设置当前进度值
const setValue = (e: MouseEvent) => {
  const thumbOffsetX = e.pageX - sliderRect.left
  realValue.value = numLimit(+((thumbOffsetX / sliderRect.width) * 100).toFixed(4), 0, 100)
  // 拖动不改变播放时间
  // emit("change", realValue.value)
  // 更新实时拖动值，优化拖动延迟
  emit("update:modelValue", realValue.value)
  return realValue.value
}

/** 拖拽 */
const { dragStart } = (() => {
  const dragStart = (e: MouseEvent) => {
    isDrag.value = true
    setValue(e)
    emit("dragStart")
    document.onmousemove = dargMove
    document.onmouseup = dragEnd
  }
  // 鼠标移动
  const dargMove = (e: MouseEvent) => {
    setValue(e)
    emit("dargMove", e)
  }
  // 鼠标松开
  const dragEnd = (e: MouseEvent) => {
    if (!isDrag.value) return
    setValue(e)
    emit("dragEnd")
    emit("change", realValue.value)
    isDrag.value = false
    document.onmousemove = document.onmouseup = null
  }
  return {
    dragStart
  }
})()

// 初始化进度条信息
const sliderInit = () => {
  if (!sliderRef.value) return
  const rect = sliderRef.value.getBoundingClientRect()
  sliderRect.width = rect.width
  sliderRect.left = rect.left
}

onMounted(sliderInit)

defineExpose({
  setValue,
  dragStart,
  sliderInit
})
</script>

<style lang="less" scoped>
.player-slider {
  position: relative;
  width: 100%;
  cursor: pointer;

  .postion-abs {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  &__runway {
    .postion-abs;
    width: 100%;
    margin: auto 0 0 0;
    border-radius: 1.5px;
    background-color: hsla(0, 0%, 100%, 0.2);
    transition: all 0.25s;
  }

  &__current {
    .postion-abs;
    transform: scaleX(0);
    transform-origin: 0 0;
    background-color: #00a1d6;
  }

  &__buffer {
    .postion-abs;
    transform: scaleX(0);
    transform-origin: 0 0;
    background-color: hsla(0, 0%, 100%, 0.3);
  }

  &__thumb {
    position: absolute;
    top: 0;
    left: 0;
    background-color: white;

    &-inner {
      position: absolute;

      .block {
        position: relative;
        background: #fff;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        transform: scale(0);
        transition: all 0.25s;
      }
    }
  }
}
</style>
