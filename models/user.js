const mongoose = require('mongoose');
const uniqueValidator=require("mongoose-unique-validator")

const userScheme=new mongoose.Schema({
    name:{type:String,required :true},
    email:{type:String,required :true,unique:true},//make quering faster with unique 
    password:{type:String,required :true,minLength:6},
    image:{type:String,required :true},
    places:[{type : mongoose.Types.ObjectId,required:true,ref:"Places"}]
})
userScheme.plugin(uniqueValidator)
module.exports=mongoose.model("User",userScheme)