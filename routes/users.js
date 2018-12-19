var express = require('express');
var router = express.Router()
var path = require('path')
var mongojs = require('mongojs')
var db = mongojs('passportapp',['users']);
var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

router.use(express.static(path.join('public')));
 
//register -GET
router.get('/register',function(req,res){
    req.logout();
    res.render('register');
})

//REGISTER - POST (handling register form)
router.post('/register',function(req,res){
    
    //get form input
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    //Validation with express-validator
    req.checkBody('name','Name field cant be empty!').notEmpty();
    req.checkBody('email','Email field cant be empty!').notEmpty();
    req.checkBody('username','Username field cant be empty!').notEmpty();
    req.checkBody('email','Enter a valid email address!').isEmail();
    req.checkBody('password','password field cant be empty!').notEmpty();
    req.checkBody('password2','passwords do not match!').equals(password);

    //errors
    var errors = req.validationErrors();
    if (errors){
        res.render('register',{
            errors:errors,
            name:name,
            email:email,
            username:username,
            password:password,
            password2:password2
        })
    }
    else{

        var newUser = {

            name:name,
            email:email,
            username:username,
            password:password

            }

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password, salt, function(err, hash){
                newUser.password = hash;
                
            db.users.insert(newUser, function(err, docs){
                if (err){
                    res.send(err);
                }
                else{
                    console.log("User added");

                    //success-message
                    req.flash('success','Successfully Registered, you can now Login');

                    //redirect
                    res.location('/users/login');
                    res.redirect('/users/login')
                }
            });
       });


       });
    }

})

//login - GET
router.get('/login', function(req,res){
    req.logout()
    res.render('login');
})

//local strategy
passport.serializeUser(function(user, done){
    done(null, user._id);
});

passport.deserializeUser(function(id, done){
    db.users.findOne({_id: mongojs.ObjectId(id)}, function(err, user){
        done(null, user);
    })
})

passport.use(new LocalStrategy(
    function(username, password, done){
        db.users.findOne({username:username}, function(err, user){
            if (err){
                return done(err);
            }
            if (!user){
                return done(null, false, {message:'Invalid username'})
            }
            bcrypt.compare(password, user.password, function(err, isMatch){
                if (err){
                    return done(err);
                }
                if (isMatch){
                    return done(null, user);
                }
                else{
                    return done(null, false, {message:'Invalid password'});
                }
            })
        })
    }
));



router.post('/login', 
    passport.authenticate('local', {
        successRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash:'Invalid username or password'
    }))

router.get('/logout',function(req, res){
    req.logout();
    req.flash('success','You Have Logged Out');
    res.redirect('/users/login');
})

module.exports = router;