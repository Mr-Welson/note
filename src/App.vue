<template>
  <div class="header">
    <input class="address" placeholder="请输入知乎章节地址" v-model="address" />
    <div class="config_list">
      <div class="config_item">
        <div class="label">首页行数：</div>
        <input type="number" class="value" placeholder="请设置首页行数" v-model="firstPageSize" />
      </div>
      <div class="config_item">
        <div class="label">每页行数：</div>
        <input type="number" class="value" placeholder="请设置一页行数" v-model="pageSize" />
      </div>
      <div class="config_item">
        <div class="label">最大页码：</div>
        <input type="number" class="value" placeholder="请设置最大页码" v-model="maxPage" />
      </div>
      <div class="config_item watermark">
        <div class="label">关键字：</div>
        <input class="value" placeholder="请输入关键字" v-model="watermark" />
      </div>
    </div>
    <button class="btn debugger_btn" @click="onDebugger">调试图片</button>
    <button class="btn" @click="onStart">下载图片</button>
  </div>
  <div class="preview">
    <img :src="imgPreview" alt="" />
  </div>
  <div class="container" v-html="content"></div>
  <div class="pages" ref="pagesRef"></div>
</template>

<script setup>
import html2canvas from 'html2canvas'
import axios from 'axios'
import { ref, nextTick } from 'vue'
import { dom } from './dom'

const watermark = ref('我是关键字')
const firstPageSize = ref(6)
const pageSize = ref(10)
const maxPage = ref(40)
const address = ref()
// 'https://www.zhihu.com/market/paid_column/1636449898307194880/section/1637814430120218624'

const content = ref(null)
const pagesRef = ref(null)
const imgPreview = ref('')
const debuggerMode = ref(false)

// 调试按钮
const onDebugger = () => {
  debuggerMode.value = true
  content.value = dom
  nextTick(() => {
    downloadImages()
  })
}
const onStart = () => {
  if (!address.value.trim()) {
    alert('请输入文章地址')
  }
  debuggerMode.value = false
  pagesRef.value.innerHTML = ''
  axios({
    method: 'get',
    url: 'http://localhost:5002/zhihu',
    params: {
      url: address.value
    }
  }).then((res) => {
    content.value = res.data
    nextTick(() => {
      insertPages()
      downloadImages()
    })
  })
}
// 下载图片
const downloadImages = async () => {
  const pageTags = document.querySelectorAll('.page')
  const pageList = Array.from(pageTags).slice(0, maxPage.value || 40)
  pageList.forEach((p, i) => {
    setTimeout(() => {
      // 调试用代码
      // i < 1 && getImage(p, i + 1)
      getImage(p, i + 1)
    }, i * 500)
  })
}

// 解析 pages DOM
function insertPages() {
  const pList = document.querySelectorAll('p')
  let container = []
  let pagenumber = 1
  pList.forEach((p, i) => {
    container.push(p)
    // 第一页只截 firstPageSize 行 ||  || 最后一页
    if (
      i === firstPageSize.value - 1 ||
      (i - firstPageSize.value) % pageSize.value === pageSize.value - 1 ||
      i === pList.length - 1
    ) {
      const div = document.createElement('div')
      div.innerHTML = `<span class="number"> - ${pagenumber} -</span>`
      div.setAttribute('class', 'page')
      pagesRef.value.appendChild(div)
      container.forEach((c) => div.appendChild(c))
      container = []
      pagenumber++
    }
  })
  content.value = ''
}
// 生成图片
function getImage(targetEle, index) {
  return html2canvas(targetEle, {
    width: 1080,
    height: 1440
    // backgroundColor: 'transparent'
  }).then((canvas) => {
    const text = watermark.value.trim()
    text && addWaterMark(canvas, text)

    const base64Url = canvas.toDataURL('image/png')

    // 调试用代码
    imgPreview.value = base64Url

    if (!debuggerMode.value) {
      const result = { url: base64Url, title: `${index}.png` }
      tagAToDownload(result)
    }
    return base64Url
  })
}
// 下载函数
function tagAToDownload({ url, title = '', target = '_blank' }) {
  let tagA = document.createElement('a')
  tagA.setAttribute('href', url)
  tagA.setAttribute('download', title)
  tagA.setAttribute('target', target)
  document.body.appendChild(tagA)
  tagA.click()
  document.body.removeChild(tagA)
}
// 平铺水印
function addWaterMark(canvas, watermark) {
  const ctx = canvas.getContext('2d')

  // 平铺网格
  let canvasGrid = document.createElement('canvas')
  canvasGrid.width = 60
  canvasGrid.height = 60
  const ctxGrid = canvasGrid.getContext('2d')
  ctxGrid.strokeStyle = 'rgba(0, 0, 0, 0.1)'
  ctxGrid.strokeRect(0, 0, canvasGrid.width, canvasGrid.height)
  // 绘制网格
  // ctx.fillStyle = ctx.createPattern(canvasGrid, 'repeat')
  // ctx.fillRect(0, 0, canvas.width * 10, canvas.height * 40)

  // 平铺水印
  let canvasWater = document.createElement('canvas')
  // 水印大小
  canvasWater.width = canvas.width / 6
  canvasWater.height = canvas.height / 10

  const ctxWater = canvasWater.getContext('2d')
  ctxWater.strokeStyle = 'rgba(0, 0, 0, 0.1)'
  ctxWater.strokeRect(0, 0, canvasWater.width, canvasWater.height)
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
  ctx.fillRect(0, 0, canvas.width * 10, canvas.height * 50)
}
</script>
