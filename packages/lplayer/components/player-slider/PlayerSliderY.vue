<template>
  <div ref="sliderRef" class="player-slider" @click="setValue">
    <div class="player-slider__runway" :style="{ width: `${width}px` }">
      <div class="player-slider__current" :style="currentStyle"></div>
      <div class="player-slider__thumb" :style="thumbStyle">
        <div class="player-slider__thumb-inner" :style="thumbInnerStyle">
          <div class="block" :style="{ transform: `scale(${props.thumbShow ? 1 : 0})` }"></div>
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
    // 实时占比
    modelValue: number
    width?: number
    min?: number
    max?: number
    thumbSize?: number
    thumbShow?: boolean
  }>(),
  {
    width: 2,
    min: 0,
    max: 100,
    thumbSize: 8,
    thumbShow: true
  }
)
const emit = defineEmits<{
  // 进度改变
  dragStart: [void]
  dragEnd: [void]
  dargMove: [e: MouseEvent]
  change: [percent: number]
  // 更新当前进度
}>()

const isDrag = ref(false)
// 操作时占比
const realValue = ref(props.modelValue)
const sliderRef = ref<HTMLDivElement | null>(null)
const sliderRect = reactive({
  height: 0,
  bottom: 0
})

// 当前进度
const currentStyle = computed<CSSProperties>(() => {
  return {
    height: `${props.modelValue}%`
  }
})
// 按钮
const thumbStyle = computed<CSSProperties>(() => {
  return {
    transform: `translateY(${-(sliderRect.height * props.modelValue) / props.max}px)`
  }
})
const thumbInnerStyle = computed<CSSProperties>(() => {
  return {
    left: `-${(props.thumbSize - props.width) / 2}px`,
    width: `${props.thumbSize}px`,
    height: `${props.thumbSize}px`
  }
})

// 设置当前进度值
const setValue = (e: MouseEvent) => {
  const thumbOffsetY = +(sliderRect.bottom - e.pageY).toFixed(0)
  realValue.value = numLimit(+((thumbOffsetY / sliderRect.height) * 100).toFixed(4), 0, 100)
  emit("change", realValue.value)
  return realValue.value
}
// 拖拽开始
const dragStart = () => {
  isDrag.value = true
  emit("dragStart")
  onEnter()
}
// 拖拽中
const dargMove = (e: MouseEvent) => {
  setValue(e)
  emit("dargMove", e)
}

// 拖拽结束
const dragEnd = () => {
  if (!isDrag.value) return
  isDrag.value = false
  emit("dragEnd")
  document.onmousemove = document.onmouseup = null
}

const onEnter = () => {
  document.onmousemove = dargMove
  document.onmouseup = dragEnd
}
// 初始化进度条信息
const sliderYInit = () => {
  if (!sliderRef.value) return
  const rect = sliderRef.value.getBoundingClientRect()
  sliderRect.height = rect.height
  sliderRect.bottom = rect.bottom
}

onMounted(sliderYInit)

defineExpose({
  onEnter,
  setValue,
  dragStart,
  sliderYInit
})
</script>

<style lang="less" scoped>
.player-slider {
  position: relative;
  height: 100%;
  cursor: pointer;

  &__runway {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    left: 0;
    height: 100%;
    margin: auto 0 0 0;
    border-radius: 1.5px;
    background-color: hsla(0, 0%, 100%, 0.2);
    transition: all 0.25s;
  }

  &__current {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: #00a1d6;
  }

  &__thumb {
    position: absolute;
    top: calc(100% - 2px);
    left: 0;
    background-color: white;

    &-inner {
      position: absolute;

      .block {
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
