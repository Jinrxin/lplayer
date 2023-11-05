# 流媒体支持

> 需要将参数 `customType` 设置为 `true`, 会执行 `customInit` 回调，函数传递三个参数，分别是播放器元素、视频链接自动播放。

## HLS

1. 安装 hls.js

```shell
npm install hls.js --save
```

```vue
<template>
  <div>
    <l-player
      ref="lplayer"
      :option="option"
      @custom-init="hlsInit"
      @change-quality="changeQuality"
      @loaded-metadata="setQualityList"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import LPlayer from "lplayer";
import type { MioOption } from "lplayer";
import Hls from "hls.js";

const hls = new Hls();
const lplayer = ref<InstanceType<typeof LPlayer> | null>(null);
const option = reactive<MioOption>({
  video: {
    // hls测试地址
    src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  customType: true,
});

/** 视频初始化 */
const hlsInit = (player: HTMLVideoElement, src: string, autoplay = false) => {
  if (Hls.isSupported()) {
    hls.loadSource(src);
    hls.attachMedia(player);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log("加载成功");
    });
    // 监听出错事件
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.log("加载失败", event, data);
    });
  } else {
    console.log("不支持的格式");
    return;
  }
};

/** 获取视频清晰度 */
const getQualityList = () => {
  const qualityList: number[] = [];
  hls.levels.forEach((item) => {
    qualityList.push(+item.name!);
  });
  return qualityList;
};

/** 修改视频清晰度 */
const changeQuality = (quality: number) => {
  const level = hls.levels.findIndex(
    (item) => item.name === quality.toString()
  );
  hls.currentLevel = level;
};

/** 设置清晰度列表 */
const setQualityList = () => {
  if (!lplayer.value) return;
  lplayer.value.setQuality(getQualityList());
};
</script>
```

## MEPG DASH

1. 安装 dashjs

```shell
npm install dashjs --save
```

```vue
<template>
  <div>
    <l-player
      ref="lplayer"
      :option="option"
      @custom-init="hlsInit"
      @change-quality="changeQuality"
      @loaded-metadata="setQualityList"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import LPlayer from "lplayer";
import type { MioOption } from "lplayer";
import dashjs from "dashjs";

const dash = dashjs.MediaPlayer().create();
const lplayer = ref<InstanceType<typeof LPlayer> | null>(null);
const option = reactive<MioOption>({
  video: {
    src: "",
  },
  customType: true,
});

/** 视频初始化 */
const dashInit = (
  player: HTMLVideoElement,
  src: string,
  autoplay = false,
  startTime = 0
) => {
  dash.initialize(player, src, autoplay, startTime);
};

/** 获取轨道列表 */
const getBitrateList = () => {
  const qualityList: number[] = [];
  if (dash.isReady())
    // 获取当前轨道比特率列表
    dash.getBitrateInfoListFor("video").forEach((item) => {
      qualityList.push(+item.height!);
    });
  return qualityList;
};

/** 切换比特率（清晰度） */
const setBitrate = (quality: number) => {
  if (!dash.isReady()) return;
  const bitrateList = dash.getBitrateInfoListFor("video");
  const qualityIndex = bitrateList.findIndex((item) => item.height === quality);
  // 是否开启ABR(自动选择)
  dash.updateSettings({
    streaming: {
      abr: {
        autoSwitchBitrate: {
          video: qualityIndex === -1 && quality === 1 ? true : false,
          audio: qualityIndex === -1 && quality === 1 ? true : false,
        },
      },
    },
  });
  // 开启ABR后此设置会被覆盖
  dash.setQualityFor("video", qualityIndex, false);
};

/** 设置清晰度列表 */
const setQualityList = () => {
  if (!lplayer.value) return;
  lplayer.value.setQuality(getBitrateList());
};
</script>
```
