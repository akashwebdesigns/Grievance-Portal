const mongoose=require('mongoose');

const Schema = mongoose.Schema

const userSchema=new Schema({
    name : {
        type:String,
        required:true
    },
    rollno : {
        type:String,
        required:true
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    contactNo : {
        type:Number,
        required:true
    },
    password : {
        type:String,
        required:true
    },
    role:{
        type:String,
        default:'student'
    },
    course:{
        type:String
    },
    branch:{
        type:String
    }
},{timestamps:true})

const User=mongoose.model('User',userSchema);


module.exports=User;