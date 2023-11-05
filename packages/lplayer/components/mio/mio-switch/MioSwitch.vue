<template>
  <div class="mio-switch">
    <input :id="id" v-model="isChecked" type="checkbox" @change="$emit('change', isChecked)" />
    <label :for="id" :style="labelStyle">
      <span :style="spanStyle"></span>
    </label>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue"

const props = withDefaults(
  defineProps<{
    id: string
    width: number
    height: number
    checked: boolean
    background?: string
  }>(),
  {
    background: "#00aeec"
  }
)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<{
  change: [boolean]
}>()

const isChecked = ref(false)

const id = computed(() => props.id)
const width = computed(() => props.width)
const height = computed(() => props.height)

watch(
  () => props.checked,
  () => {
    isChecked.value = props.checked
  },
  { immediate: true }
)

const labelStyle = computed(() => {
  return {
    width: `${width.value}px`,
    height: `${height.value}px`,
    borderRadius: `${height.value}px`,
    background: isChecked.value ? props.background : ""
  }
})

const spanStyle = computed(() => {
  return {
    top: `${height.value / 16}px`,
    left: `${height.value / 16}px`,
    width: `${height.value - height.value / 8}px`,
    height: `${height.value - height.value / 8}px`,
    transform: `translateX(calc(${isChecked.value ? `100% - 2px` : `0px`}))`
  }
})
</script>

<style lang="less" scoped>
.mio-switch {
  input {
    display: none;
    height: 0;
    width: 0;
  }

  label {
    position: relative;
    display: block;
    background: grey;
    cursor: pointer;

    span {
      position: absolute;
      background: #fff;
      border-radius: 50%;
      transition: 0.3s;
    }
  }
}
</style>
