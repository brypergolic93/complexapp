const Post = require('../models/Post')

exports.viewCreateScreen = function(req, res) {
    res.render('create-post')
}

exports.create = function(req, res) {
    let post = new Post(req.body, req.session.sessionUser._id)
    post.create().then(function(newId) {
        req.flash("success", "New post successfully created.")
        req.session.save(() => res.redirect(`/post/${newId}`))
    }).catch(function(errors) {
        errors.forEach(errors => req.flash("errors", error))
        req.session.save(() => res.redirect("/create-post"))
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

        if (userPost.authorId == req.visitorId) {
            res.render('edit-post', {post: userPost})
        } else {
            req.flash("errors", "You do not have permission to perform that action.")
            // save session data
            req.session.save(() => res.redirect('/'))
        }
    } catch {
        res.render('404')
    }
}

exports.viewEditScreen = async function(req, res) {
    try {
      let userPost = await Post.findSingleById(req.params.id, req.visitorId)
      if (userPost.isVisitorOwner) {
        res.render("edit-post", {post: userPost})
      } else {
        req.flash("errors", "You do not have permission to perform that action.")
        req.session.save(() => res.redirect("/"))
      }
    } catch {
      res.render("404")
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
                res.redirect(`/post/${req.params.id}`)
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

exports.delete = function(req, res) {
    Post.delete(req.params.id, req.visitorId).then(() => {
        req.flash("success", "Post successfully deleted.")
        req.session.save(() => res.redirect(`/profile/${req.session.sessionUser.username}`))
    }).catch(() => {
        req.flash("errors", "You do not have permission to perform that action.")
        req.session.save(() => res.redirect("/"))
    })
}