var mongoose = require("mongoose");

var reviewSchema = new mongoose.Schema({
	rating: {
		type: Number,
		required: "Please provide a rating (1-5 stars).",
		min: 1,
		max: 5,
		validation: {
			validator: Number.isInteger,
			message: "{VALUE} is not an integer value."
		}
	},
	text: String,
	author: {
    	id: {
      		type: mongoose.Schema.Types.ObjectId,
      		ref: "User"
    	},
    	username: String,
      avatar: String
    // 	avatar: {
    // 		secure_url: {type: String, default: "https://cdn.pixabay.com/photo/2016/04/01/11/29/avatar-1300370__480.png"},
    // 		public_id: String
  		// },
  	},
  	campground: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground"
    }
}, {
	timestamps: true
});

module.exports = mongoose.model("Review", reviewSchema);
