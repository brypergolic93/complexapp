const postsCollection = require('../db').db().collection('posts')
const ObjectID = require('mongodb').ObjectID
const User = require('./User')

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

Post.reusablePostQuery = function(uniqueOperations) {
    return new Promise(async function(resolve, reject) {
        
        let aggOperations = uniqueOperations.concat([
            { $lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
            { $project: {
                title: 1,
                body: 1,
                createdDate: 1,
                author: {$arrayElemAt: ["$authorDocument", 0]}
            }}
        ])
        
        let posts = await postsCollection.aggregate(aggOperations).toArray()

        // Clean up author property in each post object
        posts = posts.map(function(post) {
            post.author = {
                username: post.author.username,
                // create a new instance of the user object, sending true to run the getAvatar function in the User model
                avatar: new User(post.author, true).avatar
            }
            
            return post
        })
        resolve(posts)
    })
}

Post.findSingleById = function(id) {
    
    return new Promise(async function(resolve, reject) {
        
        if (typeof(id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }
        
        let posts = await Post.reusablePostQuery([
            { $match: {_id: new ObjectID(id)} }
        ])
        
        if (posts.length) {
            resolve(posts[0])
        } else {
            reject()
        }
    })
}

Post.findByAuthorId = function(authorId) {
    return Post.reusablePostQuery([
        { $match: {author: authorId} },
        { $sort: {createdDate: -1} }
    ])
}

module.exports = Post