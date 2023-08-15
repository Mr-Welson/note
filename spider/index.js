const Koa = require('koa')
const Router = require('koa-router')
var bodyParser = require('koa-bodyparser')
const cors = require('koa-cors')
const request = require('request')
const cheerio = require('cheerio')
const querystring = require('querystring')

const app = new Koa()
const router = new Router()

router.get('/zhihu', async function (ctx) {
  ctx.response.type = 'application/json'
  let url = ctx.request.query.url
  let storyUrl = false
  // 兼容多种URL
  // 1. 常规URL(专栏文章)
  //  https://www.zhihu.com/market/paid_column/<columnId>/section/<postId>
  // 2. 移动端加密分享URL
  //  https://soia.zhihu.com/tab/home?is_delivery=true&source=e9f03bea58b4524092f6cb42207b6a5f&package=zhihushare0812&channel_id=67154024128158&appkey=2400&ustkn=1&is_share_data=true&mst=<secretPostId>
  // 3. 故事URL
  //  https://story.zhihu.com/blogger/next-manuscript/paid_column/<secretPostId>
  // 4. 本地URL
  //  http://localhost:xxxx

  // 处理移动端加密分享URL
  if (url.startsWith('https://soia.zhihu.com')) {
    const { mst } = querystring.parse(url.split('?')[1])
    url = `https://story.zhihu.com/blogger/next-manuscript/paid_column/${mst}`
  }
  // 故事URL
  if (url.startsWith('https://story.zhihu.com')) {
    storyUrl = true
  }

  const data = await new Promise(function (resolve) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(body)
        let contents, pList
        if (storyUrl) {
          // 故事链接
          contents = $('#app')
          pList = $('#app p')
        } else {
          // 普通链接
          contents = $('#manuscript')
          pList = $('#manuscript p')
        }
        pList.each(function () {
          // 去除空的P标签
          if (!$(this).text().trim()) {
            $(this).remove()
          } else {
            // 只保留文字, 去除 a 链接及其他无用标签
            $(this).text($(this).text())
          }
        })
        resolve(contents.html())
      } else {
        resolve({ message: 'error', data: response })
      }
    })
  })
  ctx.response.body = data
})

app.use(cors())
app.use(bodyParser()) // 解析请求参数
app.use(router.routes())

const port = 5002
app.listen(port, () => {
  console.log('server started on http://localhost:' + port)
})
