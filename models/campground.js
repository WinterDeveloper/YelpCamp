//schema setup
var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
var Comment = require("./comment");
var Review = require("./review");

var campgroundSchema = new mongoose.Schema({
  name: String,
  price: String,
  images: [{url: String, public_id: String}],
  // imageId: String,
  description: String,
  location: String,
  coordinates: Array,
  // lat: Number,
  // lng: Number,
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  rating: {
    type: Number,
    default: 0
  }
});

campgroundSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Campground", campgroundSchema);
