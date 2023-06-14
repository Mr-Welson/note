const Koa = require('koa')
const Router = require('koa-router')
var bodyParser = require('koa-bodyparser')
const cors = require('koa-cors')
const request = require('request')
const cheerio = require('cheerio')

const app = new Koa()
const router = new Router()

router.get('/zhihu', async function (ctx) {
  ctx.response.type = 'application/json'
  const url = ctx.request.query.url
  const data = await new Promise(function (resolve) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(body)
        const contents = $('#manuscript')
        const pList = $('#manuscript p')
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
