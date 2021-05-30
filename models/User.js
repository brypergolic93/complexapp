const usersCollection = require('../db').collection("users")
const validator = require('validator')

let User = function(data) {
    // take the data passed in via the parameter, then storing it in this property
    this.userData = data
    this.errors = []
}

User.prototype.cleanUp = function() {
    if (typeof(this.userData.username) != "string") {this.userData.username = ""}
    if (typeof(this.userData.email) != "string") {this.userData.email = ""}
    if (typeof(this.userData.password) != "string") {this.userData.password = ""}

    // get rid of any bogus properties
    this.userData = {
        username: this.userData.username.trim().toLowerCase(),
        email: this.userData.email.trim().toLowerCase(),
        password: this.userData.password
    }
}

User.prototype.validate = function() {
    if (this.userData.username == "") { this.errors.push("Please provide a username.") }
    if (this.userData.username != "" && !validator.isAlphanumeric(this.userData.username)) { this.errors.push("Username can only contain letters and numbers.")} 
    if (!validator.isEmail(this.userData.email)) { this.errors.push("Please provide a valid e-mail.") }
    if (this.userData.password == "") { this.errors.push("Please provide a password.") }
    if (this.userData.password.length > 0 && this.userData.password.length < 12) { this.errors.push("Password must be at least 12 characters") }
    if (this.userData.password.length > 100) { this.errors.push("Password cannot exceed 100 characters.")}
    if (this.userData.username.length > 0 && this.userData.username.length < 3) { this.errors.push("Username must be at least 3 characters") }
    if (this.userData.username.length > 30) { this.errors.push("Username cannot exceed 30 characters.")}
}

User.prototype.login = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        usersCollection.findOne({username: this.userData.username}).then((attemptedUser) => {
            if (attemptedUser && attemptedUser.password == this.userData.password) {
                resolve("Congrats!")
            } else {
                reject("Invalid username or password")
            }
        }).catch(function() {
            reject("Database server is down. Please try again later.")
        })
    })
}

// this reduces duplication when using a bunch of objects that need a method
User.prototype.register = function() {
    // Step #1: Validate user data
    this.cleanUp()
    this.validate()

    // Step #2: Only if there are no validation data, save the user into a user database
    if (!this.errors.length) {
        usersCollection.insertOne(this.userData)
    }
}

module.exports = User