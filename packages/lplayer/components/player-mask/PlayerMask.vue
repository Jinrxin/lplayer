<template>
  <div
    class="mio-player__mask"
    :style="{ cursor: cursorVisble ? 'auto' : 'none' }"
    @click="emit('handlePlay')"
    @dblclick="$emit('fullScreen')"
    @contextmenu.prevent="(e) => $emit('contextmenu', e)"
  >
    <transition name="play">
      <div v-show="status === PlayerStatus.Paused" class="player-icon">
        <icon-play2 />
      </div>
    </transition>
  </div>
  <div v-show="loading" class="mio-player__loading">
    <transition name="loading">
      <div v-show="loading" class="mio-player__loading--icon">
        <icon-loading />
      </div>
    </transition>
  </div>
  <div v-show="status === PlayerStatus.Failed" class="mio-player__bad">
    <span>暂无播放内容~</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { PlayerStatus } from "../../types/player"
import IconPlay2 from "../../icon/IconPlay2.vue"
import IconLoading from "../../icon/IconLoading.vue"

const props = withDefaults(
  defineProps<{
    status?: PlayerStatus
    cursorVisble?: boolean
  }>(),
  {
    status: PlayerStatus.None,
    cursorVisble: true
  }
)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  handlePlay: [void]
  fullScreen: [void]
  contextmenu: [void]
}>()

const status = computed(() => props.status)
const cursorVisble = computed(() => props.cursorVisble)

const loading = computed(() => props.status === PlayerStatus.Loading)
</script>

<style lang="less" scoped>
.mio-player {
  .mask(@height: 100%) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: @height;
  }

  // 交互层
  &__mask {
    .mask(calc(100%));
    z-index: 30;
    .player-icon {
      position: absolute;
      right: 30px;
      bottom: 56px;
      width: 60px;
      height: 60px;
      cursor: pointer;
      text-shadow: 0 4px 16px rgb(0 0 0 / 40%);
    }
  }

  // 加载层
  &__loading {
    .mask;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;

    &-icon {
      width: 50px;
      height: 50px;
    }
  }

  // 错误、通知层
  &__bad {
    .mask;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 40;
    background: #000;
    img {
      width: 100px;
    }
    span {
      font-weight: 600;
      font-size: 20px;
      // margin-top: 30px;
      color: white;
    }
    &::after {
      content: "";
      .mask;
    }
  }
}

.play-enter-active,
.play-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.play-enter-from,
.play-leave-to {
  opacity: 0;
}

.loading-enter-active,
.loading-leave-active {
  transition: all 0.5s ease-out;
}
.loading-enter-from,
.loading-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
