var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Review = require("../models/review");
var middleware = require("../middleware/index");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dgneec7cf', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


router.get("/campgrounds", function(req, res) {
  var noMatch = '';
  if(req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Campground.find({ "name": regex }, function(err, allCampgrounds) {
      if(err) {
        console.log(err);
      } else {
          if(allCampgrounds.length < 1) {
            noMatch = "No matching campground is found, please try again later"
          }
          res.render("campgrounds/index", { campgrounds: allCampgrounds, noMatch: noMatch});
        }
    }); 
  } else {
      Campground.find(function(err, allCampgrounds) {
      if(err) {
        console.log(err);
      } else {
        res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user, noMatch: noMatch});
      }
    });
  }
  
});

//CREATE - add new campground to DB
router.post("/campgrounds", middleware.isLoggedIn, upload.array('image', 4), async function(req, res) {
  // cloudinary.uploader.upload(req.file.path, function(result) {
  // get data from form and add to campgrounds array
    // var name = req.body.name;
    // var image = result.secure_url;
    // var imageId = result.public_id;
    // var desc = req.body.description;
    // var price = req.body.price;
    var author = {
      id: req.user._id,
      username: req.user.username
    }

    req.body.campground.images = [];
    for(const file of req.files) {
      let image = await cloudinary.v2.uploader.upload(file.path);
      req.body.campground.images.push({
        url: image.secure_url,
        public_id: image.public_id
      });
    }
    var newCampground = req.body.campground;
    newCampground.author = author;
    // {price: price, name: name, image: req.body.campground.images, description: desc, author:author};
    // Create a new campground and save to DB
    try {
      await Campground.create(newCampground);
      res.redirect("/campgrounds");
    } catch(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    // Campground.create(newCampground, function(err, newlyCreated){
    //   if(err){
    //       req.flash("error", err.message);
    //       return res.redirect("back");
    //   } else {
    //       //redirect back to campgrounds page
    //       res.redirect("/campgrounds");
    //   }
    // });
  // });
});

router.get("/campgrounds/new", middleware.isLoggedIn, function(req, res) {
  res.render("campgrounds/new");
});

// router.get("/campgrounds/:id", function(req, res) {
//   //find campground with provided id
//   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
//     if(!err) {
//       if(foundCampground) {
//         res.render("campgrounds/show", {campground: foundCampground, currentUser: req.user});
//       }
//     } else {
//       console.log(err);
//     }
//   });
//   //render show template with that campground

// });

router.get("/campgrounds/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
      res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//UPDATE CAMPGROUND ROUTE
// UPDATE CAMPGROUND ROUTE
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res){
    delete req.body.campground.rating;   
    Campground.findById(req.params.id,async function(err, campground){
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            if(req.file) {
              try {
                await cloudinary.v2.uploader.destroy(campground.imageId);
                let result = await cloudinary.v2.uploader.upload(req.file.path);
                campground.imageId = result.public_id;
                campground.image = result.secure_url;
              } catch(err) {
                req.flash("error", err.message);
                return res.redirect("back");
              }
            }
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.price = req.body.campground.price;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});

//DESTROY ROUTES

router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res) {

  Campground.findById(req.params.id, async function(err, foundCampground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
      await cloudinary.v2.uploader.destroy(foundCampground.imageId);
      Comment.remove({"_id": {$in: campground.comments}});
      Review.remove({"_id": {$in: campground.reviews}});
      foundCampground.remove();
      req.flash("success", "campground deleted Successfully!");
      res.redirect("/campgrounds");
    } catch(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    // Campground.deleteOne({_id: req.params.id}, function(err, deletedCampground) {
    //   if(err) {
    //     console.log(err);
    //   } else {
    //     res.redirect("/campgrounds");
    //   }
    // });
  });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
