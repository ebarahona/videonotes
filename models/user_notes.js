var mongoose = require('mongoose');

var UserNoteSchema = require('../schemas/user_note');

var User_Note = mongoose.model('User_Note', UserNoteSchema);
module.exports = User_Note;
