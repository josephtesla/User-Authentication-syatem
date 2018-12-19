var express = require('express');
var router = express.Router()
var mongoose = require('mongoose');

router.get('/', ensureAuthenticated, function(req,res){
    res.render('index');
})

function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    req.flash('success','You Must Login First!')
    res.location('/users/login');
    res.redirect('/users/login');
}



module.exports = router;