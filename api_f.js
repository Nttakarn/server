const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const knex = require('knex')
const app = express()
const multer = require('multer')

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
// login
app.post('/login', async (req, res) => {
  console.log(req.body)
  try {
    let rows = await db('user')
      .where('u_username', '=', req.body.user_email)
      .where('u_password', '=', req.body.user_pass)
    if (rows.length === 0) {
      res.send({
        ok: false,
        message: 'ชื่อหรือรหัสผ่าน ไม่ถูกต้อง',
      })
    } else {
      res.send({
        ok: true,
        datas: rows[0],
      })
    }
  } catch (e) {
    console.log('error')
    console.log(e.message)
    res.send({
      ok: false,
      error: e.message,
    })
  }
})
app.post('/save', async (req, res) => {
  console.log('data=', req.body)
  try {
    let row = await db('register').insert({
      fullname: req.body.username,
      bacount: req.body.bacount,
      tel: req.body.mobile,
      email: req.body.email,
      passwd: req.body.passwd,
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
app.get('/list', async (req, res) => {
  console.log('r_id=', req.query)
  let row = await db('register').where({r_id: req.query.rid})
  res.send({
    datas: row[0],
    status: 1,
  })
})

app.get('/lists', async (req, res) => {
  let row = await db('register')
  res.send({
    datas: row,
    status: 1,
  })
})

app.get('/list_user', async (req, res) => {
  console.log(req.query.user)
  console.log(req.query.passwd)
  try {
    let row = await db('users_student')
      .where({student_id: req.query.user, major_id: req.query.pass || 0 })
      .then(rows => rows[0])
    if (!row) {
      throw new Error('user/pass incorrect')
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

// ของ upload ทั้งหมด
app.use(bodyParser.urlencoded({extended: true}))
// SET STORAGE
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length)
    cb(null, 'e1-' + Date.now() + ext)
  },
})
let upload = multer({ storage: storage })

app.use((req, res, next) => {
  let header = { 'Access-Control-Allow-Origin': '*'}
  for (let i in req.headers) {
    if (i.toLowerCase().substr(0, 15) === 'access-control-') {
      header[i.replace(/-request-/g, '-allow-')] = req.headers[i]
    }
  }
  // res.header(header)  // แบบเก่า
  res.set(header) // แบบใหม่
  next()
})

// uploading multiple images together
app.post('/multi', upload.any(), (req, res) => {
  console.log('multi')
  const files = req.files
  console.log('file:', files)
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }

  res.send({
    'files=>': files,
    status: 'ok',
  })
})

app.post('/listup', upload.any(), async (req, res) => {
  console.log(req.files[0].filename)
  console.log('คุณสมบัติของfile:', req.files)
  let row = await db('register').insert({
    fullname: req.body.username,
    tel: req.body.mobile,
    bacount: req.body.bacount,
    images: req.files[0].filename,
    email: req.body.email,
    passwd: req.body.passwd,
  })

  res.send({ status: true, filesname: req.files[0].filename })
})

app.get('/listg', async (req, res) => {
  try {
    let rows = await req.db('group').select('*').orderBy('group.g_code', 'desc')
      .innerJoin('department', 'group.d_code', 'department.d_code')
      .where('group.t_status', '!=', 0)
    res.send({
      ok: true,
      datas: rows,
    })
  } catch (e) {
    res.send({ ok: false, error: e.message })
  }
})

app.post('/uploadfile', upload.single('myFile'), (req, res, next) => {
  console.log('คุณสมบัติของfile:', req.file)

  //  let ext = req.file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
  console.log('req.file.originalname=', req.file.originalname)
  console.log('req.file.originalname.lastIndexOf(.)', req.file.originalname.lastIndexOf('.'))
  console.log('file.originalname.length=', req.file.originalname.length)

  if (!req.file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  res.send(req.file)
})
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.listen(7001, () => {
  console.log('ready:7001')
})