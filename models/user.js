var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var findOrCreate = require("mongoose-findorcreate");

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  // avatar: String,
  // avatar: [{url: String, public_id: String}],
  avatar: {
    secure_url: {type: String, default: "https://cdn.pixabay.com/photo/2016/04/01/11/29/avatar-1300370__480.png"},
    public_id: String
  },
  firstName: String,
  lastName: String,
  email: String,
  bio: String,
  isAdmin: {type: Boolean, default: false},
  saves: [
 	{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campground"
 	}
  ]
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", UserSchema);
