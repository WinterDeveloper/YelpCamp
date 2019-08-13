require('dotenv').config();
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
// var Review = require("./models/review");
var User = require("./models/user");
const seed = require('./seeds');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
// var FacebookStrategy = require('passport-facebook').Strategy;
// seed();


//require routes
var commentRoutes    = require("./routes/comments"),
    reviewRoutes     = require("./routes/review"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");



app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.locals.moment = require("moment");

//PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());//these two are for local strategy
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://serene-badlands-23395.herokuapp.com/auth/google/campgrounds"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: "/auth/facebook/campgrounds"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));


mongoose.connect("mongodb+srv://admin-siyu:Zsyayh1996@cluster0-9bknb.mongodb.net/postDB", { useNewUrlParser: true });


app.use(bodyParser.urlencoded({extended: true}));
mongoose.set('useCreateIndex', true)

app.set("view engine", "ejs");

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(commentRoutes);
app.use(campgroundRoutes);
app.use(indexRoutes);
app.use(reviewRoutes);


app.listen(process.env.PORT || 3000, function() {
  console.log("YelpCamp Has Started");
});
