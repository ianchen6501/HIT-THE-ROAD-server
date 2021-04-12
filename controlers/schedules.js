const db = require("../models")
const schedules = db.Schedules
const users = db.Users

const schedulesController = {
  getAllSchedules : (req, res) => {
    //isfinished
    if(req.query.isFinished) {
      schedules.findAll({
        where : {
          isFinished: req.query.isFinished
        },
        order: [
          ['id', 'DESC']
        ],
      }).then(schedules => {
        // if(schedules.length) {
          return res.send(schedules).end()
        // }
        // res.send('no content').end()
      }).catch(error => {
        res.send(error.toString()).end()
      })
    } else { //all
      schedules.findAll({
        order: [
          ['id', 'DESC']
        ]
      })
      .then(schedules => {
        // if(schedules.length) {
          return res.send(schedules).end()
        // }
        // res.send('no content').end()
      }).catch(error => {
        res.send(error.toString()).end()
      })
    }
  },  

  getAllPosts : (req, res) => {
    //filter
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
      .then(posts => {
        // if(posts.length) {
          return res.json(posts).end()
        // }
        // res.json('no content').end()
      }).catch(error => {
        res.json(error.toString()).end()
      })
    } else { //all
      //FIXME: 測試 cookies
      const cookies = req.cookies
      console.log(cookies)

      schedules.findAll({
        where : {
          isFinished: true,
        },
        attributes: ['id','scheduleName', 'location', 'dailyRoutines', 'dateRange', 'UserId'],
        include: [{
          model: users,
          attributes: ['nickname', 'fbName'],
          required: true,
        }],
        order: [
          ['id', 'DESC']
        ],
      }).then(posts => {
        // if(posts.length) {
        // parse JSON couloum datatype
        posts.map(post => {
          post.dailyRoutines = JSON.parse(post.dailyRoutines)
          post.dateRange = JSON.parse(post.dateRange)
        })
        return res.json(posts).end()
        // }
        // res.json('no content').end()
      }).catch(error => {
        return res.json(error.toString()).end()
      })
    }
  },

  getOnePost : (req, res) => {
    schedules.findOne({
      where: {
        id: req.params.id
      },
      attributes: ['id','scheduleName', 'location', 'dailyRoutines', 'dateRange', 'userId'],
      include: [{
        model: users,
        attributes: ['nickname', 'fbName'],
        required: true,
      }]
    })
    .then(post => {
      if(post) {
        return res.json(post).end()
      }
      res.json([]).end()
    }).catch(error => {
      return res.send(error.toString()).end()
    })
  },

  getUserAllSchedules : (req, res) => { 
    const UserId = req.params.userId
    //isFinished
    if(req.query.isFinished) {
      schedules.findAll({
        where : {
          UserId,
          isFinished: req.query.isFinished
        },
        order: [
          ['id', 'DESC']
        ]
      }).then(schedules => {
        // if(schedules.length) {
        //parse JSON coloumn datatype
        schedules.map(schedule => {
          schedule.dailyRoutines = JSON.parse(schedule.dailyRoutines)
          schedule.dateRange = JSON.parse(schedule.dateRange)
        })
        res.json(schedules).end()
        // }
        // res.send('no content').end()
      }).catch(error => {
        res.send(error.toString()).end()
      })
    } else { //all
      schedules.findAll({
        where : {
          UserId,
        },
        order: [
          ['id', 'DESC']
        ]
      }).then(schedules => {
        // if(schedules.length) {
          return res.json(schedules).end()
        // }
        // res.send('no content').end()
      }).catch(error => {
        res.send(error.toString()).end()
      })
    }
  },

  getUserOneSchedule : (req, res) => {
    const UserId = req.params.userId
    schedules.findOne({
      where : {
        id : req.params.id,
        UserId,
      }
    }).then(schedule => {
      if(schedule) {
        //parse JSON coloumn datatype
        //TODO: 確認是否如此轉換
        schedule.dailyRoutines = JSON.parse(schedule.dailyRoutines)
        schedule.dateRange = JSON.parse(schedule.dateRange)
        schedule.routes = JSON.parse(schedule.routes)
        schedule.markers = JSON.parse(schedule.markers)
        schedule.spots = JSON.parse(schedule.spots)
        schedule.spotsIds = JSON.parse(schedule.spotsIds)
        return res.json(schedule).end()
      }
      res.json([]).end()
    }).catch(error => {
      return res.json(error.toString()).end()
    })
  },

  addSchedule : (req, res) => {
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
      return res.json(body).end()
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
      res.json(body).end()
    }).catch(error => {
      const body = {
        ok: false,
        message: error.toString()
      }
      res.json(body).end()
    })
  },

  deleteSchedule : (req, res) => {
    const UserId = req.body.UserId
    if(!UserId) {
      const body = {
        ok: false,
        message: "wrong authority"
      }
      return res.json(body).end()
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
        res.json(body).end()
      })
    }).catch(error => {
      const body = {
        ok: false,
        message: error.toString()
      }
      res.json(body).end()
    })
  },

  putSchedule : (req, res) => {
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
      return res.json(body).end()
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
        res.json(body).end()
      }).catch(error => {
        const body = {
          ok: false,
          message: error.toString()
        }
        res.json(body).end()
      })
    }).catch(error => {
      const body = {
        ok: false,
        message: error.toString()
      }
      res.json(body).end()
    })
  },

  patchScheduleIsFinished : (req, res) => {
    const { UserId } = req.body
    const isFinished = req.query.isFinished
    if(!UserId) {
      const body = {
        ok: false,
        message: "wrong authority"
      }
      return res.json(body).end()
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
        res.json(body).end()
      }).catch(error => {
        const body = {
          ok: false,
          message: error.toString()
        }
        res.json(body).end()
      })
    }).catch(error => {
      const body = {
        ok: false,
        message: error.toString()
      }
      res.json(body).end()
    })
  }
}

module.exports = schedulesController