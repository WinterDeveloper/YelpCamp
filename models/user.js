var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var findOrCreate = require("mongoose-findorcreate");

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  isAdmin: {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", UserSchema);
