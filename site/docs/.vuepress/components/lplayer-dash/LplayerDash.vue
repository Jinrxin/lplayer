<template>
  <!-- currentTab 改变时组件也改变 -->
  <component
    ref="lplayer"
    :is="dynamicComponent"
    :option="option"
    @custom-init="dashInit"
    @change-quality="setBitrate"
    @loadedmetadata="setQualityList"
  ></component>
  <div>
    <button style="margin: 10px" @click="changeVideo">
      Dash--ChangeVideoResource
    </button>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  shallowRef,
} from "vue";
import LPlayer from "lplayer";
import type { MioOption } from "lplayer";
import dashjs from "dashjs";

export default defineComponent({
  name: "LplayerDash",
  setup() {
    const dynamicComponent = shallowRef<any>(null);
    const lplayer = ref<InstanceType<typeof LPlayer> | null>(null);
    const option = reactive<MioOption>({
      video: {
        // dash 测试地址
        src: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
      },
      customType: true,
    });
    const dash = ref<dashjs.MediaPlayerClass | null>(null);

    const dashDyanmic = reactive<{
      player: HTMLVideoElement | null;
      src: string;
    }>({
      player: null,
      src: "",
    });
    /** 视频初始化 */
    const dashInit = (
      player: HTMLVideoElement,
      src: string,
      autoplay = false,
      startTime = 0
    ) => {
      dashDyanmic.src = src ? src : dashDyanmic.src;
      dashDyanmic.player = player ? player : dashDyanmic.player;
      dash.value?.initialize(
        dashDyanmic.player!,
        dashDyanmic.src,
        autoplay,
        startTime
      );
    };
    /** 获取比特率列表 */
    const getBitrateList = () => {
      if (!dash.value) return;
      const qualityList: number[] = [];
      if (dash.value.isReady())
        // 获取当前轨道比特率列表
        dash.value.getBitrateInfoListFor("video").forEach((item) => {
          qualityList.push(+item.height!);
        });
      return qualityList;
    };
    /** 切换比特率（清晰度） */
    const setBitrate = (quality: number) => {
      if (!dash.value) return;
      if (!dash.value.isReady()) return;
      const bitrateList = dash.value.getBitrateInfoListFor("video");
      const qualityIndex = bitrateList.findIndex(
        (item) => item.height === quality
      );
      dash.value.updateSettings({
        streaming: {
          abr: {
            autoSwitchBitrate: {
              video: qualityIndex === -1 && quality === 1 ? true : false,
              audio: qualityIndex === -1 && quality === 1 ? true : false,
            },
          },
          buffer: {
            flushBufferAtTrackSwitch: true,
          },
        },
      });
      // 开启ABR会覆盖清晰度选项
      dash.value.setQualityFor("video", qualityIndex, true);
    };
    /** 设置清晰度列表 */
    const setQualityList = () => {
      if (!option.customType) return;
      lplayer.value?.setQualityList(getBitrateList()!);
    };

    /** 切换视频 */
    const changeVideo = () => {
      if (!lplayer.value) return;
      lplayer.value?.changeVideo("http://file.konmio.com/hls/gmtx.mpd");
      // dash.value?.reset();
      // dash.value?.initialize(
      //   lplayer.value.video,
      //   "http://file.konmio.com/hls/gmtx.mpd"
      // );
    };

    onMounted(() => {
      import("lplayer").then((module) => {
        dynamicComponent.value = module.default;
      });
      import("dashjs").then((module) => {
        dash.value = module.default.MediaPlayer().create();
        if (dashDyanmic.player) dashInit(dashDyanmic.player, dashDyanmic.src);
      });
    });

    return {
      option,
      lplayer,
      dynamicComponent,
      dashInit,
      changeVideo,
      setBitrate,
      getBitrateList,
      setQualityList,
    };
  },
});
</script>
