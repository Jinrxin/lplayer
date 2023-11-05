/**
 * 数字大小限制
 * @param num 传入数字
 * @param min 最小值
 * @param max 最大值
 * @returns 区间内的值
 */
export const numLimit = (num: number, min = 0, max = 100) => {
  return Math.max(min, Math.min(num, max))
}

/**
 * 防抖
 * @param callback 执行方法
 * @param delay 间隔时间
 * @param immediate 是否先执行
 */
export function debounce<T extends unknown[]>(
  callback: (...args: T) => void,
  delay = 300,
  immediate = false
) {
  let timer: NodeJS.Timeout | null = null
  const cb = function (this: unknown, ...args: T) {
    timer && clearTimeout(timer)
    if (immediate) {
      const isEnter = !timer
      timer = setTimeout(() => {
        timer = null
      }, delay)
      isEnter && callback.apply(this, args)
    } else {
      timer = setTimeout(() => {
        callback.apply(this, args)
      }, delay)
    }
  }
  return cb
}

/**
 * 节流
 * @param callback 执行方法
 * @param delay 间隔时间
 */
export function throttle<T extends unknown[]>(callback: (...args: T) => void, delay = 300) {
  let flag = false
  return function (this: unknown, ...args: T) {
    if (flag) return
    flag = true
    setTimeout(() => {
      callback.apply(this, args)
      flag = false
    }, delay)
  }
}
