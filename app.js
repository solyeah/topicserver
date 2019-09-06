var express = require('express');
var bodyParser = require('body-parser');
require('dotenv').config()
const mysql = require('mysql');

const db = mysql.createConnection({ //config파일이 들어감
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

db.connect()

const app = express()
app.set('views', __dirname+ '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile)
app.use(bodyParser.urlencoded({extended:false}))

app.get('/topic/add', (req,res)=>{
    var sql = 'SELECT * FROM topic'
    db.query(sql , (err, result)=>{
        if(err){
            console.log(err);
            res.status(500).send("Internel Server error")
        }
        console.log(result)
        // res.send(result)
        res.render('add.ejs',{topics:result})
        //res.send(result) 하면 다른 앱에서 fetch통해 결과 받아가게도 할 수 있음.
    })
})

app.post('/topic/add', (req,res)=>{
    console.log(req.body);
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    // var sql = `INSERT INTO topic ( title, description, author) VALUES ('${title}','${description}','${author}')`;
    //윗줄처럼 적던가 아니면 밑의 방법으로 하던가.
    var sql = 'INSERT INTO topic ( title, description, author) VALUES (?,?,?)';
    var params = [title, description, author];
    db.query(sql,params,(err,result)=>{//(쿼리문,파라미터,콜백함수)
        if(err){
            console.log(err);
            res.status(500).send("Internel Server error")
        }
        console.log('성공적으로 저장되었습니다.')
        res.redirect(`/topic/${result.insertId}`)
    })
});//


app.get(['/topic/:id/edit'], function(req, res){// 수정기능 :id는 밑의 where =? 에 들어감.
    var sql1 = 'SELECT id,title FROM topic';    // 일단, 글 목록을 불러온다.(edit페이지에도 글목록은 항상 존재)
    db.query(sql1, function(err, results){//쿼리1 : topic에서 id와 title 받아온다.
      var ids = req.params.id; // request받은 ids값
      if(ids){
        var sql2 = 'SELECT * FROM topic WHERE id=?';// id값을 통하여 수정하려고 하는 특정 데이터만 불러온다.
        db.query(sql2, [ids], function(err, result){//
          if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
          } else {
            res.render('edit', {topics : results, topic : result[0] });//topic은 배열안에 담긴 객체로 들어오기 때문에, topic[0]으로 데이터를 객체만 전달한다.(전달한 데이터를 통해서 현재 수정하려고 하는 데이터를 화면에 뿌려준다.)
          }//render(edit)=> app.set에 의해 views폴더의 edit파일로 간다. 
        });
      } else {//id가 없을 경우 반환한다.
        console.log(err);
        res.send('There is no id.');
      }
    });
 });



 app.post('/topic/:id/edit', function(req, res){
    var sql = 'UPDATE topic SET title=?, description=?, author=? WHERE id=?';//수정하는 쿼리문(where가 매우 중요! 없으면, 다 똑같이 수정됨 큰일남.)
    var title = req.body.title; // 사용자가 다시 입력한 title. req객체의 body객체의 title키로 접근가능
    var description = req.body.description;
    var author = req.body.author;
    var id = req.params.id;//url의 파라미터로 id 값을 얻을 수 있다.
    db.query(sql, [title, description, author, id], function(err, result, fields){
      if(err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      } else {
        res.redirect('/topic/'+id)// 수정한 페이지로 이동
      }
    });
 });

 app.get(['/topic/'],(req,res)=>{
     return(
         res.render('topic.ejs')
     )
 })


app.get(['/topic/:id'], function(req, res){// 수정기능 :id는 밑의 where =? 에 들어감.
    var sql1 = 'SELECT id,title FROM topic';    // 일단, 글 목록을 불러온다.(edit페이지에도 글목록은 항상 존재)
    db.query(sql1, function(err, results){//쿼리1 : topic에서 id와 title 받아온다.
      var ids = req.params.id; // request받은 ids값
      if(ids){
        var sql2 = 'SELECT * FROM topic WHERE id=?';// id값을 통하여 수정하려고 하는 특정 데이터만 불러온다.
        db.query(sql2, [ids], function(err, result){//
          if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
          } else {
            res.render('detail', {topics : results, topic : result[0] });//topic은 배열안에 담긴 객체로 들어오기 때문에, topic[0]으로 데이터를 객체만 전달한다.(전달한 데이터를 통해서 현재 수정하려고 하는 데이터를 화면에 뿌려준다.)
          }
        });
      } else {//id가 없을 경우 반환한다.
        console.log(err);
        res.send('There is no id.');
      }
    });
 });



// const router = require('./routes')(app)
const urlPort = process.env.PORT || 5000
app.listen(urlPort, ()=> {
    console.log(`server is starting: http://localhost:${urlPort}`)
})