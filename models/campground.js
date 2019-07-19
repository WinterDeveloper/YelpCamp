//schema setup
var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
var Comment = require("./comment");
var Review = require("./review");

var campgroundSchema = new mongoose.Schema({
  name: String,
  price: String,
  images: [{url: String, public_id: String}],
  description: String,
  location: String,
  geometry: {
    type: {
      type: String, 
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  properties: {
    description: String
  },
  // coordinates: Array,
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
  },
  saves: {
    type: Number,
    default: 0
  },
  like: {
    type: Number,
    default: 0
  },
  liking_users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  saving_users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

campgroundSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Campground", campgroundSchema);
