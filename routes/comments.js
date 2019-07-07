var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");
//=================
//COMMENTS ROUTE
//=================

//comments index
router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    if(err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground: foundCampground, currentUser: req.user});
    }
  });
});


//all comments for one campground
router.get("/campgrounds/:id/comments", function(req, res) {
  Campground.findById(req.params.id).populate({
    path: "comments",
    options: {sort: {createdAt: -1}}
  }
    ).exec(function(err, foundCampground) {
    if(err) {
      console.log(err);
    } else {
      res.render("comments/index", {campground: foundCampground, currentUser: req.user});
    }
  });
});

router.post("/campgrounds/:id/comments", middleware.isLoggedIn, function(req, res) {
  //lookup campground using //
  Campground.findById(req.params.id, function(err, foundCampground) {
    if(err) {
      console.log(err);
      redirect("/campgrounds");
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if(err) {
          req.flash("error", "Something went wrong!Please try it again later");
          console.log(err);
        } else {
          //add username and id to comments
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          //save comment
          foundCampground.comments.push(comment);
          foundCampground.save();
          req.flash("success", "Successfully added a comment");
          res.redirect("/campgrounds/" + foundCampground._id);
        }
      });
    }
  });
});


//COMMENT EDIT ROUTE
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
  Comment.findById(req.params.comment_id, function(err, foundComment) {
    if(err) {
      res.redirect("back");
    } else {
      res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
    }
  });
});

//COMMENT UPDATE ROUTE
///campgrounds/:id/comments/:comment_id
router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
    if(err) {
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});


//Comment DESTROY ROUTE
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if(err) {
      res.redirect("back");
    } else {
      req.flash("success", "Successfully deleted the comment!");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});


module.exports = router;
