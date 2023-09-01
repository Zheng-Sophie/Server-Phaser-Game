const express = require("express")
const mongoose = require("mongoose")
const fs = require('fs')

const app = express()

//connect
mongoose.connect('mongodb://127.0.0.1:27017/PhaserGame?authSource=admin&readPreference=primary&ssl=false', function (err) {
  if (err) {
    console.debug(err)
    return
  }
  console.debug('數據庫連接成功')
})

//Schema
let userSchema = new mongoose.Schema({
  username: String,
  password: String
})

let userPublishGameSchema = new mongoose.Schema({
  username: String,
  gameId: String,
  gameModifyDatas: Object
})

let userModel = mongoose.model('UserDatas',userSchema)

app.get('/', (req, res) => res.send('Hello World!'))

//app
app.post("/register", function (req, res) {
  const {username,password} = req.query;
  let message = ""
  let isSuccessed = false 
  let isUsernameExisted

  userModel.findOne({
    username
  })
  .then((data) => {
    isUsernameExisted = data
    if(!isUsernameExisted){
      userModel.create({
        'username': username,
        'password': password
      })
      message = "Register Success!"
      isSuccessed = true
    }else{
      message = "這個用戶名已經有人使用"
    }
    console.log("register message: " , message);
    res.json({message,isSuccessed})
  })
  
})

app.post("/login", function (req, res) {
  const {username,password} = req.query;
  let message = ""
  let isSuccessed = false 
  userModel.findOne({
    username
  })
  .then((foundAccount) => {
    if(foundAccount){
      if(foundAccount.password === password){
        message = "Welcome: " + username
        isSuccessed = true
      }else{
        message = "密碼輸入錯誤"
      }
    }else{
      message = "帳號不存在"
    }
    console.log("login message: " , message);
    res.json({message,isSuccessed})
  })
  
})


app.get("/getGameDatas", function (req, res) {
  const {gameId,username,userMode,actionType} = req.query;
  // console.log("gameId:",gameId,"   username:",username,"   userMode:", userMode);

  let userPublishGameModel = mongoose.model(username, userPublishGameSchema)


  
  userPublishGameModel.findOne(
    {gameId,username}
  ).then((data)=>{
    if(data && actionType != "default"){
      // console.log('user found');
      res.json({
        gameDatas: data.gameModifyDatas,
        message: "已找到您最近的修改資料，讀取完成！",
        notFound: false
      });        
    }else {
      if(userMode === "play"){
          // console.log('user not found');
          res.json({
            message: "沒有找到這個遊戲！",
            notFound: true
          });
      }else if(userMode === "modify"){
          // console.log('user not found, using default datas');
          const fileDatas = fs.readFileSync(`./public/gameDatas/${gameId}/gameDatas.json`)
          // console.log(JSON.parse(fileDatas));
          res.json({
            gameDatas: JSON.parse(fileDatas),
            message: "沒有找到這個遊戲的修改資料，使用默認資料"
          });
      }
    }
  })
})

app.get("/getDefaultImgDatas", function (req, res) {
  const fileDatas = fs.readFileSync(`./public/gameDatas/defaultImages.json`)
  res.json(JSON.parse(fileDatas));
})

app.post("/publishGame", function (req, res) {
  const {gameId,username,gameModifyDatas} = req.query;
  let isSuccessed = false 
  
  let userPublishGameModel = mongoose.model(username, userPublishGameSchema)

  userPublishGameModel.findOneAndReplace(
    {gameId,username},
    {gameId,username,gameModifyDatas: JSON.parse(gameModifyDatas)}
  ).then((data)=>{
    if(!data){
      userPublishGameModel.create({
        gameId,username,
        gameModifyDatas: JSON.parse(gameModifyDatas)
      })
    }
    isSuccessed = true
  })

  res.json({
    isSuccessed,
    gameUrl: `playGame/?gameId=${gameId}&username=${username}`
  });
})

app.listen(5050, "0.0.0.0", (err) => {
  if (!err){ console.log("connect 5050")} 
  else console.log(err);
})
