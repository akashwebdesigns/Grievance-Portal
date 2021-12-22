const LocalStrategy=require('passport-local').Strategy;
const bcrypt=require('bcrypt');
const User=require("../models/user");

function init(passport){
    passport.use(new LocalStrategy({usernameField:'email'},async(email,password,done)=>{
        //if email exists or not
        const user=await User.findOne({email:email});

        if(!user){
            return done(null,false,{message:"No user found"});
        }
        //If user exists check the password

        bcrypt.compare(password,user.password).then((match)=>{
            if(match){
                return done(null,user,{message:"Logged in successfully"});
            }
            return done(null,false,{message:"Wrong username or password"});
        }).catch((err)=>{
            return done(null,false,{message:"Something went wrong"})
        })
    }))

    passport.serializeUser((user,done)=>{
        done(null,user._id);
    })

    passport.deserializeUser((id,done)=>{
        User.findById(id,(err,user)=>{
            done(err,user);
        })
    })
    
}

module.exports=init;



// Where does user.id go after passport.serializeUser has been called?
// The user id (you provide as the second argument of the done function) is saved in the session and is later used to retrieve the whole object via the deserializeUser function.

// serializeUser determines which data of the user object should be stored in the session. The result of the serializeUser method is attached to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide the user id as the key) req.session.passport.user = {id: 'xyz'}


// The first argument of deserializeUser corresponds to the key of the user object that was given to the done function (see 1.). So your whole object is retrieved with help of that key. That key here is the user id (key can be any key of the user object i.e. name,email etc). In deserializeUser that key is matched with the in memory array / database or any data resource.

// The fetched object is attached to the request object as req.user

// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });              │
//                  │ 
//                  │
//                  └─────────────────┬──→ saved to session
//                                    │    req.session.passport.user = {id: '..'}
//                                    │
//                                    ↓           
// passport.deserializeUser(function(id, done) {
//                    ┌───────────────┘
//                    │
//                    ↓ 
//     User.findById(id, function(err, user) {
//         done(err, user);
//     });            └──────────────→ user object attaches to the request as req.user   
// });