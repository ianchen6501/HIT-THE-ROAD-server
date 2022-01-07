const db = require("../models");
const users = db.Users;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requestUrl = "http://localhost:3000";

const usersController = {
	tokenLogin: (req, res) => {
		const token = req.cookies.token;
		users
			.findOne({
				where: {
					token,
				},
			})
			.then((response) => {
				if (response) {
					const body = {
						ok: true,
						message: "login success",
						userData: response,
					};
					return res.end(JSON.stringify(body));
				} else {
					const body = {
						ok: false,
						message: "login fail",
					};
					return res.end(JSON.stringify(body));
				}
			})
			.catch((error) => {
				const body = {
					ok: false,
					message: error.toString(),
				};
				return res.end(JSON.stringify(body));
			});
	},

	login: (req, res) => {
		function handleLogin() {
			const { username, password } = req.body;
			users
				.findOne({
					//驗證已註冊否
					where: {
						username: username,
					},
				})
				.then((userData) => {
					if (!userData) {
						const response = {
							ok: false,
							message: "you have not registered.",
						};
						return res.end(JSON.stringify(response));
					}
					//verify pwd
					bcrypt.compare(
						password,
						userData.password,
						function (err, isSuccess) {
							if (err || !isSuccess) {
								const body = {
									ok: false,
									message: "wrong password",
								};
								return res.end(JSON.stringify(body));
							}
							//重新建立 session-id
							// req.session.regenerate(function(err) {
							//   if(err) {
							//     return res.json("login fail").end()
							//   }

							// })

							const body = {
								ok: true,
								message: "login",
								userData: {
									id: userData.id,
									username: userData.username,
									nickname: userData.nickname,
									email: userData.email,
								},
								token: userData.token,
							};
							//TODO: 20200330 改成 cookies 存登入資訊
							const maxAge = 10 * 24 * 60 * 60 * 1000;
							const json = JSON.stringify(body);
							const options = {
								maxAge: maxAge,
								sameSite: "none",
								secure: true,
								httpOnly: true,
							};
							res.cookie("token", userData.token.toString(), options);
							return res.end(json);
						}
					);
				})
				.catch((error) => {
					const response = {
						ok: false,
						message: error.toString(),
					};
					const json = JSON.stringify(response);
					return res.end(json);
				});
		}

		function handleFbLogin() {
			const { fbId, fbName, fbEmail } = req.body;
			if (!fbId || !fbName || !fbEmail) {
				res.end(
					JSON.stringify({
						ok: false,
						message: "please provide sound userData",
					})
				);
			}
			users
				.findOne({
					//驗證已註冊否
					where: {
						fbName: fbName,
					},
				})
				.then((userData) => {
					if (!userData) {
						const response = {
							ok: false,
							message: "you have not registered.",
						};
						return res.end(JSON.stringify(response));
					}
					bcrypt.compare(fbId, userData.fbId, function (err, isSuccess) {
						if (err || !isSuccess) {
							const body = {
								ok: false,
								message: "wrong password",
							};
							return res.end(JSON.stringify(body));
						}
						req.session.token = userData.token;
						const body = {
							ok: true,
							message: "login",
							userData: {
								id: userData.id,
								fbName: userData.fbName,
								fbEmail: userData.fbEmail,
							},
							token: userData.token,
						};
						const json = JSON.stringify(body);
						return res.end(json);
					});
				})
				.catch((error) => {
					const response = {
						ok: false,
						message: error.toString(),
					};
					const json = JSON.stringify(response);
					return res.end(json);
				});
		}

		const method = req.params.method;
		switch (method) {
			case "common":
				handleLogin();
				break;
			case "fb":
				handleFbLogin();
				break;
			default:
				res.end(JSON.stringify("login fail"));
		}
	},

	register: (req, res) => {
		function createUser(body, token, userData) {
			users
				.create(body)
				.then((result) => {
					req.session.token = token; //TODO: 改為存 cookie
					userData["id"] = result.id;
					const response = {
						ok: true,
						message: "Created",
						userData,
						token,
					};
					const json = JSON.stringify(response);
					return res.end(json);
				})
				.catch((error) => {
					const response = {
						ok: false,
						message: error.toString(),
					};
					const json = JSON.stringify(response);
					res.send(json);
					return res.end(json);
				});
		}

		async function handleRegister() {
			const { username, password, nickname, email } = req.body;
			const userData = {
				username,
				nickname,
				email,
			};

			//驗證是否已註冊
			const user = await users.findOne({
				where: {
					username,
				},
			});
			if (user) {
				const response = {
					ok: false,
					message: "user exist",
				};
				const json = JSON.stringify(response);
				return res.send(json);
			}

			//創建新使用者
			const saltRounds = 10;
			bcrypt.hash(password, saltRounds, function (err, hash) {
				if (err) {
					return res.end("errorMessage", err.toString());
				} else {
					const payload = {
						sub: "hittheroad",
						name: username,
						admin: false,
					};
					const secret = "hittheroadSecret";
					const token = jwt.sign(payload, secret, { expiresIn: "30 day" });
					const body = {
						username: username,
						password: hash,
						nickname: nickname,
						email: email,
						fbId: null,
						fbName: null,
						fbEmail: null,
						token,
					};
					createUser(body, token, userData);
				}
			});
		}

		async function handleFbRegister() {
			const { fbId, fbName, fbEmail } = req.body;

			const userData = {
				fbName,
				fbEmail,
			};

			const user = await users.findOne({
				//驗證已註冊否
				where: {
					fbName,
				},
			});
			if (user) {
				const response = {
					ok: false,
					message: "user exist",
				};
				const json = JSON.stringify(response);
				return res.send(json);
			}

			//創建新使用者
			const saltRounds = 10;
			bcrypt.hash(fbId, saltRounds, function (err, hash) {
				if (err) {
					return res.end("errorMessage", err.toString());
				} else {
					const payload = {
						sub: "hittheroad",
						name: fbName,
						admin: false,
					};
					const secret = "12345";
					const token = jwt.sign(payload, secret, { expiresIn: "1 day" });
					const body = {
						username: null,
						password: null,
						nickname: null,
						email: null,
						fbId: hash,
						fbName,
						fbEmail,
						token,
					};
					createUser(body, token, userData);
				}
			});
		}
		//判斷是哪種註冊
		if (req.params.method === "common") {
			handleRegister();
		} else {
			handleFbRegister();
		}
	},
};

module.exports = usersController;
