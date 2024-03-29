const db = require("../models");
const schedules = db.Schedules;
const users = db.Users;

const schedulesController = {
	getAllSchedules: (req, res) => {
		//isfinished
		if (req.query.isFinished) {
			schedules
				.findAll({
					where: {
						isFinished: req.query.isFinished,
					},
					order: [["id", "DESC"]],
				})
				.then((schedules) => {
					// if(schedules.length) {
					return res.json(schedules).end();
					// }
					// res.send('no content').end()
				})
				.catch((error) => {
					res.json(error.toString()).end();
				});
		} else {
			//all
			schedules
				.findAll({
					order: [["id", "DESC"]],
				})
				.then((schedules) => {
					// if(schedules.length) {
					return res.json(schedules).end();
					// }
					// res.send('no content').end()
				})
				.catch((error) => {
					res.json(error.toString()).end();
				});
		}
	},

	getAllPosts: (req, res) => {
		const response = {
			ok: null,
			posts: null,
			error: null,
		};
		//filter
		if (req.query.filter) {
			schedules
				.findAll({
					where: {
						location: req.query.filter,
						isFinished: true,
					},
					attributes: [
						"id",
						"scheduleName",
						"location",
						"dailyRoutines",
						"dateRange",
						"userId",
					],
					include: [
						{
							model: users,
							attributes: ["nickname", "fbName"],
							required: true,
						},
					],
					order: [["id", "DESC"]],
				})
				.then((posts) => {
					response.ok = true;
					response.posts = posts;
					res.json(response).end();
				})
				.catch((error) => {
					response.ok = false;
					response.error = error.toString();
					res.json(response).end();
				});
		} else {
			//all
			schedules
				.findAll({
					where: {
						isFinished: true,
					},
					attributes: [
						"id",
						"scheduleName",
						"location",
						"dailyRoutines",
						"dateRange",
						"UserId",
					],
					include: [
						{
							model: users,
							attributes: ["nickname", "fbName"],
							required: true,
						},
					],
					order: [["id", "DESC"]],
				})
				.then((posts) => {
					response.ok = true;
					response.posts = posts;
					res.json(response).end();
				})
				.catch((error) => {
					response.ok = false;
					response.error = error.toString();
					res.json(response).end();
				});
		}
	},

	getOnePost: (req, res) => {
		schedules
			.findOne({
				where: {
					id: req.params.id,
				},
				attributes: [
					"id",
					"scheduleName",
					"location",
					"dailyRoutines",
					"dateRange",
					"userId",
				],
				include: [
					{
						model: users,
						attributes: ["nickname", "fbName"],
						required: true,
					},
				],
			})
			.then((post) => {
				return res.json(post).end();
			})
			.catch((error) => {
				return res.send(error.toString()).end();
			});
	},

	getUserAllSchedules: (req, res) => {
		const UserId = req.params.userId;
		//isFinished
		if (req.query.isFinished) {
			schedules
				.findAll({
					where: {
						UserId,
						isFinished: req.query.isFinished,
					},
					order: [["id", "DESC"]],
				})
				.then((schedules) => {
					// if(schedules.length) {
					//parse JSON coloumn datatype
					// schedules.map(schedule => {
					//   schedule.dailyRoutines = JSON.parse(schedule.dailyRoutines)
					//   schedule.dateRange = JSON.parse(schedule.dateRange)
					// })
					res.json(schedules).end();
					// }
					// res.send('no content').end()
				})
				.catch((error) => {
					res.json(error.toString()).end();
				});
		} else {
			//all
			schedules
				.findAll({
					where: {
						UserId,
					},
					order: [["id", "DESC"]],
				})
				.then((schedules) => {
					return res.json(schedules).end();
				})
				.catch((error) => {
					res.json(error.toString()).end();
				});
		}
	},

	getUserOneSchedule: (req, res) => {
		console.log("getUserOneSchedule");
		const UserId = req.params.userId;
		schedules
			.findOne({
				where: {
					id: req.params.id,
					UserId,
				},
			})
			.then((schedule) => {
				console.log("[DEBUG] original schedule:", schedule);
				if (schedule) {
					//TODO: 確認是否如此轉換
					schedule.dailyRoutines = JSON.parse(schedule.dailyRoutines);
					schedule.dateRange = JSON.parse(schedule.dateRange);
					schedule.markers = JSON.parse(schedule.markers);
					schedule.spotsIds = JSON.parse(schedule.spotsIds);
					schedule.spots = JSON.parse(schedule.spots);
					return res.json(schedule).end();
				}
			})
			.catch((error) => {
				return res.json(error.toString()).end();
			});
	},

	addSchedule: (req, res) => {
		const { scheduleName, location, dateRange, dailyRoutines, UserId } =
			req.body;
		if (!UserId) {
			const body = {
				ok: false,
				message: "wrong authority",
			};
			return res.json(body).end();
		}
		const body = {
			scheduleName,
			location,
			dateRange,
			dailyRoutines,
			UserId,
		};
		schedules
			.create(body)
			.then((response) => {
				const body = {
					ok: true,
					message: "create success",
					scheduleData: response,
				};
				res.json(body).end();
			})
			.catch((error) => {
				const body = {
					ok: false,
					message: error.toString(),
				};
				res.json(body).end();
			});
	},

	deleteSchedule: (req, res) => {
		const UserId = req.body.UserId;
		if (!UserId) {
			const body = {
				ok: false,
				message: "wrong authority",
			};
			return res.json(body).end();
		}
		schedules
			.findOne({
				where: {
					id: req.params.id,
					UserId,
				},
			})
			.then((schedule) => {
				schedule.destroy().then(() => {
					const body = {
						ok: true,
						message: "delete success",
					};
					res.json(body).end();
				});
			})
			.catch((error) => {
				const body = {
					ok: false,
					message: error.toString(),
				};
				res.json(body).end();
			});
	},

	putSchedule: (req, res) => {
		const {
			dailyRoutines,
			dateRange,
			spots,
			spotsIds,
			spotId,
			markers,
			routes,
			postItId,
			UserId,
		} = req.body;

		if (!UserId) {
			const body = {
				ok: false,
				message: "wrong authority",
			};
			return res.json(body).end();
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
		};

		schedules
			.findOne({
				where: {
					id: req.params.id,
					UserId,
				},
			})
			.then((schedule) => {
				schedule
					.update(body)
					.then(() => {
						const body = {
							ok: true,
							message: "put success",
						};
						res.json(body).end();
					})
					.catch((error) => {
						const body = {
							ok: false,
							message: error.toString(),
						};
						res.json(body).end();
					});
			})
			.catch((error) => {
				const body = {
					ok: false,
					message: error.toString(),
				};
				res.json(body).end();
			});
	},

	patchScheduleIsFinished: (req, res) => {
		const { UserId } = req.body;
		const isFinished = req.query.isFinished;
		if (!UserId) {
			const body = {
				ok: false,
				message: "wrong authority",
			};
			return res.json(body).end();
		}

		const body = {
			isFinished,
		};

		schedules
			.findOne({
				where: {
					id: req.params.id,
					UserId,
				},
			})
			.then((schedule) => {
				schedule
					.update(body)
					.then(() => {
						const body = {
							ok: true,
							message: "patch success",
						};
						res.json(body).end();
					})
					.catch((error) => {
						const body = {
							ok: false,
							message: error.toString(),
						};
						res.json(body).end();
					});
			})
			.catch((error) => {
				const body = {
					ok: false,
					message: error.toString(),
				};
				res.json(body).end();
			});
	},
};

module.exports = schedulesController;
