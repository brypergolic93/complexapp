const User = require('../models/User')

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
        res.render('home-dashboard', {username: req.session.sessionUser.username, avatar: req.session.sessionUser.avatar})     
    } else {
        res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')})
    }
}