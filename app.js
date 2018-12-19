var express = require('express');
var path = require('path')
var expressValidator = require('express-validator');
var session = require('express-session');
var passport = require('passport')
var LocalStrategy = require('passport-strategy').Strategy;
var bodyParser = require('body-parser');
var flash = require('connect-flash')


var routes = require('./routes/index');
var users = require('./routes/users')
var app = express();

//view engine
app.set('view engine', 'ejs');
//static folder
app.use(express.static(path.join(__dirname,'public')));


//bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//express-session middleware
app.use(session({
    secret:'secret',
    saveUninitialized:true,
    resave:true
}))

//passport middleware
app.use(passport.initialize())
app.use(passport.session());

//express-validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        ,  formParam = root;

        while(namespace.length){
            formParam = '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };

    }
}));

//connnect-flash
app.use(flash());
app.use(function(req, res,  next){
    res.locals.messages = require('express-messages')(req, res);
    next();
})

app.get('*',(req, res,next) =>   {
    res.locals.user = req.user || null;
    next();
})

app.use('/', routes);
app.use('/users', users);

app.listen(3000, ()=>{
    console.log('server started on port 3000')
})

var d = new Date()
console.log(d.getTime());