<template>
  <div ref="sliderRef" class="player-slider">
    <!-- 跑道 -->
    <div class="player-slider__runway" :style="{ height: `${height}px` }">
      <!-- 缓存 -->
      <div v-show="buffer" class="player-slider__buffer" :style="bufferStyle"></div>
      <!-- 当前进度 -->
      <div class="player-slider__current" :style="currentStyle"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, CSSProperties } from "vue"

const props = withDefaults(
  defineProps<{
    // 实时占比（百分比 0 - 100）
    value: number
    buffer?: number
    height?: number
    min?: number
    max?: number
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

const sliderRef = ref<HTMLDivElement | null>(null)
const sliderRect = reactive({
  width: 0,
  left: 0
})

// 当前进度
const currentStyle = computed<CSSProperties>(() => {
  return {
    transform: `scaleX(${(props.value / props.max).toFixed(4)})`
  }
})
// 缓冲进度
const bufferStyle = computed<CSSProperties>(() => {
  return {
    transform: `scaleX(${props.buffer / props.max})`
  }
})

// 初始化进度条信息
const sliderInit = () => {
  if (!sliderRef.value) return
  const rect = sliderRef.value.getBoundingClientRect()
  sliderRect.width = rect.width
  sliderRect.left = rect.left
}

onMounted(sliderInit)
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
    background-color: skyblue;
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
