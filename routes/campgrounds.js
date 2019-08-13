var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Review = require("../models/review");
var User = require("../models/user");
var middleware = require("../middleware/index");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
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


// router.get("/campgrounds", function(req, res) {
//   console.log(req.body);
//   var noMatch = '';
//   if(req.query.search) {
//     const regex = new RegExp(escapeRegex(req.query.search), 'gi');
//     Campground.paginate({ "name": regex }, {
//       page: req.query.page || 1,
//       limit: 9,
//       sort: {_id: -1}
//     }, function(err, allCampgrounds) {
//       if(err) {
//         console.log(err);
//       } else {
//           if(allCampgrounds.length < 1) {
//             noMatch = "No matching campground is found, please try again later"
//           }
//           res.render("campgrounds/index", { campgrounds: allCampgrounds, noMatch: noMatch});
//         }
//     }); 
//   } else if(req.query.sort == "click_nums") {
//     Campground.paginate({}, {
//       page: req.query.page || 1,
//       limit: 2,
//       // sort: {_id: -1}
//       sort: {click_nums: -1}
//     }, function(err, result) {
//       res.render("campgrounds/index", {mapBoxToken: process.env.MAPBOX_TOKEN, campgrounds: result, currentUser: req.user, noMatch: noMatch});
//     });
//   } else {
//     Campground.paginate({}, {
//       page: req.query.page || 1,
//       limit: 9,
//       sort: {_id: -1}
//     }, function(err, result) {
//       res.render("campgrounds/index", {mapBoxToken: process.env.MAPBOX_TOKEN, campgrounds: result, currentUser: req.user, noMatch: noMatch});
//     });
//   }
  
// });

// router.get("/campgrounds", middleware.searchAndFilterCampgrounds ,async function(req, res) {
//   const { dbQuery } = res.locals;
//   delete res.locals.dbQuery;
//   let campgrounds = await Campground.paginate(dbQuery, {
//     page: req.query.page || 1,
//     limit: 36,
//     sort: {_id: -1}
//   });
//   campgrounds.page = Number(campgrounds.page);
//   if(!campgrounds.docs.length && res.locals.query) {
//     res.locals.error = 'No result match that query!';
//   }
//   let title = "Campground Index";
//   res.render("campgrounds/index", {mapBoxToken: process.env.MAPBOX_TOKEN, campgrounds: campgrounds, currentUser: req.user, title: title});
// });

router.get("/campgrounds", middleware.searchAndFilterCampgrounds ,async function(req, res) {
  const { dbQuery } = res.locals;
  delete res.locals.dbQuery;
  let campgrounds = await Campground.paginate(dbQuery, {
    page: req.query.page || 1,
    limit: 36,
    sort: {_id: -1}
  }); 
  campgrounds.page = Number(campgrounds.page);
  if(!campgrounds.docs.length && res.locals.query) {
    res.locals.error = 'No result match that query!';
  }
  let title = "Campground Index";
  res.render("campgrounds/index", {mapBoxToken: process.env.MAPBOX_TOKEN, campgrounds: campgrounds, currentUser: req.user, title: title});
});

//CREATE - add new campground to DB
router.post("/campgrounds", middleware.isLoggedIn, upload.array('image', 9), async function(req, res) {
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
    var newCampground = new Campground(req.body.campground);
    newCampground.author = author;
    let response = await geocodingClient.forwardGeocode({
      query: req.body.campground.location,
      limit: 1
    })
    .send();
    newCampground.geometry = response.body.features[0].geometry;
    newCampground.price = Number(req.body.campground.price);
    newCampground.properties.description = `<strong><a href="/campgrounds/${newCampground._id}">${req.body.campground.name}</a></strong><p>${newCampground.location}</p><p>${newCampground.description.substring(0, 20)}...</p>`;
    try {
      let createdCampground = await Campground.create(newCampground);
      var path = "/campgrounds/" + createdCampground._id;
      res.redirect(path);
    } catch(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
});

router.get("/campgrounds/new", middleware.isLoggedIn, function(req, res) {
  res.render("campgrounds/new");
});

router.get("/campgrounds/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id)
    .populate({
        path: "comments",
        options: {sort: {createdAt: -1}}
    })
    .populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            foundCampground.click_nums += 1;
            if(req.user) {
              var has_like = false;
              var has_save = false;
              var foundUserLike = foundCampground.liking_users.some(function (user) {
                return user._id.equals(req.user._id);
              });
              var foundUserSave = foundCampground.saving_users.some(function (user) {
                return user._id.equals(req.user._id);
              });
              return res.render("campgrounds/show", {
                campground: foundCampground,
                foundUserLike: foundUserLike,
                foundUserSave: foundUserSave,
              });
            }
            foundCampground.save();
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
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, upload.array('image', 9), function(req, res){
    delete req.body.campground.rating;   
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            if(req.body.deleteImages && req.body.deleteImages.length > 0) {
              let deleteImages = req.body.deleteImages;
              for(const public_id of deleteImages) {
                await cloudinary.v2.uploader.destroy(public_id);
                for(const image of campground.images) {
                  if(image.public_id === public_id) {
                    let index = campground.images.indexOf(image);
                    campground.images.splice(index, 1);
                  }
                }
              }
            }

            if(req.files) {
              for(const file of req.files) {
                let image = await cloudinary.v2.uploader.upload(file.path);
                await campground.images.push({
                  url: image.secure_url,
                  public_id: image.public_id
                });
              }
            }
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.price = Number(req.body.campground.price);
            if(req.body.campground.location !== campground.location) {
              let response = await geocodingClient.forwardGeocode({
                query: req.body.campground.location,
                limit: 1
              })
              .send();
              campground.geometry = response.body.features[0].geometry;
              campground.location = req.body.campground.location;
            }
            campground.properties.description = `<strong><a href="/campgrounds/${campground._id}">${req.body.campground.name}</a></strong><p>${campground.location}</p><p>${campground.description.substring(0, 20)}...</p>`;
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
      let images = foundCampground.images;
      if(images) {
        for(const image of images) {
          await cloudinary.v2.uploader.destroy(image.public_id);
        }
      }
      if(foundCampground.comments) {
        foundCampground.comments.remove();
      }
      if(foundCampground.reviews) {
        foundCampground.reviews.remove();
      }
      await foundCampground.remove();
      req.flash("success", "campground deleted Successfully!");
      res.redirect("/campgrounds");
    } catch(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
  });
});

router.post("/campgrounds/:id/save", function(req, res) {
  if(!req.isAuthenticated()) {
    return res.send(JSON.stringify({
     "status": "fail",
     "msg": "user is not loggedin",
    }));
  }
  Campground.findById(req.body.campground_id, function(err, foundCampground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    var foundUserSave = foundCampground.saving_users.some(function (user) {
      return user._id.equals(req.user._id);
    });
    if(foundUserSave) {
      foundCampground.saves--;
      for(var i = 0;i < foundCampground.saving_users.length;i++) {
        if(foundCampground.saving_users[i].equals(req.user._id)) {
          foundCampground.saving_users.remove(foundCampground.saving_users[i]);
          foundCampground.save();
        }
      }
      User.findById(req.user._id, function(err, foundUser) {
        for(var i = 0;i < foundUser.saves.length;i++) {
          if(foundUser.saves[i].toString() === req.params.id) {
            foundUser.saves.remove(foundUser.saves[i]);
            foundUser.save();
          }
        }
      });
      var num = foundCampground.saving_users.length;
      return res.send(JSON.stringify({
         "status": "success",
         "msg": "收藏",
         "num": num,
      }));
    }
    foundCampground.saves++;
    foundCampground.saving_users.push(req.user);
    foundCampground.save();
    req.user.saves.push(foundCampground);
    req.user.save();
    var num = foundCampground.saving_users.length;
    return res.send(JSON.stringify({
         "status": "success",
         "msg": "已收藏",
         "num": num,
    }));
  });
});


router.post("/campgrounds/:id/like", function(req, res) {
  if(!req.isAuthenticated()) {
    return res.send(JSON.stringify({
     "status": "fail",
     "msg": "user is not loggedin",
    }));
  }
  Campground.findById(req.body.campground_id, function(err, foundCampground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    var foundUserLike = foundCampground.liking_users.some(function (user) {
      return user._id.equals(req.user._id);
    });
    if(foundUserLike) {
      foundCampground.like--;
      for(var i = 0;i < foundCampground.liking_users.length;i++) {
        if(foundCampground.liking_users[i].equals(req.user._id)) {
          foundCampground.liking_users.remove(foundCampground.liking_users[i]);
          foundCampground.save();
        }
      }
      var num = foundCampground.liking_users.length;
      return res.send(JSON.stringify({
         "status": "success",
         "msg": "喜欢",
         "num": num,
      }));
    }
    foundCampground.like++;
    foundCampground.liking_users.push(req.user);
    foundCampground.save();
    var num = foundCampground.liking_users.length;
    return res.send(JSON.stringify({
         "status": "success",
         "msg": "不喜欢",
         "num": num,
    }));
  });
});



function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function paginate (array, page_size, page_number) {
  --page_number; // because pages logically start with 1, but technically with 0
  return array.slice(page_number * page_size, (page_number + 1) * page_size);
}

module.exports = router;
