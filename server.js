const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const multer  = require('multer')
const fs = require('fs');
const { formatWithOptions } = require('util')
const sqlite3 = require('sqlite3').verbose();
var crypto = require('crypto')

function errorFunction(err){
  if(err) return console.error(err.message);
}

const db = new sqlite3.Database('./files.db',sqlite3.OPEN_READWRITE,errorFunction)

//Create files table
//db.run("CREATE TABLE files(id INTEGER PRIMARY KEY,summery_name,path_name,original_name,author,description,subject,grade)")
//Create pending table
//db.run("CREATE TABLE pending(id INTEGER PRIMARY KEY,summery_name,path_name,original_name,author,description,subject,grade)")

function addPendingFile(originalname,pathname,summeryName,author,description,subject,grade){
  var sql = "INSERT INTO pending(summery_name,path_name,original_name,author,description,subject,grade) VALUES (?,?,?,?,?,?,?)";
  db.run(sql,[summeryName,pathname,originalname,author,description,subject,grade],errorFunction);
}
function removePendingFile(id){
  var sql = "SELECT path_name FROM pending WHERE id=?";

  db.get(sql,[id],(err,row)=>{
    if(err) return console.error(err.message);

    fs.unlinkSync(path.join(__dirname,"/pending",row.path_name));
  })

}
function addFile(originalname,pathname,summeryName,author,description,subject,grade){

  var sql = "INSERT INTO files(summery_name,path_name,original_name,author,description,subject,grade) VALUES (?,?,?,?,?,?,?)";
  db.run(sql,[summeryName,pathname,originalname,author,description,subject,grade],errorFunction);
}
function confirmFile(id){
  
  var sql = "SELECT * FROM pending WHERE id=?"
  db.get(sql,[id],(err,row)=>{
    if(err) return console.error(err.message);
    var oldPath = path.join(__dirname,"/pending",row.path_name)
    var newPath = path.join(__dirname,"/files",row.path_name)
    fs.renameSync(oldPath, newPath)
    var sql2 = "INSERT INTO files(summery_name,path_name,original_name,author,description,subject,grade) VALUES (?,?,?,?,?,?,?)"
    db.run(sql2,[row.summery_name,row.path_name,row.original_name,row.author,row.description,row.subject,row.grade],errorFunction);
  })
  sql = "DELETE FROM pending WHERE id=?";
  db.run(sql,[id],errorFunction);
  

}
function removeFile(id){
  var sql = "SELECT * FROM files WHERE id=?"
  db.get(sql,function(err,row){
    if(err) return console.error(err.message);

    fs.unlinkSync(path.join(__dirname,"/files",row.path_name));
  })
  sql = "DELETE FROM files WHERE id=?";
  db.run(sql,[id],errorFunction);
}

let password = fs.readFileSync('password.txt', 'utf8');
if(password == ""){
  console.log("no password generated");
  process.exit();
}
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'pending/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})
function fieldExists(field, canBeEmpty){
  if(typeof field != 'string'){
    return false;
  }
  if(!canBeEmpty){
    if(field == ""){
      return false;
    }
  }
  return true;
}
function validateUpload(req){
    if(fieldExists(req.author,false) && fieldExists(req.summeryName,false) && fieldExists(req.description,true) &&fieldExists(req.subject,false)&&fieldExists(req.grade,false)){
      return true;
    }
    return false;
}
const upload = multer({
  storage: storage
})

app.use('/static',express.static('public'))
app.use('/admin',express.static('admin'))

app.use('/files',express.static('files'))



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'browser.html'));
})

app.get('/upload', (req,res) => {
  res.sendFile(path.join(__dirname, '/public', 'upload.html'));
})

app.get('/admin', (req,res) => {
  res.sendFile(path.join(__dirname, '/admin', 'admin.html'));
})

app.post('/upload',upload.single('file'),function(req,res){
  var exists = !(typeof req.file === "undefined");
  if(!validateUpload(req.body) || !exists){
    if(exists){fs.unlinkSync(path.join(__dirname,"/pending",req.file.filename))}
    res.send('missing fields');
  }else{
    
    var sql = "SELECT * FROM pending"
    db.all(sql,function(err,rows){
      var isDupe = false;
      rows.forEach(element => {
        if(element.summery_name == req.body.summeryName && element.subject == req.body.subject && row.grade == req.body.grade){
          isDupe = true;
        }
      });
      if(isDupe){
        fs.unlinkSync(path.join(__dirname,"/pending",req.file.filename));
        res.send('duplicate');
      }else{
        addPendingFile(req.file.originalname,req.file.filename,req.body.summeryName,req.body.author,req.body.description,req.body.subject,req.body.grade);
        res.send('upload successful');
      }
    })
  }
})
app.post("/confirm",function(req,res){
  if(req.headers.password == password){
    confirmFile(req.headers.id);
    res.send("ok");
    return;
  }
  res.send("insufficient permissions",403);
})
app.post("/deny",function(req,res){
  if(req.headers.password == password){
    removePendingFile(req.headers.id);
    res.status(200);
    res.send("ok");
  }
  res.status(403);
  res.end();
})
app.post("/remove",function(req,res){
  if(req.headers.password == password){
    removeFile(req.headers.id);
    res.status(200);
    res.send("ok");
  }
  res.status(403);
  res.end();
})

app.post("/validate",function(req,res){
  if(req.headers.password == password){
    res.status(200);
    res.send("ok");
  }else{
    res.status(403);
    res.send("not ok");
  }
})

app.get("/files",function(req,res){
  var sql = "SELECT * FROM files"
  db.all(sql,function(err,rows){
    res.json(rows);
  })
})
app.get("/pending",function(req,res){
  if(req.headers.password == password){
    var sql = "SELECT * FROM pending"
    db.all(sql,function(err,rows){
      res.json(rows);
    })
    return;
  }
  res.status(403)
  res.send("insufficient permissions");
})

app.get("/pending/:filename",function(req,res){
  if(req.query.pass == password){
    if(fs.existsSync(path.join(__dirname,"/pending",req.params.filename))){
      res.sendFile(path.join(__dirname,"/pending",req.params.filename));
      return;
    }
    res.status(404)
    res.send("file not found");
    return;
  }
  res.status(403)
  res.send("insufficient permissions");
})
app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})