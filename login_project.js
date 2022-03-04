const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require('multer');
const knex = require("knex");
const { raw } = require("body-parser");

const db = knex({
  client: "mysql",
  connection: {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASS || "482659",
    database: process.env.MYSQL_DB || "app_e5",
    supportBigNumber: true,
    timezone: "+7:00",
    dateStrings: true,
    charset: "utf8mb4_unicode_ci",
  },
});

const app = express();
//require body-parser




//var mysql = require("mysql");

//var con = mysql.createConnection({
//  host: "localhost",
// user: "root",
//  password: "12345678",
//  database: "dve_tvet",
//});
app.use(bodyParser.json());
app.use(express.static("./public"));
app.use(cors());
// app.use(fileUpload());




app.post("/login",bodyParser.json(), async (req, res) => {
  console.log(req.body);
  // check require
  if (req.body.email == "" || req.body.Password == "") {
    res.send({
      massenge: "กรุณาตรวจสอบชื่อผู้หรือรหัส",
      status: "fail",
    })
  }
  let row = await db("user").where("email", "=", req.body.email) .where("Password", "=", req.body.Password)
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

app.get('/logUser', async (req, res) => {
  console.log(req.query)
  let row = await db.raw('SELECT * FROM user WHERE email = ' + req.query.email)
  console.log("row", row[0])
  res.send({
    status: 'ok',
    rows: row
  })
})

app.get('/Activity_hide', async (req, res1) => {
  console.log(req.query)
  let row = await db.raw("SELECT * FROM activity WHERE Date_start != '" + req.query.dateTime + "'") 
  res1.send({
    status: 'ok',
    rows: row
  })
})

app.get('/table_user', async (req, res1) => {
  console.log(req.query)
  let row = await db.raw("SELECT * FROM user") 
  res1.send({
    status: 'ok',
    rows: row
  })
})


app.get('/list_ac_me', async (req, res1) => {
  console.log(req.query)
  let row = await db.raw("SELECT * FROM table_coin INNER JOIN user ON table_coin.ID = user.ID WHERE table_coin.ID = " + req.query.ID)
  res1.send({
    status: 'ok',
    rows: row
  })
})

// app.get('/list_coin', async (req, res1) => {
//   console.log(req.query)
//   let row = await db.raw("SELECT * FROM list_coin INNER JOIN user ON list_coin.ID = user.ID WHERE list_coin.ID = " + req.query.ID)
//   res1.send({
//     status: 'ok',
//     rows: row
//   })
// })
app.get('/list_coin', async (req, res1) => {
  console.log(req.query)
  let row = await db.raw("SELECT * FROM list_coin WHERE list_coin.ID = " + req.query.ID)
  res1.send({
    status: 'ok',
    rows: row
  })
})
// app.get('', async (req, res1) => {
//   console.log(req.query)
//   let row = await db.raw("SELECT * FROM table_coin WHERE table_coin.ID = " + req.query.ID + "AND table_coin =" + req.query)
//   res1.send({
//     status: 'ok',
//     rows: row
//   })
// })

// ส่งเหรียญ+ไอดี หน้า home ไป coinHis
app.get('/name_coin', async (req, res1) => {
  console.log(req.query)
  
  try {
  // let row = await db.raw("SELECT * FROM table_coin WHERE table_coin.ID = " + req.query.ID + "AND table_coin =" + req.query)
  // let row = await db.raw("SELECT * FROM table_coin WHERE table_coin.ID = " + req.query.ID + "AND table_coin = '" + req.query + "'")
  // let row = await db.raw("SELECT * FROM table_coin WHERE table_coin.ID = " + req.query.ID)
  // let row = await db.raw("SELECT * FROM table_coin WHERE = '" + req.query + "'") ได้
  // let row = await db.raw("SELECT * FROM table_coin WHERE = '" + req.query + "' AND ID = '" + req.query.ID + "'")

  let row = await db.raw("SELECT * FROM table_coin WHERE  table_coin.ID = '" + req.query.ID + "' AND table_coin.name_coin = '" + req.query.name_coin + "'" )
  // let row = await db.raw("SELECT * FROM table_coin WHERE  table_coin.ID = '" + req.query.ID + "' AND table_coin.name_coin = '" + req.query.name_coin + "'" )
    res1.send({  
      status: 'ok',
      rows: row
    })
  }
  catch(e) {
    console.log(e)
    // console.log('False !! ID :  ' + req.query.ID + ' ||   : '+ req.query)
    console.log('False ||   : '+ req.query)
  }
})


app.get('/list_coin2', async (req, res) => {
  console.log('Params: ', req.query)
  try {
      // let row = await db.raw("SELECT * FROM list_coin WHERE list_coin.ID = " + req.query.ID)
  // let row = await db.raw("SELECT SUM(entry), SUM(total) ,SUM(num) FROM table_coin WHERE table_coin.ID =" + req.query.ID + " AND=" + req.query)
  // let row = await db.raw("SELECT SUM(entry), SUM(total) ,SUM(num) FROM table_coin WHERE table_coin.ID =" + req.query.ID)
  //  let row = await db.raw("SELECT SUM(entry), SUM(total) ,SUM(num) FROM table_coin WHERE ID = " + req.query.ID + "AND name_coin = " + req.query.name_coin)
        
  // let row = await db.raw("SELECT name_coin, AVG(entry) as avgEntry, SUM(total) as sumTotal ,SUM(num) as sumNum FROM table_coin WHERE table_coin.ID = " + req.query.ID + " AND table_coin.name_coin = '" + req.query.name_coin + "' AND table_coin.buysell = 'Buy' ")
  let row = await db.raw("SELECT name_coin , SUM( IF(`buysell`='Buy', `total`, 0) ) - SUM( IF(`buysell`= 'Sell', `total`, 0) )  AS `total`,SUM( IF(`buysell`='Buy', `num`, 0) ) -  SUM( IF(`buysell`='Sell', `num`, 0) ) AS `num` ,(SUM( IF(`buysell`='Buy', `total`, 0) ) - SUM( IF(`buysell`= 'Sell', `total`, 0) ) ) /  (SUM( IF(`buysell`='Buy', `num`, 0) ) -  SUM( IF(`buysell`='Sell', `num`, 0))) as `entry` FROM table_coin WHERE  table_coin.ID = '" + req.query.ID + "' AND table_coin.name_coin = '" + req.query.name_coin + "'" )
   console.log('Result: ', row[0])
  // let row = await db.raw("SELECT SUM(entry), SUM(total) ,SUM(num) FROM table_coin WHERE table_coin.ID =" + 2 + " AND=" + '"THB_ADA"')
    console.log('ค่าที่ส่งมา',req.query.name_coin)
    res.send({
    status: 'ok',
    rows: row[0]
  })
  }
  catch(e) {
    // console.log('SUM False !! ID = '+req.query.ID +'  || name_coin = '+req.query.name_coin)
    // console.log('req.query = '+req.query)
    console.log('Error: ', e)

    res.status(500)
    res.send({
      status: false,
      message: e.msg
    })
  }

})

app.post('/Register_activity',bodyParser.json(), async (req, res) => {
  console.log(req.body)
  let row2 = await db('list_activity').where('ID_student', '=', req.body.ID_student)
  .where('ID_activity', '=', req.body.ID_activity)
  console.log('row2:', row2)
  if (row2.length > 0) {
    res.send({
      status: 'No'
    })
  } else {
    let row = await db('list_activity') .insert({
    ID_activity: req.body.ID_activity,
    ID_student: req.body.ID_student,
    Register_time: req.body.Register_time
  })
  try {
    let row1 = await db('Activity').update({
      Numbers: req.body.Numbers
    }) .where('ID_activity', '=', req.body.ID_activity)

    res.send({
      status: 'Yes',
      rows1: row1
    })
  }
  catch {
    console.log('False !!')
  }
  }
    
  
})


app.post('/del',bodyParser.json(), async (req, res) => {
  console.log(req.body)
  try{
    let row1 = await db.raw('DELETE FROM table_coin WHERE ID = ' + req.body.ID)
    res.send({
      status: 'ok',
      rows: row1
    })
  }catch{
    console.log('Felse')
  }
  
})

// ลบข้อมูลตามเวลา
// app.use('/Delete_time', async (req, res2) => {
//   console.log(req.query)

//   let row1 = await db('activity') .where('Date_start', '=', req.query.dateTime)
//   console.log(row1)
//   console.log(row1.length)

//   if(row1.length > 0){
//   let row2 = await db.raw('DELETE FROM activity WHERE ID_activity = ' + row1[0].ID_activity)

//     let row3 = await db.raw('DELETE FROM list_activity WHERE ID_activity = ' + row1[0].ID_activity)

//     res2.send({
//       status: 'ok',
//     })
//   }
// })

app.post('/update_user', bodyParser.json(), async (req, res) => {
  console.log(req.body)
  if (req.body.Con_Password != req.body.Password) {
    return res.send({
      massenge: "กรุณาตรวจสอบชื่อผู้หรือรหัส",
      status: "fail",
    });
  }
  let row = await db('user') .where('ID_student', '=', req.body.ID_student)
  .update({
    Title: req.body.Title,
    Firstname: req.body.Firstname,
    Lastname: req.body.Lastname,
    Class: req.body.Class,
    Department: req.body.Department,
    Password: req.body.Password
  })

  res.send({
    status: 'ok',
    rows: row
  })
})



app.post('/insert_user', bodyParser.json(), async (req, res) => {
  try {
        console.log(req.body)
      if (req.body.con_password != req.body.password) {// เช็ค pass 
        return res.send({
          massenge: "กรุณาตรวจสอบชื่อผู้หรือรหัส",
          status: "fail",
        });
      }
      let row = await db('user').where('email', '=', req.body.email) // เช็ค ID_student ว่ามีคนใช้ยัง
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
  } catch (e) {
    console.log('error')
    console.log(e.message)
    res.send({
      status: 0,
      error: e.message,
    })
  }
})
// app.post('/insert_user', bodyParser.json(), async (req, res) => {
//   try {
//         console.log(req.body)
//       if (req.body.con_password != req.body.password) {// เช็ค pass 
//         return res.send({
//           massenge: "กรุณาตรวจสอบชื่อผู้หรือรหัส",
//           status: "fail",
//         });
//       }
//       let row = await db('user').where('email', '=', req.body.email) // เช็ค ID_student ว่ามีคนใช้ยัง
//       console.log("row", row)
//       console.log("row ความยาว", row.length)
//       if (row.length > 0) {
//         res.send({
//           status: "ok",
//           rows: row,
//         })
//       } else {
//         res.send({
//           status: "no",
//         })
//       }
//       if(req.body.email == row[0].email) {
//         res.send({
//           status: 'false'
//         })
//       }else{
//         let row = await db('user').insert({
//           email: req.body.email,
//           name: req.body.name,
//           password: req.body.password
//         })
//         res.send({
//           status: 'ok',
//           rows: row
//         })
//       }
//   } catch (e) {
//     console.log('error')
//     console.log(e.message)
//     res.send({
//       status: 0,
//       error: e.message,
//     })
//   }
// })
// asdas
app.post('/add_coin_home', bodyParser.json(), async (req, res) => {
  try {
        console.log('Add coin ',req.body)
      // let row = await db('list_coin').where('ID', '=', req.body.ID) // 
      let row = await db.raw("SELECT * FROM list_coin WHERE list_coin.ID = '" + req.query.ID + "' AND list_coin.name_coin = '" + req.query.name_coin + "'")
      // let row = await db.raw("SELECT * FROM table_coin WHERE table_coin.ID = '" + req.query.ID + "' AND table_coin.name_coin = '" + req.query + "'")
      if(row[0].name_coin == req.body.name_coin ) {
        res.send({
          status: 'false'
        })
      }else{
        let row = await db('list_coin').insert({
          ID: req.body.ID,
          name_coin: req.body.name_coin,
        })
        res.send({
          status: 'ok',
          rows: row
        })
        let row1 = await db('table_coin').insert({
          ID: req.body.ID,
          name_coin: req.body.name_coin,

        })
        res.send({
          status: 'ok1',
          rows: row1
        })
        
      }
  } catch (e) {
    console.log('error')
    console.log(e.message)
    res.send({
      status: 0,
      error: e.message,
    })
  }
})




// admin เพิ่มสมาชิก 

app.post('/admin_insert', bodyParser.json(), async (req, res) => {

  try {
    console.log(req.body)
  let row = await db('user') // เช็ค ID_student ว่ามีคนใช้ยัง
  if(req.body.email == row[0].email) {
    res.send({
      status: 'false'
    })
  }else{
    let row = await db('user').insert({
      email: req.body.email,
      name: req.body.name,
      Password: req.body.Password,
      Status: req.body.Status
    })
    res.send({
      status: 'ok',
      rows: row
    })
  }

  } catch (e) {
    console.log('error')
    console.log(e.message)
    res.send({
      status: 0,
      error: e.message,
    })
  }

  
})

// admin เพิ่มสมาชิก ^^^^^^^^^^^^^^^^^^^^^

app.post('/search',bodyParser.json(), async (req, res) => {
  console.log(req.body)
  // let row = await db.raw("SELECT * FROM activity WHERE Date_start LIKE '" + req.body.search + "'")
  let row = await db('activity') .where('Date_start', 'LIKE', req.body.search)
  console.log(row.length)
  if(row.length > 0){
    res.send({
      status: 'ok',
      rows: row
    })
  }else{
    res.send({
      status: 'fail',
    })
  }
  
})

app.listen(7000, () => {
  console.log("Application is running on port : 7000");
});