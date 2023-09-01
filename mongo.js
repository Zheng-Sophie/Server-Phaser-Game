const mongoose = require('mongoose')



// mongoose.connection.close()

let Schema = mongoose.Schema

let fileSchema = new Schema({
  userId: String,
  fieldname: String,
  originalname: String,
  mimetype: String,

})

let userSchema = new Schema({
  username: String,
  password: String
})
let fileModel = mongoose.model('FileModel',fileSchema)
let userModel = mongoose.model('UserModel',userSchema)

module.exports = {
    fileModel,
    userModel
}