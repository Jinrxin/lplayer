# 快速开始

> docs: http://lplayer.konmio.com/

## 安装

```shell
#使用npm安装
npm install lplayer

#使用yarn安装
yarn add lplayer
```

## 引入 lplayer

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
