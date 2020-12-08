const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user');

module.exports = function(passport) {
    //passport local
    passport.use(new localStrategy(async (username, password, done) => {
        //match user
        try {
            let user = await User.findOne({username: username})
            if (!user) {
                return done(null, false, {message: 'User not found!'})
            }

            //match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) throw err;
                if (isMatch) {
                    return done(null, user)
                } else {
                    return done(null, false, {message: 'Password incorect'})
                }
            })
        } catch (err) {
            console.error(err);
        }
    }))


    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })
}