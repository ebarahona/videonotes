//This class is used to make all the db related calls. It would make connections using mongoose
var mongodb = require('mongodb')
    , mongoose = require('mongoose');

var conn;
//collections would be an array of all model files. The names here are same as the model files
var collections = ["User", "User_Note"];
//var MONGO_CONNECTION = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost/local";

var MONGO_CONNECTION = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://playnnote:H1m4l4y4@ds037358.mongolab.com:37358/courseranotes";

var getConnection = function() {

  console.log("Running mongoose version " + mongoose.version);

  try{
    conn = mongoose.connect(MONGO_CONNECTION, function(err) {
      if (err) 
        throw (err);
    });
  } catch (e) {
    console.log("UNABLE TO CONNECT: " + e);
  }
  console.log("connecting to " + MONGO_CONNECTION);
  loadSchemas();
  testRefDataExists();
}

testRefDataExists = function() {
  Course_Video.find({}).exec(
         function(err, data) {
          if (err) {
            console.log(err);
          }else{
            if (data.length == 0) {
              createRefData();
            }
            console.log("Reference Data already created");
          }
         });
}

createRefData = function() {
  console.log("Starting to create reference data");
  courses = require('./refdata/courses');
  courses.createCourses();  
  course_videos = require('./refdata/course_videos');
  course_videos.createCourseVideos();  
  console.log("... reference data Created!");
}

loadSchemas = function() {
  console.log("about to load schemas");
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
    , extnURL: String
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

  var CourseVideoSchema = new mongoose.Schema({
    courseId: String
    , videoId: Number
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
  console.log("... schemas loaded");
} 



exports = module.exports = getConnection;
