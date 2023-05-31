const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const multer  = require('multer')
const fs = require('fs');
const { formatWithOptions } = require('util')
var crypto = require('crypto')

var pendingDB = JSON.parse(fs.readFileSync('pending.json','utf-8'));
var filesDB = JSON.parse(fs.readFileSync('files.json','utf-8'));

function addPendingFile(originalname,pathname,summeryName,author,description,subject){
  pendingDB.push({
    "summeryName": summeryName,
    "pathname": pathname,
    "originalname": originalname,
    "author": author,
    "description": description,
    "subject": subject,
    "id": crypto.randomBytes(10).toString('hex')
  })
  fs.writeFileSync("pending.json",JSON.stringify(pendingDB,null,"\t"));
}
function removePendingFile(id){

  for(var i = 0; i < pendingDB.length;i++){
    if(id == pendingDB[i].id){
      fs.unlinkSync(path.join(__dirname,"/pending",pendingDB[i].pathname));
      pendingDB.splice(i,1);
      fs.writeFileSync("pending.json",JSON.stringify(pendingDB,null,"\t"));
      return;
    }
  }
}
function addFile(originalname,pathname,summeryName,author,description,subject){
  filesDB.push({
    "summeryName": summeryName,
    "pathname": pathname,
    "originalname": originalname,
    "author": author,
    "description": description,
    "subject": subject,
    "id": crypto.randomBytes(10).toString('hex')
  })
  fs.writeFileSync("files.json",JSON.stringify(filesDB,null,"\t"));
}
function confirmFile(id){
  var index = -1;
  for(var i = 0; i < pendingDB.length;i++){
    if(pendingDB[i].id == id){
      index = i;
    }
  }
  if(index == -1){
    return;
  }
  addFile(pendingDB[index].originalname,pendingDB[index].pathname,pendingDB[index].summeryName,pendingDB[index].author,pendingDB[index].description,pendingDB[index].subject);

  var oldPath = path.join(__dirname,"/pending",pendingDB[index].pathname)
  var newPath = path.join(__dirname,"/files",pendingDB[index].pathname)

  fs.renameSync(oldPath, newPath)
  pendingDB.splice(index,1);
  fs.writeFileSync("pending.json",JSON.stringify(pendingDB,null,"\t"));
}
function removeFile(id){
  for(var i = 0; i < filesDB.length;i++){
    if(id == filesDB[i].id){
      fs.unlinkSync(path.join(__dirname,"/files",filesDB[i].pathname));
      filesDB.splice(i,1);
      fs.writeFileSync("files.json",JSON.stringify(filesDB,null,"\t"));
      return;
    }
  }
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
    if(fieldExists(req.author,false) && fieldExists(req.summeryName,false) && fieldExists(req.description,true) &&fieldExists(req.subject,false)){
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
    var isDupe = false;
    pendingDB.forEach(element => {
      if(element.summeryName == req.body.summeryName && element.subject == req.body.subject){
        isDupe = true;
      }
    });
    if(isDupe){
      fs.unlinkSync(path.join(__dirname,"/pending",req.file.filename));
      res.send('duplicate');
    }else{
      addPendingFile(req.file.originalname,req.file.filename,req.body.summeryName,req.body.author,req.body.description,req.body.subject);
      res.send('upload successful');
    }
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
  res.json(filesDB);
})
app.get("/pending",function(req,res){
  if(req.headers.password == password){
    res.json(pendingDB);
    return;
  }
  res.status(403)
  res.send("insufficient permissions");
})
app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})