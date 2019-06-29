//all middleware goes here
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
  if(req.isAuthenticated()) {//whether logged in
    Campground.findById(req.params.id, function(err, foundCampground) {
      if(err) {
        req.flash("error", "Campground not found");
        res.redirect("back");
      } else {
        //does user own the campground
        // foundCampground.author.id:mongoose object
        //req.user.id : string
        if(foundCampground.author.id.equals(req.user.id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You do not have permission to do that!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to log in to do that!!!");
    res.redirect("/login");
  }
};


middlewareObj.checkCommentOwnership = function(req, res, next) {
  if(req.isAuthenticated()) {//whether logged in
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if(err) {
        console.log(err);
        res.redirect("back");
      } else {
        //does user own the campground
        // foundCampground.author.id:mongoose object
        //req.user.id : string
        if(foundComment.author.id.equals(req.user.id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You do not have permission to do that!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to log in to do that!!!");
    res.redirect("/login");
  }
};

middlewareObj.isLoggedIn = function(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to log in to do that!!!");
  res.redirect("/login");
}

module.exports = middlewareObj;
