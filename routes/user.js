const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');


//@desc     Registration for user
//@route    POST /user/register
//@access   PUBLIC
router.get('/register', (req, res) => {
    res.render('register',{
        title: 'Register'
    });
});

//@desc     Registration for user
//@route    POST /user/register
//@access   PUBLIC
router.post('/register', async (req, res) => {
    console.log(req.body);
    const {name, email, username, password, passwordConfirmation} = req.body;
    let errors = [];

    //check required fields
    if (!name || !email || !username || !password || !passwordConfirmation) {
        errors.push({msg: 'Please fill in all fields'})
    }
    //check password match
    if (password !== passwordConfirmation) {
        errors.push({msg: 'Password do not match'})
    }
    //password length
    if (password.length <4) {
        errors.push({msg: 'Password should be atleast 6 characters'})
    }

    if (errors.length >0) {
        res.render('register', {
            title: 'Register',
            user: null,
            errors,
            name, 
            email,
            username, 
            password
        })
    } else {
        try {
            let user = await User.findOne({username})
            if (user) {
                //user existe
                errors.push({msg: 'Username is already registered'})
                res.render('register', {
                    title: 'Register',
                    errors,
                    name, 
                    email,
                    username, 
                    password
                })
            } else {
                //new user
                const newUser = new User({
                    name, 
                    email,
                    username, 
                    password,
                    admin: 0
                });

                //encrypt password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        try {
                            newUser.save()
                            req.flash('success_msg', 'You are now registered and can login')
                            res.redirect('/user/login')
                        } catch (err) {
                            console.error(err);
                        }
                    }) 
                })
            }
        } catch (err) {
            console.log(err)
        }
    }
});

//@desc     login for user
//@route    POST /user/login
//@access   PUBLIC
router.get('/login', (req, res) => {
    if (res.locals.user) {
        res.redirect('/');
    }
    res.render('login', {
        title: 'Login'
    });
});

//@desc     login for user
//@route    POST /user/login
//@access   PUBLIC
router.post('/login', async(req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});


//@desc     logout user
//@route    /user/logout
router.get('/logout', (req, res) => {
    // console.log(req.session.cart)
    req.logout();
    req.flash('success_msg', 'You are logged out')
    res.redirect('/user/login');
});


module.exports = router;