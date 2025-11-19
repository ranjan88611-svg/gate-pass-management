const mongoose=require('mongoose');
module.exports=mongoose.model('User',new mongoose.Schema({
 name:String,usn:{type:String,unique:true},email:String,phone:String,password:String
}));