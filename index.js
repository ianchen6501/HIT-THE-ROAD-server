const express = require('express')
const app = express()
const port = process.env.PORT || 5003
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const cors = require('cors')
require('dotenv').config()

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions)); //設定 cors，預設非 same-origin 不能存取
//body parsor_middleware_可以解析 json / post 等資訊
app.use(bodyParser.urlencoded({ extended: false })) //parse urlencoed
app.use(bodyParser.json()) //parse json

// app.set('view engine', 'ejs') //設定 view enging
// connect-flash，可以回傳 flash 
// app.use(flash())

//用 res.locals 可以設定在 view 使用的變數
//express-session 設定
app.use(session({ 
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
}))

//usersController
const usersController = require('./controlers/users')

app.post('/users/', usersController.tokenLogin)
app.post('/login/:method', usersController.login)
app.post('/register/:method', usersController.register)

//schedulesController
const schedulesController = require("./controlers/schedules")
app.get(`/schedules`, schedulesController.getAllSchedules)
app.get(`/schedules/:userId`, schedulesController.getUserAllSchedules)
app.get('/schedules/:userId/:id', schedulesController.getUserOneSchedule)
app.post('/schedules/', schedulesController.addSchedule)
app.delete('/schedules/:id', schedulesController.deleteSchedule)
app.put('/schedules/:id', schedulesController.putSchedule)
app.patch('/schedules/:id', schedulesController.patchScheduleIsFinished)
app.get(`/posts`, schedulesController.getAllPosts)
app.get(`/posts/:scheduleId`, schedulesController.getOnePost)

app.listen(port, () => { //監聽 port
  console.log(`Example app listening at http://localhost:${port}`)
})