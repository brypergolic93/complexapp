const express = require('express')
const app = express()

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