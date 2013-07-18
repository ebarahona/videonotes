//This class is used to make all the db related calls. It would make connections using mongoose
var mongodb = require('mongodb')
    , mongoose = require('mongoose');

var conn;
//collections would be an array of all model files. The names here are same as the model files
var collections = ["User", "User_Note"];

var getConnection = function() {

  console.log("Running mongoose version " + mongoose.version);

  conn = mongoose.connect("mongodb://localhost/local");
  loadSchemas();
}

loadSchemas = function() {
  //console.log("about to load schemas");
  if (conn == null) { //
    conn = getConnection();
  }

  var UserSchema = new mongoose.Schema({
    googleId: String
    , username: String
    , provider: String
    , accessToken: String
    , refreshToken: String
    , email: String
    , displayName: String
  });
  mongoose.model('User', UserSchema);
  User = mongoose.model('User');
  module.exports = User; 

  var UserNoteSchema = new mongoose.Schema({
    googleId : String
    , videoURL : String
    , noteId : Number
    , comments : String
    , instant: Number
    , date: Date
    , ispublic : Boolean
  });
  mongoose.model('User_Note', UserNoteSchema);
  User_Note = mongoose.model('User_Note');
  module.exports = User_Note; 

} 


exports = module.exports = getConnection;