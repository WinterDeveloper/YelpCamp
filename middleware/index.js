//all middleware goes here
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");
var User = require("../models/user");
var passport = require('passport');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

var middlewareObj = {};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); 
  //$&表示整个被匹配的字符串
}

middlewareObj.checkIfEmailOrUsernameExists = async function(req, res, next) {
  let userExists = await User.findOne({email: req.body.email});
  if(userExists) {
    console.log(lalala);
    req.flash("error", "This email has been registered, please change an email!");
    return res.redirect("back");
  }
  let usernameExists = await User.findOne({username: req.body.username});
  if(usernameExists) {
    req.flash("error", "This username has been registered, please change one");
    return res.redirect("back");
  }
  next();
};

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

middlewareObj.checkProfileOwnership = function(req, res, next) {
  if(req.isAuthenticated()) {
    User.findById(req.params.id, function(err, foundUser) {
      if(err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        if(foundUser._id.equals(req.user._id) || req.user.isAdmin) {
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

middlewareObj.isValidPassword = function(req, res, next) {
  if(req.isAuthenticated()) {
    User.findById(req.params.id, async function(err, foundUser) {
      if(err) {
        req.flash("error", "Campground not found.");
        return res.redirect("back");
      }
      if(foundUser._id.equals(req.user._id) || req.user.isAdmin) {
        const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);
        if(user) {
          res.locals.user = user;
          next();
        } else {
          req.flash("error", "Incorrect Password.");
          return res.redirect("back");
        }
      } else {
        req.flash("error", "You have no permission to do that.");
        return res.redirect("back");
      }
    });
  } else {
    req.flash("error", "You need to login first.");
    res.redirect("back");
  }
};

middlewareObj.changePassword = async function(req, res, next) {
  let newPassword = req.body.newPassword;
  let passwordConfirmation = req.body.passwordConfirmation;
  if(newPassword && passwordConfirmation) {
    if(newPassword === passwordConfirmation) {
      const { user } = res.locals;
      let update = await user.setPassword(newPassword);
      user.save();
      next();
    } else {
      req.flash("error", "New passwords must match.");
      return res.redirect("back");
    }
  } else {
    next();
  }
};


middlewareObj.isLoggedIn = function(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to log in to do that!!!");
  res.redirect("/login");
}

middlewareObj.searchAndFilterCampgrounds = async function(req, res, next) {
  const queryKeys = Object.keys(req.query);//an array
  // {
  //   search: 'breakfast',
  //   location: 'california',
  //   price: {
  //     min: 300,
  //     max: 900
  //   }
  // }
  /* 
    check if queryKeys array has any values in it
    if true then we know that req.query has properties
    which means the user:
    a) clicked a paginate button (page number)
    b) submitted the search/filter form
    c) both a and b
  */
  if(queryKeys.length) {
    const dbQueries = [];
    let { search, price, avgRating, location, distance } = req.query;
    if (search) {
      search = new RegExp(escapeRegExp(search), 'gi');//escape strange chars
      // create a db query object and push it into the dbQueries array
      // now the database will know to search the name, description, and location
      // fields, using the search regular expression
      dbQueries.push({ $or: [
        { name: search },
        { description: search },
        { location: search },
        { author: { username: search } }
      ]});
    }
    if (location) {
      // geocode the location to extract geo-coordinates (lat, lng)
      let coordinates;
      try {
        location = JSON.parse(location);//if it is an array for lng and alt
        coordinates = location;
      } catch(err) {
        const response = await geocodingClient.
        forwardGeocode({
          query: location,
          limit: 1
        })
        .send();
        coordinates = response.body.features[0].geometry.coordinates;
      }
      let maxDistance = distance || 25;
      //convert distance to meters
      maxDistance *= 1609.34;
      dbQueries.push({
        geometry: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: maxDistance
          }
        }
      });
    }
    if (price) {
      /*
        check individual min/max values and create a db query object for each
        then push the object into the dbQueries array
        min will search for all post documents with price
        greater than or equal to ($gte) the min value
        max will search for all post documents with price
        less than or equal to ($lte) the min value
      */
      if (price.min) dbQueries.push({ price: { $gte: price.min } });
      if (price.max) dbQueries.push({ price: { $lte: price.max } });
    }
    if (avgRating) {
      // create a db query object that finds any post documents where the avgRating
      // value is included in the avgRating array (e.g., [0, 1, 2, 3, 4, 5])
      dbQueries.push({ rating: { $in: avgRating } });
    }
    // pass database query to next middleware in route's middleware chain
    // which is the postIndex method from /controllers/postsController.js
    res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};
  }
  res.locals.query = req.query;
  // build the paginateUrl for paginatePosts partial
  // first remove 'page' string value from queryKeys array, if it exists
  queryKeys.splice(queryKeys.indexOf('page'), 1);
  const delimiter = queryKeys.length ? '&' : '?';
  // build the paginateUrl local variable to be used in the paginatePosts.
  res.locals.paginateUrl = req.originalUrl.replace(/(\?|\&)page=\d+/g, '') + `${delimiter}page=`;
  // move to the next middleware (postIndex method)
  // console.log(res.locals.paginateUrl);
  next();
}



























// pagination part


module.exports = middlewareObj;
