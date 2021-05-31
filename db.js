const dotenv = require('dotenv')
dotenv.config()
const mongodb = require('mongodb')

mongodb.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
    // export the database object we want
    module.exports = client
    console.log("Successfully connected to database.")
    // require the express application
    const app = require('./app')
    // once the database connection is established, open up the express application and listen on the port below
    app.listen(process.env.PORT)
})