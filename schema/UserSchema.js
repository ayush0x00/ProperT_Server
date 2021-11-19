var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  userId: { type: String, unique: true },
  userName: { type: String, unique: true },
  mediaWatch: { type: [String] },
  mediaDetails: { type: [Schema.Types.Mixed] },
  token: { type: String, unique: true },
  expires_in: { type: Integer },
});

module.exports = mongoose.model("User", UserSchema);
