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
        let userPost = await Post.findSingleById(req.params.id)
        res.render('single-post-screen', {post: userPost} )
    } catch {
        
        res.render('404')
    }
}