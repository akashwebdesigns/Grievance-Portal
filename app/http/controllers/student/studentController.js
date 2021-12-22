const Complaint = require('../../../models/complaintDetail')
const moment=require("moment");
const User = require('../../../models/user');


function studentController() {
    return {
        async index(req, res) {
            const complaints = await Complaint.find({ studentId: req.user._id }, null, { sort: { 'createdAt': -1 } });
            res.render("student/dashboard",{complaints:complaints,moment:moment});
        },
        reg(req, res) {
            console.log(req.user._id);
            res.render("student/regComplaint");
        },
        postRegister(req, res) {
            const { title, course, department, regarding, details } = req.body;

            if (!title || !course || !department || !regarding || !details) {
                req.flash('error', 'All fields are required');
                req.flash('title', title);
                req.flash('course', course);
                req.flash('department', department);
                req.flash('regarding', regarding);
                req.flash('details', details);
                return res.redirect('/registerComplaint');

            }
 
            const newComplaint=new Complaint({
                studentId:req.user._id,
                course: course,
                department: department,
                complaintTitle: title,
                complaintReagrding: regarding,
                detail: details,
            })


            newComplaint.save((err) => {
                if (!err) {
                    // console.log("Saved");
                    req.flash("success","Complaint registered Successfully");
                    return res.redirect('/complaint');
                }
            })

        },
        async showComplaint(req,res){
            const complaint=await Complaint.findById({_id:req.params.id},(err,comp)=>{
                if(!err){
                    // console.log(comp);
                    res.render("student/complaintDetail",{comp:comp,moment:moment});
                }
            })
        },
        async viewProfile(req,res){
            const id=req.params.id;
            const user=await User.findOne({_id:id});
            // console.log(user);
            res.render("student/viewProfile",{user:user});
        },
        async editProfile(req,res){
            const id=req.params.id;
            const user=await User.findOne({_id:id});
            res.render("student/editProfile",{user:user});
        },
        async postEditProfile(req,res){
            // console.log(req.body);
            const id=req.params.id;
            const {name,rollno,email,contact,course,branch}=req.body;
            const user=await User.updateOne({_id:id},{name:name,rollno:rollno,email:email,contactNo:contact,course:course,branch:branch});
            // console.log(user);
            res.redirect("/complaint")
        }
    }
}

module.exports = studentController;