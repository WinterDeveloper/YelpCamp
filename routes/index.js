var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.get("/", function(req, res) {
  res.render("landing", {currentUser: req.user, currentUser: req.user});
});

//===========
//AUTH ROUTES
//===========

//show register form
router.get("/register", function(req, res) {
  res.render("register", {currentUser: req.user});
});
//handle sign up logic
router.post("/register", function(req, res) {
  User.register(new User(
    {
      username: req.body.username
    }
  ), req.body.password, function(err, user) {
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

module.exports = router;
