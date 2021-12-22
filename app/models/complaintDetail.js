const mongoose=require("mongoose");


const complaintSchema=new mongoose.Schema({
    studentId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
    },
    course:String,
    department:String,
    complaintTitle:String,
    complaintReagrding:String,
    detail:String,
    status:{
        type:String,
        default:"Pending"
    }
},{timestamps:true});

const Complaint=mongoose.model('Complaint',complaintSchema);

module.exports=Complaint;

