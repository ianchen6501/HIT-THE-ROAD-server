const db = require("../models")
const schedules = db.Schedules
const users = db.Users

const schedulesController = {
  getAllSchedules : (req, res) => {
    //沒有設定 queryString 的情況
    if(req.query.isFinished) {
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
    } else { //有設定已完成 / 未完成 query 的情況
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
    }
  },  

  getAllPosts : (req, res) => { 
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
      .then(posts => {
        if(posts) {
          return res.send(posts)
        }
        res.end('no content')
      }).catch(error => {
        return res.send(error.toString())
      })
    } else {
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
        if(posts) {
          return res.send(posts)
        }
        res.end('no content')
      }).catch(error => {
        return res.send(error.toString())
      })
    }
  },

  getOnePost : (req, res) => {
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
  },

  getUserAllSchedules : (req, res) => { 
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
        return res.send(schedule)
      }
      res.end('no content')
    }).catch(error => {
      return res.send(error.toString())
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
  },

  deleteSchedule : (req, res) => {
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
  },

  patchScheduleIsFinished : (req, res) => {
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
  }
}

module.exports = schedulesController