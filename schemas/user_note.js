var mongoose = require('mongoose');

var UserNoteSchema = new mongoose.Schema({
    googleId : String
  , videoURL : String
  , comments : String
  , instant: Number
  , date: Date
  , ispublic : Boolean
});

module.exports = UserNoteSchema;
