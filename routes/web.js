function initRoutes(app){


//Controllers
const homeController=require("../app/http/controllers/homeController");    
const authController=require("../app/http/controllers/authController");    
const studentController=require("../app/http/controllers/student/studentController");
const adminController=require("../app/http/controllers/admin/adminController");

//Middlewares
const guest=require('../app/http/middlewares/guest');
const user=require('../app/http/middlewares/user');
const admin=require('../app/http/middlewares/admin');


app.get('/',homeController().index);
//Registration
app.get('/register',guest,authController().register);
app.post('/register',authController().postRegister);
//Login/logout
app.get('/login',guest,authController().login);
app.post('/login',authController().postLogin);
app.post('/logout',authController().logout);
app.get('/forgot-password',authController().forgotPassword);
app.post('/forgot-password',authController().postForgot);
app.get('/forgot-password/:id/:token',authController().resetPassword);
app.post('/forgot-password/:id/:token',authController().postResetPassword);

//Student
app.get('/complaint',user,studentController().index);
app.get('/registerComplaint',user,studentController().reg)
app.get('/complaint/:id',user,studentController().showComplaint)
app.post('/registerComplaint',studentController().postRegister)
app.get('/user/view/:id',studentController().viewProfile);
app.get('/user/edit/:id',studentController().editProfile);
app.post('/user/edit/:id',studentController().postEditProfile);


//Admin
app.get('/admin/complaints',admin,adminController().index);
app.get('/admin/complaints/:id',admin,adminController().viewComplaint);
app.post('/admin/statusChange',adminController().statusChange);
app.get('/admin/addadmin',admin,adminController().addAdmin);
app.post('/admin/addadmin',admin,adminController().postAddAdmin);

//Contacts Us
app.get('/contactus',(req,res)=>{
    res.render('contactus');
})

}


module.exports=initRoutes;