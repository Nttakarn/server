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

app.get('/list', async (req, res) => {
  console.log(req.query.user_email)
  console.log(req.query.user_pass)
  try {
    let row = await db('user')
      .where({ user_email: req.query.user_email, user_pass: req.query.user_pass })
      .then(rows => rows[0])
    if (!row) {
      throw new Error('user/pass ไม่ถูกต้อง')
    }
    res.send({
      status: 1,
      data: row,
    })
  } catch (e) {
    console.log('error')
    console.log(e.message)
    res.send({
      status: 0,
      error: e.message,
    })
  }
})

app.post('/save', async (req, res) => {
  console.log('data=', req.body)

  try {
    let row = await db('user').insert({
      user_name: req.body.user_name,
      user_email: req.body.user_email,
      user_pass: req.body.user_pass,
    })
    res.send({
      status: 1,
    })
  } catch (e) {
    console.log('error')
    console.log(e.message)
    res.send({
      status: 0,
      error: e.message,
    })
  }
})

app.listen(7000, () => {
  console.log("ready for server: TAN:7000");
});
