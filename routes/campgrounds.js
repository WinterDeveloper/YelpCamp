var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware/index");
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);


router.get("/campgrounds", function(req, res) {
  //get all  campgrounds from db
  // console.log(req.user);
  Campground.find(function(err, allCampgrounds) {
    if(err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
    }
  });
});

router.post("/campgrounds", middleware.isLoggedIn, function(req, res) {
  //get data from form and add to campground array

  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var description = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newCampground = new Campground({name: name, price: price, image: image, description: description, author: author});
  newCampground.save(function(err) {
    if(!err) {
      console.log("successfully added a camp");
      console.log(newCampground);
      res.redirect("/campgrounds");
    } else {
      console.log(err);
    }
  });
  //redirect to Campgrounds page
});

router.get("/campgrounds/new", middleware.isLoggedIn, function(req, res) {
  res.render("campgrounds/new");
});

router.get("/campgrounds/:id", function(req, res) {
  //find campground with provided id
  Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
    if(!err) {
      if(foundCampground) {
        console.log(foundCampground);
        res.render("campgrounds/show", {campground: foundCampground, currentUser: req.user});
      }
    } else {
      console.log(err);
    }
  });
  //render show template with that campground

});

//EDIT CAMPGROUND ROUTE
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
      res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//UPDATE CAMPGROUND ROUTE
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res) {
  //find and update correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
    if(err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
  //redirect somewhere(show page)
});

//DESTROY ROUTES

router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    if(err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      Campground.deleteOne({_id: req.params.id}, function(err, deletedCampground) {
        if(err) {
          console.log(err);
        } else {
          res.redirect("/campgrounds");
        }
      });
    }
  });
});

//middleware


module.exports = router;
