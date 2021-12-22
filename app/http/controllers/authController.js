const User = require("../../models/user");
const passport = require("passport");
const bcrypt = require('bcrypt');
const requesturl = require('request');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

const sendMail = (mailID, link,) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        requireTLS: true,
        auth: {
            user: "akash2019071007@gmail.com", // generated ethereal user
            pass: process.env.PASSWORD, // generated ethereal password
        },
    });

    var mailOptions = {
        from: 'MMMUT Grievnace Portal <akash2019071007@gmail.com>',
        to: mailID,
        subject: 'One time password reset link',
        text: 'Hello User , Your one time password reset link is given below',
        html: `
        <h3>Hello User , Your one time password reset link is given below</h3>
        <a href=${link}>Click here to reset the password</a>`
        // html:'<a>'+link+'</a>'
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



function authController() {
    const _redirectUrl = (req) => {
        if (req.user.role === "student") {
            return "/complaint";
        }
        else {
            return "/admin/complaints"
        }
    }
    return {
        register(req, res) {
            res.render('auth/register');
        },
        async postRegister(req, res) {
            const { name, rollno, email, number, pass, cpass } = req.body;

            if (!name || !rollno || !email || !number || !pass || !cpass) {
                req.flash('error', 'All fields are required');
                req.flash('name', name);
                req.flash('rollno', rollno);
                req.flash('email', email);
                req.flash('number', number);
                return res.redirect('/register');

            }
            // Check if email already exists
            User.exists({ email: email }, (error, result) => {
                if (result) {
                    req.flash('error', 'Email Already Exists!');
                    req.flash('name', name);
                    req.flash('rollno', rollno);
                    req.flash('email', email);
                    req.flash('number', number);
                    return res.redirect('/register');
                }
            })

            //Phone no validation
            var IndNum = /^[0]?[789]\d{9}$/;
            if (!(IndNum.test(number))) {
                req.flash('error', 'Please enter correct Phone Number');
                req.flash('name', name);
                req.flash('rollno', rollno);
                req.flash('email', email);
                return res.redirect('/register');
            }

            //Password Validation    
            if (!(pass == cpass)) {
                req.flash('error', 'Passwords are not matching');
                req.flash('name', name);
                req.flash('rollno', rollno);
                req.flash('email', email);
                req.flash('number', number);
                return res.redirect('/register');
            }

            var password = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
            if (!(password.test(pass))) {
                req.flash('error', 'Password length must be greater than 6 and contain at least a symbol, upper and lower case letters and a number');
                req.flash('name', name);
                req.flash('rollno', rollno);
                req.flash('email', email);
                req.flash('number', number);
                return res.redirect('/register');
            }

            //Hashing the password

            const hashedPassword = await bcrypt.hash(pass, 10);

            //Create user in database
            const user = new User({
                name: name,
                rollno: rollno,
                email: email,
                contactNo: number,
                password: hashedPassword
            })

            console.log(user);

            user.save().then((user) => {
                // Login
                return res.redirect('/login')
            }).catch((err) => {
                console.log(err);
                req.flash('error', 'Something went wrong')
                return res.redirect('/register')
            })


        },
        login(req, res) {
            res.render('auth/login');
        },
        postLogin(req, res, next) {

            const { email, password } = req.body

            // Validate empty request
            if (!email || !password) {
                req.flash('error', 'All fields are required')
                return res.redirect('/login')
            }

            //Captcha Integration

            if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
                req.flash('error', 'Please select the captcha');
                return res.redirect('/login');
            }

            const secretKey = "6Lfai1MbAAAAANG1ES-1oKOXnPODU1RbZyVH3e7p";
            let captchaResult;
            var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

            requesturl(verificationUrl, function (error, response, body) {
                body = JSON.parse(body);
                captchaResult = body.success;
                if (captchaResult) {
                    passportAuth();
                }
                else {
                    req.flash('error', 'Captcha Verification Failed')
                    return res.redirect('/login');
                }
            });

            //Passport Auth integration  
            function passportAuth() {
                passport.authenticate('local', async (err, user, info) => {
                    if (err) {
                        req.flash('error', info.message);
                        return next(err);
                    }

                    if (!user) {
                        req.flash('error', info.message)
                        return res.redirect('/login');
                    }

                    req.logIn(user, (err) => {
                        if (err) {
                            req.flash('error', info.message);
                            return next(err);
                        }
                        return res.redirect(_redirectUrl(req));
                    })
                })(req, res, next);
            }
        },
        logout(req, res) {
            req.logout();
            return res.redirect('/');
        },
        forgotPassword(req, res) {
            res.render('auth/forgotPassword');
        },
        async postForgot(req, res) {
            const { emailId } = req.body;

            const user = await User.findOne({ email: emailId });
            if (!user) {
                res.json({ message: "User Not Found!" });
            }

            const secret = process.env.JWT_SECRET + user.password;
            const payload = {
                email: emailId,
                id: user._id
            }

            const token = jwt.sign(payload, secret, { expiresIn: '10m' });
            const link = `http://localhost:3000/forgot-password/${user._id}/${token}`;
            // console.log(link);
            sendMail(emailId, link);
            res.json({ message: "Email has been sent Successfully!" });
        },
        async resetPassword(req, res) {
            // console.log(req.params);
            const { id, token } = req.params;
            const user = await User.findById(id);
            const secret = process.env.JWT_SECRET + user.password;
            try {
                const payload = jwt.verify(token, secret);
                res.render('auth/resetPassword', { error: false });

            } catch (error) {
                res.render('auth/resetPassword', { error: true })
            }


        },
        async postResetPassword(req, res) {
            // console.log(req.body);
            const { id, token } = req.params;
            const { pass, cpass } = req.body;

            if (!pass || !cpass) {
                req.flash('error', 'Please enter the new password');
                return res.redirect(`/forgot-password/${id}/${token}`);
            }

            if (!(pass == cpass)) {
                req.flash('error', 'Passwords are not matching');
                return res.redirect(`/forgot-password/${id}/${token}`);
            }

            var password = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
            if (!(password.test(pass))) {
                req.flash('error', 'Password length must be greater than 6 and contain at least a symbol, upper and lower case letters and a number');
                return res.redirect(`/forgot-password/${id}/${token}`);
            }

            const hashedPassword = await bcrypt.hash(pass, 10);

            User.updateOne({ _id: id }, { password: hashedPassword }, (err, docs) => {
                if (err) {
                    console.log(err);
                    res.redirect('/forgot-password');
                }
                else {
                    // console.log(docs);
                    res.redirect('/login');
                }
            })

        }
    }
}

module.exports = authController;