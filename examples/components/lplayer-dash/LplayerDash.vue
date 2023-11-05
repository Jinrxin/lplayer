<template>
  <l-player
    ref="lplayer"
    :option="option"
    @custom-init="dashInit"
    @change-quality="setBitrate"
    @loadedmetadata="setQualityList"
  />
  <div>
    <button style="margin: 10px" @click="changeVideo">Dash--ChangeVideoResource</button>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue"
import useDash from "../../hooks/useDash"
import LPlayer from "lplayer"
import { MioOption } from "lplayer"

const { dashInit, setBitrate, getBitrateList } = useDash()

const lplayer = ref<InstanceType<typeof LPlayer> | null>(null)
const option = reactive<MioOption>({
  video: {
    // dash 测试地址
    src: "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd"
  },
  customType: true
})

/** 设置清晰度列表 */
const setQualityList = () => {
  if (!option.customType) return
  lplayer.value?.setQualityList(getBitrateList())
}

/** 切换视频 */
const changeVideo = () => {
  if (!lplayer.value) return
  lplayer.value?.changeVideo("http://file.konmio.com/hls/gmtx.mpd")
  // changeVideoSrc(lplayer.value.video, "http://file.konmio.com/hls/gmtx.mpd")
}
</script>
