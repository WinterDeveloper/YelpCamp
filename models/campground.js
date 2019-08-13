//schema setup
var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
var Comment = require("./comment");
var Review = require("./review"); 

var campgroundSchema = new mongoose.Schema({
  name: String,
  price: {
    type: Number,
    default: 0
  },
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
      ref: "User",
      autopopulate: true
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
  ],
  click_nums: {
    type: Number,
    default: 0
  }
});

campgroundSchema.plugin(mongoosePaginate);
campgroundSchema.index({ geometry: '2dsphere' });
campgroundSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model("Campground", campgroundSchema);
