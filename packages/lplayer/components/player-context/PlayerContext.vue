<template>
  <div
    v-show="ctxShow"
    ref="ctxRef"
    class="mio-player-context"
    :style="contextMenuStyle"
    @click="$emit('click')"
    @contextmenu.prevent="null"
  >
    <ul>
      <li>复制视频地址</li>
      <li>快捷键说明</li>
      <li @click="infoShow = true">视频信息统计</li>
      <li>lplayer-0.0.1</li>
    </ul>
  </div>
  <!-- 信息显示 -->
  <div v-show="infoShow" class="mio-player-info" @contextmenu.prevent="null">
    <div class="mio-player-info-title">
      <div class="title">统计信息</div>
      <div class="close" @click="infoShow = false">×</div>
    </div>
    <div class="mio-player-info-content">
      <ul>
        <li>
          <div class="title">Player Type:</div>
          <div class="info">DashPlayer</div>
        </li>
        <li>
          <div class="title">Resolution:</div>
          <div class="info">{{ playerRect.width }} * {{ playerRect.height }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, CSSProperties, ref } from "vue"

const props = withDefaults(
  defineProps<{
    ctxShow?: boolean
  }>(),
  {
    ctxShow: false
  }
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  click: [void]
}>()

interface PlayerRect {
  width: number
  height: number
  playerWidth: number
  playerHeight: number
}

const infoShow = ref(false)
const ctxRef = ref<HTMLElement | null>(null)
const playerRect = reactive<PlayerRect>({
  width: 0,
  height: 0,
  playerWidth: 0,
  playerHeight: 0
})
const ctxRect = reactive({
  width: 0,
  height: 0
})
const ctxPostion = reactive({
  top: 0,
  left: 0
})
const ctxShow = computed(() => props.ctxShow)
const contextMenuStyle = computed<CSSProperties>(() => {
  return {
    top: ctxPostion.top + "px",
    left: ctxPostion.left + "px"
  }
})

// 打开右键菜单
const open = (
  x: number,
  y: number,
  rect: {
    width: number
    height: number
    playerWidth: number
    playerHeight: number
  }
) => {
  if (!ctxRef.value) return
  ctxRect.width = ctxRef.value.clientWidth
  ctxRect.height = ctxRef.value.clientHeight
  Object.assign(playerRect, rect)
  ctxPostion.left = x + ctxRect.width > playerRect.playerWidth ? x - ctxRect.width : x
  ctxPostion.top = y + ctxRect.height > playerRect.playerHeight ? y - ctxRect.height : y
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const menuClick = () => {}

defineExpose({
  open
})
</script>

<style lang="less" scoped>
.mio-player-context {
  position: absolute;
  top: 0;
  left: 0;
  width: 150px;
  color: black;
  border-radius: 6px;
  overflow: hidden;
  z-index: 40;

  ul {
    width: 100%;
    height: 100%;
    list-style-type: none;
    background-color: rgba(0, 0, 0, 0.8);

    li {
      width: 100%;
      height: 36px;
      line-height: 36px;
      font-size: 12px;
      // text-align: center;
      padding-left: 18px;
      box-sizing: border-box;
      border-bottom: 1px rgba(75, 75, 75, 0.5) solid;
      color: rgb(197, 197, 197);
      user-select: none;
      cursor: pointer;

      &:hover {
        background-color: rgba(75, 75, 75, 0.5);
      }

      &:last-child {
        border: none;
      }
    }
  }
}

.mio-player-info {
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
  overflow: hidden;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 40;

  &-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 300px;
    height: 32px;
    border-bottom: 1px rgba(75, 75, 75, 0.5) solid;

    .title {
      flex: 1;
      font-size: 14px;
      text-align: center;
    }

    .close {
      width: 36px;
      font-size: 28px;
      text-align: center;
      cursor: pointer;
    }
  }

  &-content {
    ul {
      width: 100%;
      height: 100%;
      padding-top: 10px;
      box-sizing: border-box;
      list-style-type: none;
      background-color: rgba(0, 0, 0, 0.8);

      li {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 20px;
      }

      .title {
        width: 100px;
        font-size: 14px;
        line-height: 14px;
        text-align: right;
        color: rgb(205, 205, 205);
      }

      .info {
        flex: 1;
        font-size: 12px;
        color: rgb(159, 159, 159);
        padding-left: 10px;
        box-sizing: border-box;
      }
    }
  }
}
</style>
