# 事件

## video 事件

- `error`
- `onplay`
- `onpause`
- `onended`
- `canplay`
- `seeked`
- `waiting`
- `playing`
- `timeupdate`
- `ratechange`
- `volumechange`
- `loadedmetadata`

## 播放器事件

- `next` 点击下一集按钮触发
- `previous` 点击上一集按钮触发

- `changeQuality(quality: number)` 切换清晰度触发

- `customInit(player: HTMLVideoElement, src:string, autoplay: boolean)` 自定义视频初始化信息<sup>[1]</sup>

### 注意

[1]. 将参数 `customType` 设置为 `true` 时触发
