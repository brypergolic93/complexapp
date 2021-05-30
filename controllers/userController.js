const User = require('../models/User')

exports.login = function(req, res) {
    let user = new User(req.body)
    user.login().then(function(result) {
        req.session.sessionUser = {favColor: "blue", username: user.userData.username}
        res.send(result)
    }).catch(function(e) {
        res.send(e)
    })
}

exports.logout = function() {
    
}

exports.register = function(req, res) {
    // new creates a new empty object.
    let user = new User(req.body)
    user.register()
    
    if (user.errors.length) {
        res.send(user.errors)
    } else {
        res.send("Congrats, there are no errors.")
    }
}

exports.home = function(req, res) {
    if (req.session.sessionUser) {
        res.render('home-dashboard', {username: req.session.sessionUser.username})     
    } else {
        res.render('home-guest')
    }
}