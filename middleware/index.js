//all middleware goes here
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");

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

//comments part
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


//reviews part
middlewareObj.checkReviewOwnership = function(req, res, next) {
  if(req.isAuthenticated()) {//whether logged in
    Review.findById(req.params.review_id, function(err, foundReview) {
      if(err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        //does user own the campground
        // foundCampground.author.id:mongoose object
        //req.user.id : string
        if(foundReview.author.id.equals(req.user.id) || req.user.isAdmin) {
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

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/campgrounds/" + foundCampground._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
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
