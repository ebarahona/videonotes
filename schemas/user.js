var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	googleId: String
  , username: String
  , provider: String
  , accessToken: String
  , refreshToken: String
  , email: String
  , displayName: String
});

module.exports = UserSchema;
