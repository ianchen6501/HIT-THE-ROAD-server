require('dotenv').config()

const devConfig = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: "localhost",
    dialect: "mysql"
}

module.exports = {
  development: devConfig,
  production: devConfig
};
