/**
 * 格式化时间
 *
 * @param second
 * @return  00:00 or 00:00:00
 */
export const secondToTime = (second: string | number) => {
  second = second || 0
  if (second === 0 || second === Infinity || second.toString() === "NaN") {
    return "00:00"
  }
  const add0 = (num: number) => (num < 10 ? "0" + num : "" + num)
  const hour = Math.floor((second as number) / 3600)
  const min = Math.floor(((second as number) - hour * 3600) / 60)
  const sec = Math.floor((second as number) - hour * 3600 - min * 60)
  return (hour > 0 ? [hour, min, sec] : [min, sec]).map(add0).join(":")
}
