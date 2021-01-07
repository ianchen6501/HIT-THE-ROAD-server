const express = require('express')
const app = express()
const port = process.env.PORT || 5003
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
const bcrypt = require('bcrypt');
const cors = require('cors')
const jwt = require('jsonwebtoken')
const db = require('./models')
const { response } = require('express')
const schedules = db.Schedules
const users = db.Users
const Sequelize = require('sequelize')
const Op = Sequelize.Op;
require('dotenv').config()

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions)); //設定 cors，預設非 same-origin 不能存取

app.set('view engine', 'ejs') //設定 view enging

//body parsor_middleware_可以解析 json / post 等資訊
app.use(bodyParser.urlencoded({ extended: false })) //parse urlencoed
app.use(bodyParser.json()) //parse json

//connect-flash，可以回傳 flash 
app.use(flash())

//用 res.locals 可以設定在 view 使用的變數
//express-session 設定
app.use(session({ 
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}))

app.use(session({ 
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}))

//users
//getOne
app.post('/users/', (req, res) => {
  const token = req.body.token

  users.findOne({
    where: {
      token
    }
  }).then(response => {
    if(response) {
      const body = {
        ok: true,
        message: "login success",
        userData: response
      }
      return res.end(JSON.stringify(body))
    } else {
      const body = {
        ok: false,
        message: "please login"
      }
      return res.end(JSON.stringify(body))
    }
  }).catch(error => {
    const body = {
      ok: false,
      message: error.toString()
    }
    return res.end(JSON.stringify(body))
  })
})

//register
app.post('/register/:method', (req, res) => {
  function createUser(body, token, userData) {
    users.create(body)
    .then(result => {
      req.session.token = token //存 session token
      userData['id'] = result.id
      const response = {
        ok: true,
        message: "Created",
        userData,
        token,
      }
      const json = JSON.stringify(response)
      return res.end(json)
    }).catch(error => {
      const response = {
        ok: false,
        message: error.toString()
      }
      const json = JSON.stringify(response)
      res.send(json)
      return res.end(json)
    })
  }

  async function handleRegister() {
    const {
      username, 
      password,
      nickname,
      email,
    } = req.body
    const userData = {
      username,
      nickname,
      email
    }

    const user = await users.findOne({//驗證已註冊否
      where: {
        username,
      }
    })
    if(user) {
      const response = {
        ok: false,
        message: "user exist"
      }
      const json = JSON.stringify(response)
      return res.send(json)
    }

    //創建新使用者
    const saltRounds = 10
    bcrypt.hash(password, saltRounds, function(err, hash) {
      if (err) {
        return res.end('errorMessage', err.toString())
      } else {
        const payload ={
          "sub" : "hittheroad",
          "name" : username,
          "admin" : false,
        }
        const secret = "12345"
        const token = jwt.sign(payload, secret, { expiresIn: '30 day' })
        const body = {
          username: username,
          password: hash,
          nickname: nickname,
          email: email,
          fbId: null,
          fbName: null,
          fbEmail: null,
          token,
        }
        createUser(body, token, userData)
      }
    })
  }

  async function handleFbRegister() {
    const {
      fbId, 
      fbName,
      fbEmail,
    } = req.body

    const userData = {
      fbName,
      fbEmail,
    }

    const user = await users.findOne({//驗證已註冊否
      where: {
        fbName,
      }
    })
    if(user) {
      const response = {
        ok: false,
        message: "user exist"
      }
      const json = JSON.stringify(response)
      return res.send(json)
    }

    //創建新使用者
    const saltRounds = 10
    bcrypt.hash(fbId, saltRounds, function(err, hash) {
      if (err) {
        return res.end('errorMessage', err.toString())
      } else {
        const payload ={
          "sub" : "hittheroad",
          "name" : fbName,
          "admin" : false,
        }
        const secret = "12345"
        const token = jwt.sign(payload, secret, { expiresIn: '1 day' })
        const body = {
          username: null,
          password: null,
          nickname: null,
          email: null,
          fbId: hash,
          fbName,
          fbEmail,
          token,
        }
        createUser(body, token, userData)
      }
    })
  }
  //判斷是哪種註冊
  if(req.params.method === "common") {
    handleRegister()
  } else {
    handleFbRegister()
  }
})

//login
app.post('/login/:method', (req, res) => {
  function handleLogin() {
    const { username, password } = req.body
    users.findOne({//驗證已註冊否
      where: {
        username : username,
      }
    }).then(userData => {
      if(!userData) { 
        const response = {
          ok: false,
          message: "you have not registered."
        }
        return res.end(JSON.stringify(response))
      }
      bcrypt.compare(password, userData.password, function(err, isSuccess) {
        if (err || !isSuccess) {
          const body = {
            ok: false,
            message: "wrong password"
          }
          return res.end(JSON.stringify(body))
        }
        req.session.token = userData.token
        const body = {
          ok: true,
          message: "login",
          userData: {
            id: userData.id,
            username : userData.username,
            nickname : userData.nickname,
            email: userData.email
          },
          token: userData.token
        }
        const json = JSON.stringify(body)
        return res.end(json)
      })
    }).catch(error => {
      const response = {
        ok: false,
        message: error.toString()
      }
      const json = JSON.stringify(response)
      return res.end(json)
    })
  }

  function handleFbLogin() {
    const { fbId, fbName, fbEmail } = req.body
    if(!fbId || !fbName || !fbEmail) {
      res.end(JSON.stringify({
        ok: false,
        message: "please provide sound userData"
      }))
    }
    users.findOne({//驗證已註冊否
      where: {
        fbName : fbName,
      }
    }).then(userData => {
      if(!userData) { 
        const response = {
          ok: false,
          message: "you have not registered."
        }
        return res.end(JSON.stringify(response))
      }
      bcrypt.compare(fbId, userData.fbId, function(err, isSuccess) {
        if (err || !isSuccess) {
          const body = {
            ok: false,
            message: "wrong password"
          }
          return res.end(JSON.stringify(body))
        }
        req.session.token = userData.token
        const body = {
          ok: true,
          message: "login",
          userData: {
            id: userData.id,
            fbName : userData.fbName,
            fbEmail : userData.fbEmail,
          },
          token: userData.token
        }
        const json = JSON.stringify(body)
        return res.end(json)
      })
    }).catch(error => {
      const response = {
        ok: false,
        message: error.toString()
      }
      const json = JSON.stringify(response)
      return res.end(json)
    })
  }

  const method = req.params.method
  switch(method) {
    case "common" : 
      handleLogin()
      break
    case "fb" :
      handleFbLogin()
      break
    default :
      res.end(JSON.stringify("login fail"))
  }
  
})


//schedules
//getAllSchedule
app.get(`/schedules`, (req, res) => { 
  //沒有設定 queryString
  if(req.query.isFinished === undefined) {
    schedules.findAll({
      order: [
        ['id', 'DESC']
      ]
    })
    .then(schedules => {
      if(schedules) {
        return res.send(schedules)
      }
      res.end('no content')
    }).catch(error => {
      return res.send(error.toString())
    })
  } else if(req.query.isFinished) { //已完成 / 未完成
    const UserId = req.params.userId
    schedules.findAll({
      where : {
        isFinished: req.query.isFinished
      },
      order: [
        ['id', 'DESC']
      ],
    }).then(schedules => {
      if(schedules) {
        return res.send(schedules)
      }
      res.end('no content')
    }).catch(error => {
      return res.send(error.toString())
    })
  }
})

//getAllPosts
app.get(`/posts`, (req, res) => { 
  //沒有設定 queryString
  if(req.query.filter) {
    schedules.findAll({
      where: {
        location: req.query.filter,
        isFinished: true
      },
      attributes: ['id','scheduleName', 'location', 'dailyRoutines', 'dateRange', 'userId'],
      include: [{
        model: users,
        attributes: ['nickname', 'fbName'],
        required: true,
      }],
      order: [
        ['id', 'DESC']
      ],
    })
    .then(schedules => {
      if(schedules) {
        return res.send(schedules)
      }
      res.end('no content')
    }).catch(error => {
      return res.send(error.toString())
    })
  } else { //已完成 / 未完成
    schedules.findAll({
      where : {
        isFinished: true,
      },
      attributes: ['id','scheduleName', 'location', 'dailyRoutines', 'dateRange', 'userId'],
      include: [{
        model: users,
        attributes: ['nickname', 'fbName'],
        required: true,
      }],
      order: [
        ['id', 'DESC']
      ],
    }).then(schedules => {
      if(schedules) {
        return res.send(schedules)
      }
      res.end('no content')
    }).catch(error => {
      return res.send(error.toString())
    })
  }
})

//getOnePosts
app.get(`/posts/:scheduleId`, (req, res) => {  
  //沒有設定 queryString
  schedules.findOne({
    where: {
      id: req.params.scheduleId
    },
    attributes: ['id','scheduleName', 'location', 'dailyRoutines', 'dateRange', 'userId'],
    include: [{
      model: users,
      attributes: ['nickname', 'fbName'],
      required: true,
    }]
  })
  .then(schedules => {
    if(schedules) {
      return res.send(schedules)
    }
    res.end('no content')
  }).catch(error => {
    return res.send(error.toString())
  })
})

//getUserAllSchedule
app.get(`/schedules/:userId`, (req, res) => { 
  //沒有設定 queryString
  if(req.query.isFinished === undefined) {
    const UserId = req.params.userId
    schedules.findAll({
      where : {
        UserId,
      },
      order: [
        ['id', 'DESC']
      ]
    }).then(schedules => {
      if(schedules) {
        return res.send(schedules)
      }
      res.end('no content')
    }).catch(error => {
      return res.send(error.toString())
    })
  } else if(req.query.isFinished) { //未完成
    const UserId = req.params.userId
    schedules.findAll({
      where : {
        UserId,
        isFinished: req.query.isFinished
      },
      order: [
        ['id', 'DESC']
      ]
    }).then(schedules => {
      if(schedules) {
        return res.send(schedules)
      }
      res.end('no content')
    }).catch(error => {
      return res.send(error.toString())
    })
  }
})

//getOne
app.get('/schedules/:userId/:id', (req, res) => {
  const UserId = req.params.userId
  schedules.findOne({
    where : {
      id : req.params.id,
      UserId,
    }
  }).then(schedule => {
    if(schedule) {
      return res.send(schedule)
    }
    res.end('no content')
  }).catch(error => {
    return res.send(error.toString())
  })
})


//add
app.post('/schedules/', (req, res) => {
  const {
    scheduleName,
    location,
    dateRange,
    dailyRoutines,
    UserId
  } = req.body

  if(!UserId) {
    const body = {
      ok: false,
      message: "wrong authority"
    }
    return res.end(JSON.stringify(body))
  }

  const body = {
    scheduleName,
    location,
    dateRange,
    dailyRoutines,
    UserId
  }

  schedules.create(body)
  .then(response => {
    const body = {
      ok: true,
      message: "create success",
      scheduleData: response
    }
    return res.end(JSON.stringify(body))
  }).catch(error => {
    const body = {
      ok: false,
      message: error.toString()
    }
    return res.end(JSON.stringify(body))
  })
})

//delete
app.delete('/schedules/:id', (req, res) => {
  const UserId = req.body.UserId
  if(!UserId) {
    const body = {
      ok: false,
      message: "wrong authority"
    }
    return res.end(JSON.stringify(body))
  }
  schedules.findOne({
    where : {
      id : req.params.id,
      UserId,
    }
  }).then(schedule => {
    schedule.destroy()
    .then(() => {
      const body = {
        ok: true,
        message: "delete success"
      }
      return res.end(JSON.stringify(body))
    })
  }).catch(error => {
    const body = {
      ok: false,
      message: error.toString()
    }
    return res.end(JSON.stringify(body))
  })
})

//update_put
app.put('/schedules/:id', (req, res) => {
  const {
    dailyRoutines,
    dateRange,
    spots,
    spotsIds,
    spotId,
    markers,
    routes,
    postItId,
    UserId
  } = req.body

  if(!UserId) {
    const body = {
      ok: false,
      message: "wrong authority"
    }
    return res.end(JSON.stringify(body))
  }
  
  const body = {
    dailyRoutines,
    dateRange,
    spots,
    spotsIds,
    spotId,
    markers,
    routes,
    postItId,
  }

  schedules.findOne({
    where : {
      id : req.params.id,
      UserId,
    }
  }).then(schedule => {
    schedule.update(body)
    .then(() => {
      const body = {
        ok: true,
        message: "put success"
      }
      return res.end(JSON.stringify(body))
    }).catch(error => {
      const body = {
        ok: false,
        message: error.toString()
      }
      return res.end(JSON.stringify(body))
    })
  }).catch(error => {
    const body = {
      ok: false,
      message: error.toString()
    }
    return res.end(JSON.stringify(body))
  })
})

//update_isFinished_patch
app.patch('/schedules/:id', (req, res) => {
  const { UserId } = req.body
  const isFinished = req.query.isFinished
  if(!UserId) {
    const body = {
      ok: false,
      message: "wrong authority"
    }
    return res.end(JSON.stringify(body))
  }

  const body = {
    isFinished
  }

  schedules.findOne({
    where : {
      id : req.params.id,
      UserId,
    }
  }).then(schedule => {
    schedule.update(body)
    .then(() => {
      const body = {
        ok: true,
        message: "patch success"
      }
      return res.end(JSON.stringify(body))
    }).catch(error => {
      const body = {
        ok: false,
        message: error.toString()
      }
      return res.end(JSON.stringify(body))
    })
  }).catch(error => {
    const body = {
      ok: false,
      message: error.toString()
    }
    return res.end(JSON.stringify(body))
  })
})

// //TODO: 拿 googlemap API
// //get_mapAPI_key
// app.get('/key', (req, res) => {
//   const keyName = req.query.keyName
//   schedules.findOne({
//     where : {
//       keyName
//     }
//   }).then(schedule => {
//     schedule.update(body)
//     .then(() => {
//       const body = {
//         ok: true,
//         message: "patch success"
//       }
//       return res.end(JSON.stringify(body))
//     }).catch(error => {
//       const body = {
//         ok: false,
//         message: error.toString()
//       }
//       return res.end(JSON.stringify(body))
//     })
//   }).catch(error => {
//     const body = {
//       ok: false,
//       message: error.toString()
//     }
//     return res.end(JSON.stringify(body))
//   })
// })


app.listen(port, () => { //監聽 port
  console.log(`Example app listening at http://localhost:${port}`)
})