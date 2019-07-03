var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Review = require("../models/review"); 
var middleware = require("../middleware/index");

//=================
//REVIEWS ROUTE
//=================

// Reviews Index
router.get("/campgrounds/:id/reviews", function(req, res) {
	Campground.findById(req.params.id).populate({
		path: "reviews",
		options: {sort: {createdAt: -1}}
	}).exec(function(err, foundCampground) {
		if (err || !foundCampground) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {campground: foundCampground});
	});
});

//render to create new review page
router.get("/campgrounds/:id/reviews/new", middleware.isLoggedIn, middleware.checkReviewExistence, function(req, res) {
	// middleware.checkReviewExistence checks if a user already reviewed the campground, only one review per user is allowed
	Campground.findById(req.params.id, function(err, foundCampground) {
		if(err) {
			req.flash("error", err.message);
            return res.redirect("back");
		}
		res.render("reviews/new", {campground: foundCampground});
	});
});

//reviews create: post req
router.post("/campgrounds/:id/reviews", middleware.isLoggedIn, middleware.checkReviewExistence, function(req, res) {
  console.log(req.body.review);
	Campground.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
		if(err) {
			req.flash("error", err.message);
            return res.redirect("back");
		}
    // var newReview = {rating: Number(req.body.review.rating), text: req.body.review.text};
    // // console.log(newReview);
    // console.log(typeof(Number(req.body.review.rating)));
		Review.create(req.body.review, function(err, createdReview) {
			if(err) {
				req.flash("error", err.message);
            	return res.redirect("back");
			}
		    createdReview.author.id = req.user._id;
            createdReview.author.username = req.user.username;
            createdReview.campground = foundCampground;
            createdReview.save();
            foundCampground.reviews.push(createdReview);
            //calculate campground rating
            // console.log(foundCampground.reviews[0].rating);
            foundCampground.rating = calculateAverage(foundCampground.reviews);
            foundCampground.save();
            //flash message
            req.flash("success", "Successfully added a review");
            res.redirect("/campgrounds/" + foundCampground._id);
		});
	});
});

//edit route
router.get("/campgrounds/:id/reviews/:review_id/edit", middleware.checkReviewOwnership, function(req, res) {
	Review.findById(req.params.review_id, function(err, foundReview) {
		if(err) {
			req.flash("error", err.message);
            return res.redirect("back");
		}
		res.render("reviews/edit", {campground_id: req.params.id, review: foundReview});
	});
});

//review update route: post req
// Reviews Update
router.put("/campgrounds/:id/reviews/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Campground.findById(req.params.id).populate("reviews").exec(function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/campgrounds/' + campground._id);
        });
    });
});

//Review DESTROY ROUTE
router.delete("/campgrounds/:id/reviews/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/campgrounds/" + req.params.id);
        });
    });
});


//helper function: calculate average rating
function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;








