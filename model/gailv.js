export async function gailv() {
  let num = Math.floor(Math.random() * 100) + 1
  let nums = new Set()
  while (nums.has(num)) {
    num = Math.floor(Math.random() * 100) + 1
  }
  nums.add(num)
  if (nums.size === 100) nums.clear()
  return num
}