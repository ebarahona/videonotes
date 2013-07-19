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
    , courseId: String
    , noteId : Number
    , comments : String
    , instant: Number
    , date: Date
    , ispublic : Boolean
  });
  mongoose.model('User_Note', UserNoteSchema);
  User_Note = mongoose.model('User_Note');
  module.exports = User_Note; 

  var CourseSchema = new mongoose.Schema({
    courseId: String
    , courseName: String
    , instructor: String
    , provider: String
    , college: String

  });
  mongoose.model('Course', CourseSchema);
  Course = mongoose.model('Course');
  module.exports = Course;
  courses = require('./refdata/courses');
  courses.createCourses();

  var CourseVideoSchema = new mongoose.Schema({
    courseId: String
    , videoId: Number
    , groupId: Number
    , lectureGroup: String
    , videoName: String
    , duration: Number
    , url: String
    , flashSupported: Boolean
    , html5Supported: Boolean
    , format: String //mp4 etc
  });
  mongoose.model('Course_Video', CourseVideoSchema);
  Course_Video = mongoose.model('Course_Video');
  module.exports = Course_Video;
  courses = require('./refdata/course_videos');
  courses.createCourseVideos();
} 


exports = module.exports = getConnection;