const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const app = express()

let sessionOptions = session({
    secret: "JavaScipt is fucking sick",
    store: new MongoStore({client: require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
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

app.use(sessionOptions)
app.use(flash())

// use the variable exported in Router
app.use('/', router)

// export the express app
module.exports = app