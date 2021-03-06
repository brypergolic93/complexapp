const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markdown = require('marked')
const app = express()
const sanitizeHTML = require('sanitize-html')

let sessionOptions = session({
    secret: "JavaScipt is fucking sick",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})

app.use(sessionOptions)
app.use(flash())

// Middleware. Express will run this before every express before the router
app.use(function(req, res, next) {
    // make our markdown function available from within EJS templates
    // sanitize any HTML input by the user to only allow basic syntax
    res.locals.filterUserHTML = function (content) {
        return sanitizeHTML(markdown(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {}})
    }

    // make all error and success flash messages available from all templates
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")

    // make current user id available on the req object
    if (req.session.sessionUser) {req.visitorId = req.session.sessionUser._id } else {req.visitorId = 0}
    
    // Make user data available to any .ejs files
    res.locals.user = req.session.sessionUser
    
    next()
})

const router = require('./router.js')

// tell express to add user submitted data onto request object
app.use(express.urlencoded({extended: false})) // html form submit
app.use(express.json()) // json data

// Make our public files available
app.use(express.static('public'))

// The first option must be called views because it is an express option, the 2nd argument refers to our folder called views
app.set('views', 'views')
app.set('view engine', 'ejs')


// use the variable exported in Router
app.use('/', router)

// export the express app
module.exports = app