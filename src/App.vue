<template>
  <div
    class="layout bgimage"
    :class="{
      dark: themeMode === 'dark',
      light: themeMode === 'light'
    }"
  >
    <div class="header">
      <input class="address" placeholder="请输入知乎章节地址" v-model="address" />
      <div class="config_list">
        <div class="config_item">
          <div class="label">首页行数：</div>
          <input type="number" class="value" placeholder="请设置首页行数" v-model="firstPageSize" />
        </div>
        <div class="config_item">
          <div class="label">最大行数：</div>
          <input type="number" class="value" placeholder="请设置一页最大行数" v-model="pageSize" />
        </div>
        <div class="config_item">
          <div class="label">最大页码：</div>
          <input type="number" class="value" placeholder="请设置截图最大页码" v-model="maxPage" />
        </div>
        <div class="config_item">
          <div class="label">网格背景：</div>
          <div class="value radio_wrapper">
            <label>
              <input
                type="radio"
                name="grid"
                value="1"
                :checked="gridMode === '1'"
                @change="onGridChange"
              />是
            </label>
            <label>
              <input
                type="radio"
                name="grid"
                value="0"
                :checked="gridMode === '0'"
                @change="onGridChange"
              />否
            </label>
          </div>
        </div>
        <div class="config_item">
          <div class="label">主题模式：</div>
          <div class="value radio_wrapper">
            <label>
              <input
                type="radio"
                name="theme"
                value="light"
                :checked="themeMode === 'light'"
                @change="onThemeChange"
              />
              <span class="light_theme"></span>
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                value="dark"
                @change="onThemeChange"
                :checked="themeMode === 'dark'"
              />
              <span class="dark_theme"></span>
            </label>
          </div>
        </div>
        <div class="config_item"></div>
        <!-- <div class="config_item">
          <div class="label">页面比例：</div>
          <select class="value select_item">
            <option value="1440">3:4(1080:1440)</option>
            <option value="1620">2:3(1080:1620)</option>
            <option value="1500">自定义(1080:1500)</option>
          </select>
        </div> -->
        <div class="config_item watermark">
          <div class="label">关键字：</div>
          <input class="value" placeholder="请输入关键字" v-model="watermark" />
        </div>
      </div>
      <button class="btn debugger_btn" @click="onDebugger">调试图片</button>
      <button class="btn" @click="onDownload">下载图片</button>
    </div>
    <div class="preview">
      <img :src="imgPreview" alt="" />
    </div>
    <div class="container" v-html="content"></div>
    <div class="page_list" ref="pagesRef"></div>
  </div>
</template>

<script setup>
import html2canvas from 'html2canvas'
import axios from 'axios'
import { ref, nextTick } from 'vue'
import { dom } from './dom'
import { addGridBg, addWaterMark, tagAToDownload } from './utils'

// 页面比例
// const aspectRatio = 3 / 4
// const height = 1080 / aspectRatio
const height = 1500
// 一行最大字数 34px:22 | 35px:21 | 36px:20
const maxTextLength = 22

// 是否打印网格背景(默认显示)
const gridMode = ref('0')
// 主题模式(默认浅色)
const themeMode = ref('light')
// 水印内容, 为空时不打印水印
const watermark = ref('')
// 首页显示行数
const firstPageSize = ref(5)
// 页面显示行数
const pageSize = ref(8)
// 截取的最大页码数
const maxPage = ref(60)
// 文章链接地址
const address = ref()
// const address = ref(
//   'https://www.zhihu.com/market/paid_column/1638186406705827840/section/1641877398021672960'
// )

// 爬虫获取的知乎文章内容
const content = ref(null)
// 文章解析后要插入的 DOM 实例
const pagesRef = ref(null)
// 预览地址
const imgPreview = ref('')
// 是否调试模式
const debuggerMode = ref(false)

const onGridChange = (e) => {
  gridMode.value = e.target.value
}
const onThemeChange = (e) => {
  themeMode.value = e.target.value
}

// 调试按钮
const onDebugger = () => {
  debuggerMode.value = true
  content.value = dom
  nextTick(() => {
    downloadImages()
  })
}
// 下载事件
const onDownload = () => {
  if (!address.value || !address.value.trim()) {
    alert('请输入文章地址')
    return
  }
  debuggerMode.value = false
  pagesRef.value.innerHTML = ''
  const { protocol, hostname } = window.location
  axios({
    method: 'get',
    url: `${protocol}//${hostname}:5002/zhihu`,
    params: {
      url: address.value
    }
  })
    .then((res) => {
      let contentValue = res.data
      // 和谐敏感词
      const words = [
        ['霸凌', '8零'],
        ['死', 's'],
        ['杀人', '鲨任'],
        ['吸毒', '吸du']
      ]
      words.forEach((w) => {
        contentValue = contentValue.replaceAll(w[0], w[1])
      })

      content.value = contentValue
      nextTick(() => {
        insertPages()
        downloadImages()
      })
    })
    .catch((err) => {
      console.log(err)
      alert(err)
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
    }, i * 300)
  })
}

// 解析 pages DOM
function insertPages() {
  // 所有的 P 标签
  const pList = document.querySelectorAll('p')
  // 组装一页的 P 标签
  let container = []
  // 一页的 P 数量
  let pCount = 0
  // 页码
  let pageNumber = 1
  pList.forEach((p, i) => {
    container.push(p)
    const textLength = p.innerText.length

    // 大概比例为
    pCount = pCount + (Math.ceil(textLength / maxTextLength) + 1) * 0.5

    // 第一页只截 firstPageSize 行 || 当页行数已满 || 最后一页
    if (i === firstPageSize.value - 1 || pCount >= pageSize.value || i === pList.length - 1) {
      // 组装页
      const div = document.createElement('div')
      div.innerHTML = `<span class="page_number"> - ${pageNumber} -</span>`
      div.setAttribute('class', 'page')
      div.setAttribute('style', `height:${height}px`)
      pagesRef.value.appendChild(div)
      container.forEach((c) => div.appendChild(c))
      container = []
      pCount = 0
      pageNumber++
    }
  })
  content.value = ''
}
// 生成图片
function getImage(targetEle, index) {
  return html2canvas(targetEle, {
    width: 1080,
    height: height
    // backgroundColor: 'transparent'
  }).then((canvas) => {
    // 添加网格背景
    gridMode.value === '1' && addGridBg(canvas, themeMode.value)

    // 添加关键字水印
    const text = watermark.value.trim()
    text && addWaterMark(canvas, text, themeMode.value)

    const base64Url = canvas.toDataURL('image/png')
    // jpeg 格式可以设置图片质量
    // const base64Url = canvas.toDataURL('image/jpeg', 0.8)

    // 调试用代码
    imgPreview.value = base64Url

    if (!debuggerMode.value) {
      const result = { url: base64Url, title: `${themeMode.value}_${index}.png` }
      tagAToDownload(result)
    }
    return base64Url
  })
}
</script>
