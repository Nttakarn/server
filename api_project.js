const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const knex = require('knex')
const app = express()
// const multer = require('multer')

const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASS || '482659',
    database: process.env.MYSQL_DB || 'app_e5',
    supportBigNumber: true,
    timezone: '+7:00',
    dateStrings: true,
    charset: 'utf8mb4_unicode_ci',
  },
})

app.use(cors())
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.send({ ok: 1 })
})

app.post("/login",bodyParser.json(), async (req, res) => {
  console.log(req.body);
  // check require
  if (req.body.user_email == "" || req.body.user_pass == "") {
    res.send({
      massenge: "กรุณาตรวจสอบชื่อผู้ใช้หรือรหัส",
      status: "fail",
    })
  }
  let row = await db("user").where("user_email", "=", req.body.user_email) .where("user_pass", "=", req.body.user_pass)
  console.log("row", row)
  console.log("row ความยาว", row.length)
  if (row.length > 0) {
    res.send({
      status: "ok",
      rows: row,
    })
  } else {
    res.send({
      status: "no",
    })
  }
})

app.listen(7000, () => {
  console.log("ready for server: TAN:7000");
});
