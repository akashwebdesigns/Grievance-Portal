function guest(req, res, next) {

    if (!req.isAuthenticated()) {//checks if the user is logged in not
        return next();//We will use this middleware to redirect
                      //if the user is not logged in then only allow the user to go to the login and register page
                    //otherwise redirect it to the home page
    }
    return res.redirect('/');
}

module.exports=guest;