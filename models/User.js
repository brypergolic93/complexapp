const bcrypt = require('bcryptjs')
const usersCollection = require('../db').db().collection("users")
const validator = require('validator')
const md5 = require('md5')

let User = function(data, getAvatar) {
    // take the data passed in via the parameter, then storing it in this property
    this.userData = data
    this.errors = []
    // In the Post model, if true is passed into user, we run return the get avatar method onto user
    if (getAvatar == undefined) { getAvatar = false } 
    if (getAvatar) {this.getAvatar()}
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
    return new Promise(async (resolve, reject) => {
        if (this.userData.username == "") { this.errors.push("Please provide a username.") }
        if (this.userData.username != "" && !validator.isAlphanumeric(this.userData.username)) { this.errors.push("Username can only contain letters and numbers.")} 
        if (!validator.isEmail(this.userData.email)) { this.errors.push("Please provide a valid e-mail.") }
        if (this.userData.password == "") { this.errors.push("Please provide a password.") }
        if (this.userData.password.length > 0 && this.userData.password.length < 8) { this.errors.push("Password must be at least 8 characters") }
        if (this.userData.password.length > 50) { this.errors.push("Password cannot exceed 50 characters.")}
        if (this.userData.username.length > 0 && this.userData.username.length < 3) { this.errors.push("Username must be at least 3 characters") }
        if (this.userData.username.length > 30) { this.errors.push("Username cannot exceed 30 characters.")}
        
        // Check to see if username is taken
        if (this.userData.username.length > 2 && this.userData.username.length < 31 && validator.isAlphanumeric(this.userData.username)) {
            let usernameExists = await usersCollection.findOne({username: this.userData.username})
            if (usernameExists) {this.errors.push("That username is already taken.")}
        }
    
        // Check to see if email is taken
        if (validator.isEmail(this.userData.email)) {
            let emailExists = await usersCollection.findOne({email: this.userData.email})
            if (emailExists) {this.errors.push("That email is already being used.")}
        }

        resolve()

    })
}

User.prototype.login = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        usersCollection.findOne({username: this.userData.username}).then((attemptedUser) => {
            if (attemptedUser && bcrypt.compareSync(this.userData.password, attemptedUser.password)) {
                this.userData = attemptedUser
                this.getAvatar()
                resolve("Congrats!")
            } else {
                reject("Invalid username or password.")
            }
        }).catch(function() {
            reject("Database server is down. Please try again later.")
        })
    })
}

// this reduces duplication when using a bunch of objects that need a method
User.prototype.register = function() {
    return new Promise(async (resolve, reject) => {
        // Step #1: Validate user data
        this.cleanUp()
        await this.validate()
    
        // Step #2: Only if there are no validation data, save the user into a user database
        if (!this.errors.length) {
            // hash user password
            let salt = bcrypt.genSaltSync(10)
            this.userData.password = bcrypt.hashSync(this.userData.password, salt)
            await usersCollection.insertOne(this.userData)
            this.getAvatar()
            resolve()
        } else {
            // user data was not validated, reject the promise
            reject(this.errors)
        }        
    })
}

User.prototype.getAvatar = function() {
    this.avatar = `https://gravatar.com/avatar/${md5(this.userData.email)}?s=128`
}

module.exports = User