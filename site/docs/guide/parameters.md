# 参数

> LPlayer 有丰富的参数可以自定义你的播放器实例

| 内容                     | 类型                       | 默认值             | 描述               |
| :----------------------- | :------------------------- | :----------------- | :----------------- |
| volume                   | number                     | 70                 | 播放器音量         |
| autoplay                 | boolean                    | true               | 自动播放           |
| playbackSpeed            | number[]                   | [0.5,0.75,1,1.5,2] | 倍速选项           |
| preload                  | 'none', 'auto', 'metadata' | "auto"             | 视频预加载         |
| next                     | boolean                    | false              | 控制栏上一集按钮   |
| previous                 | boolean                    | false              | 控制栏下一集按钮   |
| customType<sup>[1]</sup> | boolean                    | true               | 自定义视频类型     |
| video                    | Object                     | -                  | 视频信息           |
| video.src                | string                     | -                  | 视频信息           |
| video.type               | string                     | "mp4"              | 视频类型           |
| video.cover              | string                     | -                  | 视频封面           |
| video.thumbnails         | string                     | -                  | 自定义进度条提示点 |

[1]. 若 `customType` 设置为 `false` ，则播放器将不支持流媒体视频播放。

```ts
const option = reactive<MioOption>({
  preload: "auto",
  autoplay: false,
  volume: 100,
  playbackSpeed: [0.5, 0.75, 1, 1.5, 2],
  customType: true,
  video: {
    cover: "",
    type: "hls",
    thumbnails: "",
    src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
});
```
