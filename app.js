const express=require('express');
const app=express();
const path=require("path");
const exphbs=require("express-handlebars");
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const methodOverride=require('method-override');
const upload=require('express-fileupload');
const session=require('express-session');
const flash=require('connect-flash');
const {mongoDbUrl}=require('./config/database');
const passport=require('passport'); 

mongoose.Promise=global.Promise;


mongoose.connect(mongoDbUrl).then((db)=>{
    console.log("Connected to mongo");
}).catch(err=>console.log(err));



app.use(express.static(path.join(__dirname,'public')));
 


const {select,generateTime,paginate}=require('./helpers/handlebars');

// set view engine
app.engine('handlebars',exphbs({defaultLayout:'home',helpers:{select:select,generateTime:generateTime,paginate:paginate}}))
app.set('view engine','handlebars');


// upload 
app.use(upload());

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));


// session and flash
app.use(session({
    secret:"mariusvasililovecoding",
    resave:true,
    saveUninitialized:true
}));
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());



// local variables using middleware
app.use((req,res,next)=>{
    // user came from here when is logged in and afterwards we use user.firstName in admin.handlebars
    // these are global variables
    // we can use them in all files like normal variables declared in that file
    // example: success_message we use it in form-msgs it contains the value of req.flash("success_message")
    res.locals.user=req.user || null;
    res.locals.success_message=req.flash("success_message");
    res.locals.error_message=req.flash("error_message");
    res.locals.error=req.flash("error");
    next();
})




// load routes
const home=require('./routes/home/index');
const admin=require('./routes/admin/index');
const posts=require('./routes/admin/posts');
const categories=require('./routes/admin/categories');
const comments=require('./routes/admin/comments');

// use routes
app.use('/',home);
app.use('/admin',admin);
app.use('/admin/posts',posts);
app.use('/admin/categories',categories);
app.use('/admin/comments',comments);







app.listen(3000,()=>{
    console.log("Started on port 3000");
});