const express = require('express')
const app = express()
const port = process.env.PORT || 5001
const bodyParser = require('body-parser')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const cors = require('cors')
const fs = require('fs')
const https = require('https')
require('dotenv').config()

//設定 cors，預設非 same-origin 不能存取
const requestUrl = {
  local: "http://localhost:3000",
  remote: "https://ianchen6501.github.io"
}
const corsOptions = {
  origin: requestUrl.remote,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions)); 

//body parsor middleware 可以解析 json / post 等資訊
app.use(bodyParser.urlencoded({ extended: false })) //parse urlencoed
app.use(bodyParser.json()) //parse json
app.use(cookieParser("sign"))

// app.set('view engine', 'ejs') //設定 view enging
// connect-flash，可以回傳 flash 
// app.use(flash())

//用 res.locals 可以設定在 view 使用的變數
//express-session 設定  
app.use(session({ 
  secret: process.env.SESSION_SECRET,
  resave: false, //每次請求都重新設定 maxAge
  saveUninitialized: false, //每次請求都設定 session cookie
  cookie: { 
    secure: true,
    maxAge : 1000 * 60 * 3
  }
}))

//設定 option cors
app.options('/', (req, res, next) => {
  req.header('Access-Control-Allow-Origin', requestUrl.local)
  req.header('Access-Control-Allow-credentials', true)
  next()
})

//usersController
const usersController = require('./controlers/users')

app.get('/users/', usersController.tokenLogin)
app.post('/login/:method', usersController.login)
app.post('/register/:method', usersController.register)

//schedulesController
const schedulesController = require("./controlers/schedules")
app.get('/schedules', schedulesController.getAllSchedules)
app.get('/schedules/:userId', schedulesController.getUserAllSchedules)
app.get('/schedules/:userId/:id', schedulesController.getUserOneSchedule)
app.post('/schedules/', schedulesController.addSchedule)
app.delete('/schedules/:id', schedulesController.deleteSchedule)
app.put('/schedules/:id', schedulesController.putSchedule)
app.patch('/schedules/:id', schedulesController.patchScheduleIsFinished)
app.get(`/posts`, schedulesController.getAllPosts)
app.get(`/posts/:id`, schedulesController.getOnePost)

//https test
// app.get('/', (req, res) => {
//   res.send("https work successfully!").end()
// })

//建立 https server
// const keyPath = "./SSL/localhost-key.pem"
// const certPath = "./SSL/localhost.pem"
// const key = fs.readFileSync(keyPath)
// const cert = fs.readFileSync(certPath)
// const options = {
//   key,
//   cert
// }
// const server = https.createServer(options, app)
// server.listen(port, () => { //監聽 port
//   console.log(`Example app listening at https://localhost:${port}`)
// })

//建立連線監聽
app.listen(port, () => { //監聽 port
  console.log(`Example app listening at http://localhost:${port}`)
})
