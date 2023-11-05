<template>
  <div class="player-container">
    <div class="player-wrapper">
      <mio-player v-if="playerType === 'mp4'" ref="lplayer" :option="option" />
      <lplayer-hls v-if="playerType === 'hls'" />
      <lplayer-dash v-if="playerType === 'dash'" />
      <div>
        <button
          v-show="playerType === 'mp4'"
          style="margin: 10px"
          @click="changeVideo"
        >
          Mp4--ChangeVideoResource
        </button>
      </div>
    </div>
    <div style="float: left">
      <button style="margin: 10px" @click="playerType = 'mp4'">ToMp4</button>
      <button style="margin: 10px" @click="playerType = 'hls'">ToHls</button>
      <button style="margin: 10px" @click="playerType = 'dash'">ToDash</button>
    </div>
    <div class="video-type">
      VideoType: <b> {{ playerType || null }}</b>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import MioPlayer from "lplayer";
import type { MioOption } from "lplayer";
import LplayerHls from "./lplayer-hls/LplayerHls.vue";
import LplayerDash from "./lplayer-dash/LplayerDash.vue";

const playerType = ref("dash");
const lplayer = ref<InstanceType<typeof MioPlayer> | null>(null);
const option = reactive<MioOption>({
  autoplay: false,
  video: {
    // mp4
    src: "http://file.konmio.com/video/gm.mp4",
  },
  customType: true,
});
/** 切换视频 */
const changeVideo = () => {
  if (!lplayer.value) return;
  lplayer.value.changeVideo("http://file.konmio.com/video/gmtx.mp4");
};
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
}
</style>

<style lang="less" scoped>
.player-container {
  position: absolute;
  top: 70px;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
}
.player-wrapper {
  width: 960px;
  height: 540px;
}
.video-type {
  position: absolute;
  right: 10px;
  bottom: 12px;
}
</style>
