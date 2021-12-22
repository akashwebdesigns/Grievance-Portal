require('dotenv').config();//dotenv allows you to separate secrets from your source code.
const express=require('express');
const mongoose= require('mongoose');
const app=express();
const PORT=process.env.PORT || 3000;
const session=require('express-session');
const flash=require('express-flash');
const MongoDbStore=require('connect-mongo');//used to store sessionid in the mongo database
const passport=require('passport');



app.use(express.static('public'));
app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(flash());
// const MongoClient = require('mongodb').MongoClient;


// Database Connection
mongoose.connect(` mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zkflz.mongodb.net/complaintSystem?retryWrites=true&w=majority`,{ useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true }).then(()=>{
    console.log("Database Connected")
})
.catch((err)=>{
  console.log(err);
})
// const connection = mongoose.connection;


// mongoose.connect(`mongodb://localhost:27017/complaintSystem`, { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify : true })
// .then(()=>{
//   console.log("Database Connected");
// })
// .catch((err)=>{
//   console.log(err);
// })












// const connection = mongoose.connection;
// connection.once('open', () => {
//     console.log('Database connected...');
// }).catch(err => {
//     console.log('Connection failed...')
// });



//Session config
app.use(session({
    secret:process.env.COOKIE_SECRET,
    resave: false,
    // store: MongoDbStore.create({
    //   client:connection.getClient()
    // }),
    store: MongoDbStore.create({
      mongoUrl: 'mongodb://localhost:27017/complaintSystem', //YOUR MONGODB URL
  }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 1 } // 1 hour session expiration/cookie expiration
  }))

//Passport Config
const passportInit=require("./app/config/passport");
app.use(passport.initialize());
app.use(passport.session());  
passportInit(passport);

//Global Middleware
app.use((req,res,next)=>{
    res.locals.session=req.session;
    res.locals.user=req.user;
    next();
  })

//Routes

require("./routes/web")(app);

app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
})