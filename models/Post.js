const postsCollection = require('../db').db().collection('posts')
const ObjectID = require('mongodb').ObjectID

let Post = function(data, userid) {
    this.formData = data 
    this.errors = []
    this.sessionUserId = userid
}

Post.prototype.cleanUp = function() {
    if (typeof(this.formData.title) != "string") {this.data.title = ""}
    if (typeof(this.formData.body) != "string") {this.data.body = ""}
    
    // get rid of bogus properties
    this.formData = {
        title: this.formData.title.trim(),
        body: this.formData.body.trim(),
        createdDate: new Date(),
        author: ObjectID(this.sessionUserId)
    }


}

Post.prototype.validate = function() {
    if (this.formData.title == "") {this.errors.push("Please provide a title.")}
    if (this.formData.body == "") {this.errors.push("Please enter post content.")}
}


Post.prototype.create = function() {
    return new Promise((resolve, reject) => {
        
        this.cleanUp()
        this.validate()

        if (!this.errors.length) {
            // Save post into database
            postsCollection.insertOne(this.formData).then(() => {
                resolve()
            }).catch(() => {
                this.errors.push("Database server is down. Please try again later.")
            })
        } else {
            reject(this.errors)
        }
    })
        
}

Post.findSingleById = function(id) {
    return new Promise(async function(resolve, reject) {
        if (typeof(id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }
        let post = await postsCollection.findOne({_id: new ObjectID(id)})
        if (post) {
            resolve(post)
        } else {
            reject()
        }
    })
}

module.exports = Post