const Post = require('../models/Post')

exports.viewCreateScreen = function(req, res) {
    res.render('create-post')
}

exports.create = function(req, res) {
    let post = new Post(req.body, req.session.sessionUser._id)
    post.create().then(function() {
        res.send("New post created")
    }).catch(function(errors) {

        res.send(errors)
    })
}

exports.viewSingle = async function(req, res) {

    try {
        let userPost = await Post.findSingleById(req.params.id, req.visitorId)
        

        res.render('single-post-screen', {post: userPost} )
    } catch {
        
        res.render('404')
    }
}

exports.viewEditScreen = async function(req, res) {
    try {
        let userPost = await Post.findSingleById(req.params.id)
        res.render('edit-post', {post: userPost})
    } catch {
        res.render('404')
    }
}

exports.edit = function(req, res) {
    let userPost = new Post(req.body, req.visitorId, req.params.id)
    userPost.update().then((status) => {

        // the post was successfully updated in the database
        // or user did have permission but there were validation errors

        if (status === "success") {
            
            req.flash("success", "Post successfully updated.")
            req.session.save(function() {
                res.redirect(`/post/${req.params.id}/edit`)
            })
        } else {
            userPost.errors.forEach(function(error) {
                req.flash("errors", error)
            })
            req.session.save(function() {
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }
    }).catch(() => {

       
        // a post with the ID does not exist, or the current visitor is not the post owner
        req.flash("errors", "You do not have permission to performance that action.")
        req.session.save(function() {
            res.redirect("/")
        })
    })
}