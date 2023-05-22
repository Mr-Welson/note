// 平铺小网格背景
export function addGridBg(canvas, themeMode) {
  const ctx = canvas.getContext('2d')
  // 平铺网格
  let canvasGrid = document.createElement('canvas')
  canvasGrid.width = 60
  canvasGrid.height = 60
  const ctxGrid = canvasGrid.getContext('2d')
  if (themeMode === 'dark') {
    ctxGrid.strokeStyle = 'rgba(255, 255, 255, 0.15)'
  } else {
    ctxGrid.strokeStyle = 'rgba(0, 0, 0, 0.1)'
  }
  ctxGrid.strokeRect(0, 0, canvasGrid.width, canvasGrid.height)
  // 绘制网格
  ctx.fillStyle = ctx.createPattern(canvasGrid, 'repeat')
  ctx.fillRect(0, 0, canvas.width * 10, canvas.height * 100)
}

// 平铺水印
export function addWaterMark(canvas, watermark, themeMode) {
  const ctx = canvas.getContext('2d')

  // 平铺水印
  let canvasWater = document.createElement('canvas')
  // 水印大小
  canvasWater.width = canvas.width / 8
  canvasWater.height = canvas.height / 20

  const ctxWater = canvasWater.getContext('2d')
  // ctxWater.strokeStyle = 'rgba(0, 0, 0, 0.1)'
  // ctxWater.strokeRect(0, 0, canvasWater.width, canvasWater.height)
  ctxWater.font = '16px Microsoft Yahei'

  if (themeMode === 'dark') {
    ctxWater.fillStyle = 'rgba(255, 255, 255, 0.15)'
  } else {
    ctxWater.fillStyle = 'rgba(0, 0, 0, 0.07)'
  }
  // 水平水印
  ctxWater.fillText(watermark, 0, 20)
  // 旋转水印
  // ctxWater.rotate((-20 * Math.PI) / 180)
  // ctxWater.fillText(watermark, 0, canvasWater.height / 2 + 20)
  // ctxWater.rotate((20 * Math.PI) / 180)

  // 绘制重复的水印
  ctx.fillStyle = ctx.createPattern(canvasWater, 'repeat')
  ctx.fillRect(0, 0, canvas.width * 10, canvas.height * 100)
}

// 下载函数
export function tagAToDownload({ url, title = '', target = '_blank' }) {
  let tagA = document.createElement('a')
  tagA.setAttribute('href', url)
  tagA.setAttribute('download', title)
  tagA.setAttribute('target', target)
  document.body.appendChild(tagA)
  tagA.click()
  document.body.removeChild(tagA)
}
