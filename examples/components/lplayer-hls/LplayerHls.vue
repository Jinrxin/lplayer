<template>
  <l-player
    ref="lplayer"
    :option="option"
    @custom-init="hlsInit"
    @change-quality="setQuality"
    @loaded-metadata="setQualityList"
  />
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import LPlayer from "lplayer";
import type { MioOption } from "lplayer";
import useHls from "../../hooks/useHls";

const { hlsInit, getQualityList, setQuality } = useHls();

const lplayer = ref<InstanceType<typeof LPlayer> | null>(null);
const option = reactive<MioOption>({
  autoplay: false,
  video: {
    // hls测试地址
    src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  customType: true,
});

/** 设置清晰度列表 */
const setQualityList = () => {
  lplayer.value?.setQualityList(getQualityList());
};
</script>
