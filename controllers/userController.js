const User = require('../models/User')

exports.mustBeLoggedIn = function(req, res, next) {
    // Is true if there is an active user session, confirming that the user is logged in
    if(req.session.sessionUser) {
        next()
    } else {
        req.flash("errors", "You must be logged in to perform that action.")
        // save the session data
        req.session.save(function() {
            res.redirect('/')
        })
    }
}

exports.login = function(req, res) {
    let user = new User(req.body)
    user.login().then(function() {
        req.session.sessionUser = {avatar: user.avatar, username: user.userData.username}
        req.session.save(function() {
            res.redirect('/')
        })
    }).catch(function(e) {
        // show the login error to the user
        req.flash('errors', e)
        req.session.save(function() {
            res.redirect('/')
        })
    })
}

exports.logout = function(req, res) {
    req.session.destroy(function() {
        res.redirect('/')
    })
}

exports.register = function(req, res) {
    // new creates a new empty object.
    let user = new User(req.body)
    user.register().then(() => {
        req.session.user = {username: user.userData.username, avatar: user.avatar}
        req.session.save(function() {
            res.redirect('/')
        })
    }).catch((regErrors) => {
        regErrors.forEach(function(error) {
            req.flash('regErrors', error)
        })
        req.session.save(function() {
            res.redirect('/')
        })
    })
}

exports.home = function(req, res) {
    if (req.session.sessionUser) {
        res.render('home-dashboard')     
    } else {
        res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')})
    }
}