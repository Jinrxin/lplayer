<template>
  <component
    ref="lplayer"
    :is="dynamicComponent"
    :option="option"
    @custom-init="hlsInit"
    @change-quality="setQuality"
    @loadedmetadata="setQualityList"
  ></component>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref, shallowRef } from "vue";
import LPlayer from "lplayer";
import type { MioOption } from "lplayer";
import Hls from "hls.js";

export default defineComponent({
  name: "LplayerHls",
  setup() {
    const dynamicComponent = shallowRef<any>(null);
    const lplayer = ref<InstanceType<typeof LPlayer> | null>(null);
    const option = reactive<MioOption>({
      autoplay: false,
      video: {
        // hls测试地址
        cover: "/cover.png",
        src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      },
      customType: true,
    });
    const hls = ref<Hls | null>(null);

    /** 视频初始化 */
    const hlsInit = (
      player: HTMLVideoElement,
      src: string,
      autoplay = false
    ) => {
      if (!hls.value) return;
      if (Hls.isSupported()) {
        hls.value.loadSource(src);
        hls.value.attachMedia(player);
        hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
          // console.log(autoplay)
          // console.log("加载成功")
          // player.play()
        });
        // 监听出错事件
        hls.value.on(Hls.Events.ERROR, (event, data) => {
          console.log("加载失败", event, data);
        });
      } else {
        console.log("不支持的格式");
        return;
      }
    };

    /** 获取视频清晰度 */
    const getQualityList = () => {
      if (!hls.value) return;
      const qualityList: number[] = [];
      hls.value.levels.forEach((item) => {
        qualityList.push(+item.name!);
      });
      return qualityList;
    };

    /** 修改视频清晰度 */
    const setQuality = (quality: number) => {
      if (!hls.value) return;
      const level = hls.value.levels.findIndex(
        (item) => item.name === quality.toString()
      );
      hls.value.currentLevel = level;
    };

    /** 设置清晰度列表 */
    const setQualityList = () => {
      lplayer.value?.setQualityList(getQualityList()!);
    };
    onMounted(() => {
      import("lplayer").then((module) => {
        dynamicComponent.value = module.default;
      });
      import("hls.js").then((module) => {
        hls.value = new module.default();
      });
    });

    return {
      lplayer,
      option,
      dynamicComponent,
      hlsInit,
      setQuality,
      getQualityList,
      setQualityList,
    };
  },
});
</script>
