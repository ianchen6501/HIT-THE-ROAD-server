## 簡介

這是 HIT-THE-ROAD 旅遊規劃網站的後端原始碼，採用 Express.js 及 Sequelize.js 開發，提供使用者註冊、登入及旅遊行程儲存等功能。

## 資料庫建置及伺服器部屬

1. 創建你要進行建置的資料夾，並執行`git init`。
2. 輸入指令`git clone url`，下載資料。
3. 輸入指令`npm install`，安裝相關套件。
4. 輸入指令`config/config.json`檔案，裡面設置資料庫相關資料：

```js
{
  "development": {
    "username": "username", // 敏感資訊可以用環境變數帶入
    "password": "password",
    "database": "database",
    "host": "localhost",
    "dialect": "mysql"
  },
  "test": {
    "username": "username",
    "password": "password",
    "database": "database",
    "host": "localhost",
    "dialect": "mysql"
  },
  "production": {
    "username": "username",
    "password": "password",
    "database": "database",
    "host": "localhost",
    "dialect": "mysql"
  }
}
```

5. 建立環境變數 `.env`檔案，裡面設置環境變數，格式如下:

```js
DB_USERNAME = ""
DB_PASSWORD = ""
DB_DATABASE = ""
...
```

6. 輸入指令 `npm run migrate` 以執行 Sequelize migration，在 MySQL 資料庫中建立 database 及 table。
7. 執行`npm run start`、`node index.js`，開始運行伺服器。
   //TODO: 研究 seeders 及如何建置 demo 資料，修改 scripts ，增加 npm run start / npm run build。

## 開發

```js
npm run start // 執行 node index.js
```

## 部屬

```js
npm run build // 執行 sequelize migration / sequelize seeders / node index.js
```

## 專案架構

```js
|   index.js                 // App 伺服器入口點
|   package.json
|   package-lock.json
|   README.md
|
+---config
|     config.json            // Sequelize 設定檔
|
+---controllers              // 處理 API 邏輯
|     users
|     schedules
+---models                   // 透過 Sequelize 和資料庫溝通
|     index.js
|     user.js
|     schedules.js
|
+---node_modules
|
+---migrations                // Sequelize migrations
|
\---seeders                   // Sequelize seeders
```

## 第三方 libray

- bcrypt
  使用此套件將密碼加密後再存入資料庫

- cors
  使用此套件解決跨來源資源共用

- dotenv
  使用此套件設置環境變數

- jsonwebtoken
  使用 JWT 來實作登入機制驗證

- mysql2
  使用 mysql2 連線資料庫

- sequelize
  使用 ORM 工具 Sequelize 來操作資料庫

- API 文件
  [HIT-THE-ROAD API document](https://github.com/yunanpan/final-project/issues/5)
