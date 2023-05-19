// 平铺小网格背景
export function addGridBg(canvas) {
  const ctx = canvas.getContext('2d')
  // 平铺网格
  let canvasGrid = document.createElement('canvas')
  canvasGrid.width = 60
  canvasGrid.height = 60
  const ctxGrid = canvasGrid.getContext('2d')
  ctxGrid.strokeStyle = 'rgba(0, 0, 0, 0.1)'
  ctxGrid.strokeRect(0, 0, canvasGrid.width, canvasGrid.height)
  // 绘制网格
  ctx.fillStyle = ctx.createPattern(canvasGrid, 'repeat')
  ctx.fillRect(0, 0, canvas.width * 10, canvas.height * 60)
}

// 平铺水印
export function addWaterMark(canvas, watermark) {
  const ctx = canvas.getContext('2d')

  // 平铺水印
  let canvasWater = document.createElement('canvas')
  // 水印大小
  canvasWater.width = canvas.width / 6
  canvasWater.height = canvas.height / 10

  const ctxWater = canvasWater.getContext('2d')
  // ctxWater.strokeStyle = 'rgba(0, 0, 0, 0.1)'
  // ctxWater.strokeRect(0, 0, canvasWater.width, canvasWater.height)
  ctxWater.font = '16px Microsoft Yahei'
  ctxWater.fillStyle = 'rgba(0, 0, 0, 0.2)'
  // 水平水印
  ctxWater.fillText(watermark, 30, 60)
  // 旋转水印
  // ctxWater.rotate((-20 * Math.PI) / 180)
  // ctxWater.fillText(watermark, 0, canvasWater.height / 2 + 20)
  // ctxWater.rotate((20 * Math.PI) / 180)

  // 绘制重复的水印
  ctx.fillStyle = ctx.createPattern(canvasWater, 'repeat')
  ctx.fillRect(0, 0, canvas.width * 10, canvas.height * 60)
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
