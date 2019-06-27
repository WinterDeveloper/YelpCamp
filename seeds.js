var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var data = [
  {
    name: "Cloud's Rest",
    image: "https://farm5.staticflickr.com/4101/4961777592_322fea6826.jpg",
    description: "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."
  },
  {
    name: "peaceful town",
    image: "https://farm7.staticflickr.com/6103/6333668591_90e7c2bc72.jpg",
    description: "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from  by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."
  },
  {
    name: "amazing hill",
    image: "https://farm1.staticflickr.com/82/225912054_690e32830d.jpg",
    description: "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from  by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham."
  }
];

function seedDB() {
  Campground.deleteMany({}, function(err) {
    // if(err) {
    //   console.log(err);
    // } else {
    //   console.log("removed campgrounds");
      //add a few campgrounds
      // data.forEach(function(seed) {
      //   Campground.create(seed, function(err, campground) {
      //     if(err) {
      //       console.log(err);
      //     } else {
      //       console.log("added a campground");
      //       Comment.create(
      //         {
      //           text: "This place is pretty good but i wish there is internet",
      //           author: "Homer"
      //         }
      //           , function(err, comment) {
      //         if(err) {
      //           console.log("creating comment fails");
      //         } else {
      //           campground.comments.push(comment);
      //           campground.save();
      //           console.log("create a new comment");
      //         }
      //       });
      //     }
      //   });
      // })
    // }
  });

}

module.exports = seedDB;
