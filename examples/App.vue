<template>
  <div id="app">
    <div class="player-container">
      <div class="player-wrapper">
        <mio-player
          v-if="playerType === 'mp4'"
          ref="lplayer"
          :option="option"
          :next="true"
          @next="nextVideo"
        />
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
        <button style="margin: 10px" @click="playerType = 'mp4'">
          ToMp4Player
        </button>
        <button style="margin: 10px" @click="playerType = 'hls'">
          ToHlsPlayer
        </button>
        <button style="margin: 10px" @click="playerType = 'dash'">
          ToDashPlayer
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import MioPlayer from "lplayer";
import { MioOption } from "lplayer";
import LplayerDash from "./components/lplayer-dash/LplayerDash.vue";
import LplayerHls from "./components/lplayer-hls/LplayerHls.vue";

const playerType = ref("dash");
const lplayer = ref<InstanceType<typeof MioPlayer> | null>(null);
const option = reactive<MioOption>({
  autoplay: false,
  video: {
    src: "http://file.konmio.com/video/gm.mp4",
  },
});

/** 切换视频 */
const changeVideo = () => {
  if (!lplayer.value) return;
  lplayer.value.changeVideo("http://file.konmio.com/video/gmtx.mp4");
};

const nextVideo = () => {
  if (!lplayer.value) return;
  lplayer.value.changeVideo("http://file.konmio.com/video/gmtx.mp4");
};
</script>

<style lang="less">
* {
  margin: 0;
  padding: 0;
}

button {
  height: 28px;
  padding: 6px;
  border: none;
  cursor: pointer;
  border-radius: 2px;
  background-color: rgb(186, 235, 255);
}
</style>

<style lang="less" scoped>
.player-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  // padding-top: 120px;
  box-sizing: border-box;
  // justify-content: center;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.player-wrapper {
  // width: 480px;
  // height: 270px;
  width: 960px;
  height: 540px;
  // width: 80%;
  // height: 60%;
  // margin: 36px 0 70px 0;
}
// video {
//   // width: 960px;
//   // height: 540px;
//   // width: 80%;
//   // height: 60%;
//   margin: 36px 0 70px 0;
// }
</style>
