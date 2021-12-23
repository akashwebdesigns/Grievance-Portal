const Complaint = require("../../../models/complaintDetail");
require('dotenv').config();
const nodemailer = require("nodemailer");
const moment = require("moment");
const User = require("../../../models/user");
const bcrypt = require("bcrypt");
var SibApiV3Sdk = require("sib-api-v3-sdk");
var defaultClient = SibApiV3Sdk.ApiClient.instance;

function adminController() {
    return {
        index(req, res) {
            Complaint.find({ status: { $ne: 'Resolved' } }, null, { sort: { 'createdAt': -1 } }).populate('studentId', '-password').exec((err, complaints) => {
                // console.log(complaints);
                res.render('admin/complaints', { complaints: complaints, moment: moment });
            })
        },
        viewComplaint(req, res) {
            Complaint.findById({ _id: req.params.id }).populate('studentId', '-password').exec((err, comp) => {
                if (!err) {
                    // console.log(comp);
                    res.render("admin/viewComplaint", { comp: comp, moment: moment });
                }
            })
        },
        statusChange(req, res) {
            // console.log(req.body);
            const { message, status, emailId, complaintId } = req.body;
            if (!message) {
                req.flash('error', 'Please write a message');
                return res.redirect('/admin/complaints/' + complaintId);
            }
            if (!status) {
                req.flash('error', 'Please select a status');
                return res.redirect('/admin/complaints/' + complaintId);
            }
            if (status === "Complaint Resolved") {
                Complaint.updateOne({ _id: req.body.complaintId }, { status: "Resolved" }, (err) => {
                    if (!err) {
                        sendMail(emailId, message, complaintId);
                        return res.redirect('/admin/complaints');
                    }
                })
            }
            else {
                return res.redirect('/admin/complaints');
            }

            //To send the mail
            const sendMail = async (mailID, message, complaintId) => {
                let transporter = nodemailer.createTransport({
                    // host: "smtp.gmail.com",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    requireTLS: true,
                    auth: {
                        user: "akash2019071007@gmail.com", // generated ethereal user
                        pass: process.env.PASSWORD, // generated ethereal password
                    },
                });

                var mailOptions = {
                    from: 'akash2019071007@gmail.com',
                    to: mailID,
                    subject: 'MMMUT Grievance Portal Response',
                    text: `Hello Student , with reference to your Complaint Id ${complaintId} , following actions are performed

                    ${message}      

                    With Regards
                    MMMUT Grievance Management Team
                    This is a system generated mail , Please do not reply to it.
                    `
                }
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log('Email has been sent successfully ' + info.response);
                    }
                })


            }
        },
        addAdmin(req, res) {
            res.render("admin/addAdmin");
        },
        async postAddAdmin(req, res) {
            const { name, empId, email, number, pass, cpass } = req.body;

            if (!name || !empId || !email || !number || !pass || !cpass) {
                req.flash('error', 'All fields are required');
                req.flash('name', name);
                req.flash('empId', empId);
                req.flash('email', email);
                req.flash('number', number);
                return res.redirect('/admin/addadmin');

            }
            // Check if email already exists
            User.exists({ email: email }, (error, result) => {
                if (result) {
                    req.flash('error', 'Email Already Exists!');
                    req.flash('name', name);
                    req.flash('empId', empId);
                    req.flash('email', email);
                    req.flash('number', number);
                    return res.redirect('/admin/addadmin');
                }
            })

            //Phone no validation
            var IndNum = /^[0]?[789]\d{9}$/;
            if (!(IndNum.test(number))) {
                req.flash('error', 'Please enter correct Phone Number');
                req.flash('name', name);
                req.flash('empId', empId);
                req.flash('email', email);
                return res.redirect('/admin/addadmin');
            }

            //Password Validation    
            if (!(pass == cpass)) {
                req.flash('error', 'Passwords are not matching');
                req.flash('name', name);
                req.flash('empId', empId);
                req.flash('email', email);
                req.flash('number', number);
                return res.redirect('/admin/addadmin');
            }

            var password = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
            if (!(password.test(pass))) {
                req.flash('error', 'Password length must be greater than 6 and contain at least a symbol, upper and lower case letters and a number');
                req.flash('name', name);
                req.flash('empId', empId);
                req.flash('email', email);
                req.flash('number', number);
                return res.redirect('/admin/addadmin');
            }


            //Hashing the password

            const hashedPassword = await bcrypt.hash(pass, 10);

            //Create user in database
            const user = new User({
                name: name,
                rollno: empId,
                email: email,
                contactNo: number,
                password: hashedPassword,
                role: 'admin'
            })

            // console.log(user);

            user.save().then((user) => {
                // Login
                return res.redirect('/admin/complaints')
            }).catch((err) => {
                console.log(err);
                req.flash('error', 'Something went wrong')
                return res.redirect('/admin/complaints')
            })
        }


    }
}

module.exports = adminController;