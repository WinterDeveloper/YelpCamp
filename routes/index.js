var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Campground = require("../models/campground");
var middlewareObj = require("../middleware/index");
var passport = require('passport');
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

const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

//SHOW REGISTER FORM
router.get("/register", function(req, res) {
  res.render("register", {currentUser: req.user});
});
//HANDLE RESGITER POST
router.post("/register", middlewareObj.checkIfEmailOrUsernameExists, upload.single('avatar'), async function(req, res) {

  var newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    bio: req.body.bio,
    email: req.body.email,
    campgrounds: []
  });
  if(req.file) {
    let avatar = await cloudinary.v2.uploader.upload(req.file.path);
    newUser.avatar = {
      secure_url: avatar.secure_url,
      public_id: avatar.public_id
    }
  }
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
        req.flash("success", "Welcome to YelpCamp! " + req.body.username);
        res.redirect("/campgrounds");
      });
    }
  });
});

//SHOW LOGIN FORM
router.get("/login", function(req, res) {
  res.render("login", {currentUser: req.user});
});
//HANDLE LOGIN POST
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
  User.findById(req.params.id).populate("campgrounds").populate("saves").exec(function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong");
      res.redirect("/campgrounds");
    } else {
      Campground.find().where("author.id").equals(foundUser._id).limit(4).sort({createdAt: -1}).exec(function(err, campgrounds) {
        if(err) {
          req.flash("error", "Something went wrong");
          res.redirect("/campgrounds");
        } else {
          res.render("users/show", {user: foundUser, campgrounds: campgrounds, saves: foundUser.saves});
        }
      });
    }
  });
});

//EDIT PROFILE
router.get("/users/:id/edit", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong");
      return res.redirect("/campgrounds");
    }
    res.render("users/edit", {user: foundUser});
  });
});

router.put("/users/:id", upload.single('avatar'), middlewareObj.isValidPassword, middlewareObj.changePassword, async function(req, res) {
  User.findById(req.params.id).populate("campgrounds").populate("saves").exec(async function(err, foundUser) {
    if(err) {
      req.flash("error", "Something went wrong");
      res.redirect("/campgrounds");
    } else {
      if(req.body.username) {
        foundUser.username = req.body.username;
      }
      if(req.body.email) {
        foundUser.email = req.body.email;
      }
      if(req.body.bio) {
        foundUser.bio = req.body.bio;
      }
      if(req.file) {
        if(foundUser.avatar.public_id) {
          await cloudinary.v2.uploader.destroy(foundUser.avatar.public_id);
        }
        let avatar = await cloudinary.v2.uploader.upload(req.file.path);
        foundUser.avatar.secure_url = avatar.secure_url;
        foundUser.avatar.public_id = avatar.public_id;
      }
      await foundUser.save();
      Campground.find().where("author.id").equals(foundUser._id).limit(4).sort({createdAt: -1}).exec(function(err, campgrounds) {
        if(err) {
          req.flash("error", "Something went wrong");
          res.redirect("/campgrounds");
        } else {
          req.flash("success", "Profile has been updated Successfully");
          res.redirect("/users/" + req.params.id);
        }
      });
    }
  });

});
// router.put("/users/:id", middlewareObj.isValidPassword, middlewareObj.changePassword, async function(req, res) {


  // User.findById(req.params.id).populate("campgrounds").populate("saves").exec(async function(err, foundUser) {
  //   if(err) {
  //     req.flash("error", "Something went wrong");
  //     res.redirect("/campgrounds");
  //   } else {
  //     console.log(req.body);
  //     console.log(req.file);
  //     if(req.body.username) {
  //       foundUser.username = req.body.username;
  //     }
  //     if(req.body.email) {
  //       foundUser.email = req.body.email;
  //     }
  //     if(req.body.bio) {
  //       foundUser.bio = req.body.bio;
  //     }
  //     await foundUser.save();
  //     Campground.find().where("author.id").equals(foundUser._id).limit(4).sort({createdAt: -1}).exec(function(err, campgrounds) {
  //       if(err) {
  //         req.flash("error", "Something went wrong");
  //         res.redirect("/campgrounds");
  //       } else {
  //         req.flash("success", "Profile has been updated Successfully");
  //         res.redirect("/users/" + req.params.id);
  //       }
  //     });
  //   }
  // });

// });


router.get("/users/:id/savings", function(req, res) {
  User.findById(req.params.id).populate({
        path: "saves",
        options: {sort: {_id: -1}}
    }).exec(function(err, foundUser) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    const result = paginate(foundUser.saves, 9, req.query.page || 1);
    const totalPage = Math.floor(foundUser.saves.length / 9) + 1;
    res.render("users/saves", {user: foundUser, saveArray: result, page: req.query.page, totalPage: totalPage});
  });
});

router.get("/users/:id/posts", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    Campground.find().where("author.id").equals(req.params.id).sort({createdAt: -1}).exec(function(err, campgrounds) {
      if(err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      const result = paginate(campgrounds, 9, req.query.page || 1);
      const totalPage = Math.floor(campgrounds.length / 9) + 1;
      res.render("users/posts", {user: foundUser, posts: result, page: req.query.page, totalPage: totalPage, campgrounds: campgrounds});
    });  
  });
});

router.get("/forgot-password", function(req, res) {
  res.render("users/forgot");
});

router.put("/forgot-password", async function(req, res) {
  const token = await crypto.randomBytes(20).toString('hex');
  const user = await User.findOne({email: req.body.email});
  if(!user) {
    req.flash("error", "There is no account with that email");
    return res.redirect("/forgot-password");
  }
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const msg = {
    to: user.email,
    from: 'New World Admin <ceciliasiyu96@gmail.com>',
    subject: 'New World - Forget Password/Reset',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
          Please click on the following link, or copy and paste it into your browser to complete the process:
          http://${req.headers.host}/reset/${token}
          If you did not request this, please ignore this email and your password will remain unchanged.`,
  };
  await sgMail.send(msg);
  req.flash("success", `An email has been sent to ${user.email} with further instructions`);
  return res.redirect("/campgrounds");
});

router.get("/reset/:token", async function(req, res) {
  const token = req.params.token;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash("error", "Password token is invalid or expired");
    return res.redirect("/forgot-password");
  }
  res.render("users/reset", {token: token});
});

router.put("/reset/:token", async function(req, res) {
  const token = req.params.token;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash("error", "Password token is invalid or expired");
    return res.redirect("/forgot-password");
  }
  if (req.body.password === req.body.confirm) {
    await user.setPassword(req.body.password);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
  } else {
    req.flash("error", "Password does not match!");
    return res.redirect(`/reset/${ token }`);
  }
  const msg = {
    to: user.email,
    from: 'New World Admin <ceciliasiyu96@gmail.com>',
    subject: 'New World - Successfully reset your Password!',
    text:  "You have Successfully updated your password!"
  };
  await sgMail.send(msg);
  req.flash("success", "Successfully updated your password");
  return res.redirect("/login");
});


function paginate (array, page_size, page_number) {
  --page_number; // because pages logically start with 1, but technically with 0
  return array.slice(page_number * page_size, (page_number + 1) * page_size);
}















module.exports = router;
