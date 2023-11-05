# 快速开始

## 安装

```shell
#使用npm安装
npm install lplayer

#使用yarn安装
yarn add lplayer
```

## 引入 lplayer

### 示例

播放器接收一个 `option` prop。通过修改 `options` 可以自定义播放器，详情请查看 [参数](parameters)。

```vue
<template>
  <l-player :option="option"></l-player>
</template>

<script setup lang="ts">
import LPlayer from "lplayer";
import type { MioOption } from "lplayer";

const option: MioOption = {
  video: {
    src: "视频地址",
  },
};
</script>
```
