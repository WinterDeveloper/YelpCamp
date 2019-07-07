var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");

router.get("/", function(req, res) {
  Campground.find({}, function(err, allCampgrounds) {
    if(err) {
      console.log(err);
    } else {
      res.render("landing", {currentUser: req.user, campgrounds: allCampgrounds});
    }
  });
});

//===========
//AUTH ROUTES
//===========

router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/auth/google/campgrounds',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/campgrounds');
});

router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/campgrounds',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/campgrounds');
  });

//show register form
router.get("/register", function(req, res) {
  res.render("register", {currentUser: req.user});
});
//handle sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar,
  });
  if(req.body.adminCode === process.env.ADMIN_CODE) {
    newUser.isAdmin = true;
  }
  User.register(newUser
  , req.body.password, function(err, user) {
    if(err) {
      req.flash("error", err.message);
      // res.render("register", {currentUser: req.user});
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        req.flash("success", "Welcome to YelpCamp!" + req.body.username);
        res.redirect("/campgrounds");
      });
    }
  });
});

//show login form
router.get("/login", function(req, res) {
  res.render("login", {currentUser: req.user});
});
//handle login logic
router.post("/login", passport.authenticate("local",
    {
      successRedirect: "/campgrounds",
      failureRedirect: "/login"
    }), function(req, res) {

});

//logout ROUTE
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/campgrounds");
});


//USERS PROFILES
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong");
      res.redirect("/campgrounds");
    } else {
      Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds) {
        if(err) {
          req.flash("error", "Something went wrong");
          res.redirect("/campgrounds");
        } else {
          res.render("users/show", {user: foundUser, campgrounds: campgrounds});
        }
      });

    }
  });
});

module.exports = router;
