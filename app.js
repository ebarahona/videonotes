
/**
 * Module dependencies.
 * req._passport.user._json gives the json format of the user stored in the passport session

 To be able to use a mongolab connection, the client has to be deployed in AWS cloud or heroku with a mongolab add-on. 
 RULE- if the mongolab instance has been created in AWS cloud, you have to connect it frmo a machine in AWS cloud.
connecting it from the macbook (even with login and password) won't work. So, the code has to be ported to an AWS instance first
 */

 //start google API info

//LOCAL INFO

var GOOGLE_CLIENT_ID = "309473016272.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "5RWOQ_dKETyHtRoi8OS9lgfP";
var CALLBACK_URL =  "http://localhost:3000/auth/google/return";
//var API_KEY = "AIzaSyCciggh3go3UwUCZMQ6ILe9C4Oz2EXzGrk";
//var REDIRECT_URL = "http://localhost:3000/oauth2callback";


//heroku deployment info
/*
var GOOGLE_CLIENT_ID = "89641588136.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "IXAl0puPskwAPGk0qVLfidol";
var CALLBACK_URL =  'http://playnnote.herokuapp.com/auth/google/return';
*/

var express = require('express')
  , unirest = require('unirest')
  , routes = require('./routes')
  , dbutils = require('./dbutils')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , util = require('util')
  , passport = require('passport')
  , youtube = require('youtube-feeds')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser(function(user, done) {
  done(null, user); 
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

//this method would avoid node process from getting terminated, but this is not a solution
//process.addListener("uncaughtException", function (err) {
//    console.log("Uncaught exception: " + err);
//});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    //authorizationURL: 'https://accounts.google.com/o/oauth2/auth', //this is the URL presented for getting consent from the user about access to various google apps
    //tokenURL: 'https://accounts.google.com/o/oauth2/token'
  },
    function (accessToken, refreshToken, profile, done) {
      //to handle async verification, call this in a nextTick() ...
      process.nextTick (function() {
        if (profile != null) {
          id = profile.id;
        }
        if (profile.emails != undefined) {
          email = profile.emails[0].value;
        }

        user = User.findOne({ googleId: profile.id }, function(err, user){
          if (err != null || user == null) {
            console.log("New User getting created: ");
            user = User.create({googleId: profile.id, accessToken: accessToken, refreshToken: refreshToken, 
                email: profile.emails[0].value, provider: "google", displayName: profile.displayName},
                  function(err, data) {
                    if (err) {
                      return done(err);
                    }
                  });
          }
        });
        return done(null, user);//this return statements was missing when login was messed up, DO NOT MOVE!
      });
    } 
));


var app = express();
var conn = dbutils(); //you dont get handle to db connections, mongoose manages the connections internally

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser()); 
app.use(express.methodOverride());
app.use(express.session({secret: 'my playnnote'})); //Use a session store

//TODO: Passport login sessions should be saved in a database. 
//These functions should be invoked --
app.use(passport.initialize()); 
app.use(passport.session()); //BEWARE - Uncommenting this leads to call to authenticate in an infinite loop

app.use(app.router); //Use the actual router provided by Express
//app.use(express.csrf()); // ASHISH added newly
app.use(express.static(path.join(__dirname, 'public'))); //serve static files in the public directory

//production settings
//app.set('view cache', true);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



//youtube.httpProtocol = 'https';
  //'https://www.googleapis.com/auth/userinfo.email',
  //'https://www.googleapis.com/auth/youtube',
  //'https://www.googleapis.com/auth/youtube.readonly',
  //'https://www.googleapis.com/auth/youtube.upload'],

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                             'https://www.googleapis.com/auth/userinfo.email'],
                                    }),
    function(req, res) {
      console.log("google authenticate in process? THIS SHOULD NEVER BE SHOWN in console.log");
    });

app.get('/auth/google/return',
  passport.authenticate('google', {failureRedirect: '/' }),
    function(req, res) {
      console.log("redirecting to landing page .. might be slower because of trying to get mongodb connection");
      res.redirect('/');
    });
  
//app.get('/', routes.index);
app.get('/', function (req, res) {
  res.render('index', { title: 'Play-n-Note - Play Videos · Take Notes', signin: 'Please Sign In', user: req.user });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//requests coming to /landing as redirects, so dont do another redirect in here. All the actions to res should be renders
//always make sure that the mongodb connection is open. The logout is closing all the mongodb connections
app.get('/landing', ensureAuthenticated, function (req, res) { 
  var usr; 
  var googleId;
  try {
    usr = req._passport.session.user;
    googleId = usr._conditions.googleId || usr.googleId;
    if (usr != undefined && usr != null) {
      res.render('landing', {googleId: googleId}); 
    }else {
      res.render('/');
    }
  } catch (e) {
    res.render('/');
  }
  
});


var vals = "";
var subHeader = "";

app.post('/submitNote', function(req, res) {
  var str = JSON.stringify(req.body);
  str=str.replace(/[{}]/g,'');
  parms = str.split(',');
  temp = [];
  for (i=0; i<parms.length; i++) {
    temp[i] = parms[i].split(':');
  }
  gId = temp[0][1].replace(/"/g, '').trim();
  vRL = temp[1][1].replace(/"/g, '').trim();
  cmts = temp[2][1].replace(/"/g, '').trim(); 
  noteId = temp[3][1].replace(/"/g, '').trim(); 
  inst = parseFloat(temp[4][1].replace(/"/g, '').trim());   
  ispblc = temp[5][1].trim(); 

  user_note = User_Note.create({googleId : gId, videoURL : vRL, comments : cmts, noteId: noteId,
                                    instant: inst, date: new Date(), ispublic : ispblc}, 
                  function(err, data) {
                    if (err) {
                      return console.log(err);
                    } else {
                      res.writeHead(200, {'content-type': 'text/json' });
                      res.write( JSON.stringify(data) );
                      res.end('\n');
                      console.log("submit comment successful");
                    }
                  }); 
});

app.post('/submitNoteExtn', function(req, res) {
  var str = JSON.stringify(req.body);
  str=str.replace(/[{}]/g,'');
  parms = str.split(',');
  temp = [];
  for (i=0; i<parms.length; i++) {
    temp[i] = parms[i].split(':');
  }
  gId = temp[0][1].replace(/"/g, '').trim();
  gId = gId.substring(1, gId.length-1);
  vRL = temp[1][1].replace(/"/g, '').trim();
  cmts = temp[2][1].replace(/"/g, '').trim(); 
  noteId = temp[3][1].replace(/"/g, '').trim(); 
  inst = parseFloat(temp[4][1].replace(/"/g, '').trim());
  ispblc = temp[5][1].trim(); 
  if (ispblc == "true")
    ispblc = true;
  else
    ispblc = false;

  user_note = User_Note.create({googleId : gId, videoURL : vRL, comments : cmts, noteId: noteId,
                                    instant: inst, date: new Date(), ispublic : ispblc}, 
                  function(err, data) {
                      if (err) {
                          return console.log(err);
                      } else {
                          console.log("got the User_Note created in mongodb");
                          unirest.post('http://localhost:7474/db/data/cypher')
                                  .headers({ 'Accept' : 'application/json', 'Content-Type' : 'application/json' })
                                  .send({ "query" : "MERGE (user: User { user_id : { user_id }}) MERGE (video: Video { video_id : { video_id }}) CREATE (note: Note { text : { text }, created_at : {timestamp}, ispublic : {ispublic}}) MERGE (user)-[:user_video]->(video) MERGE (user)-[un:created_note]->(note) SET un.created_at={timestamp} MERGE (video)-[n:has_note]->(note) SET n.created_at={timestamp}, n.created_by={ user_id }",
                                          "params" : {
                                                      "user_id" : gId,
                                                      "video_id" : vRL,
                                                      "text" : cmts,
                                                      "timestamp" : noteId,
                                                      "ispublic" : ispblc
                                                     }
                                        })
                                  .end(function (response) {
                                        console.log(response.body);
                          });
                      
                      }
                  }); 
});

app.get('/getNotes', function(req, res) {
  
  gId = req.query.googleId.trim();
  vRL = req.query.videoURL.trim();

  user_note = User_Note.find({googleId : gId, videoURL : vRL}, function(err, data) {
                    if (err) 
                      return console.log(err);
                    else{
                      res.writeHead(200, {'content-type': 'text/json' });
                      res.write( JSON.stringify(data) );
                      res.end('\n');
                      console.log("get notes successful");
                    }
                  }); 
});

app.get('/getNotesExtn', function(req, res) {
  
  gId = req.query.googleId.trim();
  gId = gId.substring(1, gId.length-1);
  lId = req.query.lId.trim();
  cId = req.query.cId.trim();
  vRL = cId + "$" + lId;
  timenow = req.query.timenow;
  sortby = req.query.sortby;
  open = req.query.open;
  if (open == null || open == "0")
    open = -1;
  else
    open = 1;

  unirest.post('http://localhost:7474/db/data/cypher')
          .headers({ 'Accept' : 'application/json', 'Content-Type' : 'application/json' })
          .send({ "query" : "MERGE (course : Course { course_id : {course_id}}) MERGE (video: Video { video_id : { video_id }}) MERGE (user : User { user_id: { user_id }}) ON CREATE SET user.notes_public=false MERGE (course)-[:attended_by]-(user) MERGE (course)-[cv:course_video]->(video) ON CREATE SET cv.first_seen={ timestamp } ON MATCH SET cv.last_seen={ timestamp } MERGE (video)-[:is_in_course]->(course) MERGE (user)-[uv:user_video]->(video) SET uv.last_viewed={timestamp} MERGE (video)-[vu:video_user]->(user) SET vu.last_seen_by={user_id} RETURN user",
                  "params" : {
                              "user_id" : gId,
                              "course_id" : cId,
                              "video_id" : vRL,
                              "timestamp" : timenow
                             }
                })
          .end(function (response) {
                console.log(response.body);
                ispublic = false;
                if (response.body.data[0] != null) {
                  ispublic = response.body.data[0][0].data.notes_public;
                }
                var user_note = User_Note.find({googleId: gId, videoURL: vRL}, {}, {skip:0, sort:{instant: open}}, 
                  function(err, data) {
                    if (err) 
                      return console.log(err);
                    else {
                      res.writeHead(200, {'content-type': 'application/json', 'Access-Control-Allow-Origin': 'https://class.coursera.org' });
                      val = JSON.stringify(data);
                      val = val.substring(0, val.length-1);
                      if (val == "[")
                        val = '[{"ispublic":"' + ispublic + '"}]';
                      else
                        val += ',{"ispublic":"' + ispublic + '"}]';
                      res.write(val);
                      res.end('\n');
                    }
                  });
          });
  });

app.get('/reloadNotesExtn', function(req, res) {
  
  gId = req.query.googleId.trim();
  gId = gId.substring(1, gId.length-1);
  lId = req.query.lId.trim();
  cId = req.query.cId.trim();
  vRL = cId + "$" + lId;
  open = parseInt(req.query.open);

  var user_note = User_Note.find({googleId: gId, videoURL: vRL}, {}, {skip:0, sort:{instant: open}}, 
    function(err, data) {
      if (err) 
        return console.log(err);
      else {
        res.writeHead(200, {'content-type': 'application/json', 'Access-Control-Allow-Origin': 'https://class.coursera.org' });
        val = JSON.stringify(data);
        res.write(val);
        res.end('');
      }
    });
  });

app.get('/deleteNoteExtn', function(req, res) {
  
  gId = req.query.gId.trim();
  noteId = parseInt(req.query.noteId.trim());
  vId = req.query.vId.trim();

  unirest.post('http://localhost:7474/db/data/cypher')
          .headers({ 'Accept' : 'application/json', 'Content-Type' : 'application/json' })
          .send({ "query" : " MATCH (v : Video{video_id : { vId }})-[hn:has_note {created_by : { gId }}]->(note : Note{created_at : { noteId }}) MATCH n-[r]-(note) DELETE hn, r , note",
                  "params" : {
                              "gId" : gId,
                              "noteId" : noteId,
                              "vId" : vId
                             }
                })
          .end(function (response) {
                console.log(response.body);
                user_note = User_Note.findOneAndRemove({googleId : gId, noteId: noteId}, 
                  function(err, docs) {
                    if (err) 
                      return console.log(err);
                    else{
                      res.writeHead(200, {'content-type': 'text/plain' });
                      res.write('done');
                      res.end('\n');
                      console.log("delete notes successful");
                    }
                  }); 
          }); 
});

app.get('/deleteNote', function(req, res) {
  
  gId = req.query.gId.trim();
  commentId = parseFloat(req.query.noteId.trim());

  user_note = User_Note.findOneAndRemove({googleId : gId, noteId: commentId}, 
                  function(err, docs) {
                    if (err) 
                      return console.log(err);
                    else{
                      res.writeHead(200, {'content-type': 'text/plain' });
                      res.write('done');
                      res.end('\n');
                      console.log("delete notes successful");
                    }
                  }); 
});

app.get('/toggleVideoNotesExtn', function(req, res) {
  
  uId = req.query.uId.trim();
  vId = req.query.vId.trim();
  open = req.query.open;
  if (open == null || open == "0")
    open = false;
  else
    open = true;
  
  unirest.post('http://localhost:7474/db/data/cypher')
          .headers({ 'Accept' : 'application/json', 'Content-Type' : 'application/json' })
          .send({ "query" : "MATCH (user : User { user_id: { user_id }}) SET user.notes_public=" + open + " MERGE (video : Video { video_id : {video_id} }) MERGE (video)-[n:has_note ]->(nn:Note) ON MATCH SET nn.ispublic=" + open +", n.created_by={user_id}" ,
                  "params" : {
                              "user_id" : uId,
                              "video_id" : vId
                             }
                })
          .end(function (response) {
                console.log(response.body);
                var user_note = User_Note.update({googleId: uId, videoURL: vId}, {ispublic: open}, {multi: true},
                  function(err, data) {
                    if (err) 
                      return console.log(err);
                    else {
                      res.writeHead(200, {'content-type': 'application/json' });
                      val = JSON.stringify(data);
                      res.write(val);
                      res.end('\n');
                    }
                  }); 
          }); 
});

app.get('/toggleNoteExtn', function(req, res) {
  
  uId = req.query.uId.trim();
  noteId = req.query.noteId.trim();
  open = req.query.open;
  if (open == null || open == "0")
    open = false;
  else
    open = true;
  
  unirest.post('http://localhost:7474/db/data/cypher')
          .headers({ 'Accept' : 'application/json', 'Content-Type' : 'application/json' })
          .send({ "query" : "MERGE (note : Note { created_at: { note_id }}) ON MATCH SET note.ispublic=" + open ,
                  "params" : {
                              "note_id" : noteId
                             }
                })
          .end(function (response) {
                console.log(response.body);
                var user_note = User_Note.update({googleId: uId, noteId: noteId}, {ispublic: open}, {multi: false},
                function(err, data) {
                  if (err) 
                    return console.log(err);
                  else {
                    res.writeHead(200, {'content-type': 'application/json' });
                    val = JSON.stringify(data);
                    res.write(val);
                    res.end('\n');
                  }
                });
          }); 
});

app.get('/toggleTimeSortExtn', function(req, res) {
  
  uId = req.query.uId.trim();
  vId = req.query.vId.trim();
  open = req.query.open.trim();
  
  unirest.post('http://localhost:7474/db/data/cypher')
          .headers({ 'Accept' : 'application/json', 'Content-Type' : 'application/json' })
          .send({ "query" : "MERGE (user : User { user_id: { user_id }}) SET user.notes_public=" + open + " MATCH (user)-[uv:user_video]->(video) SET uv.last_viewed={timestamp} RETURN user",
                  "params" : {
                              "user_id" : gId,
                              "course_id" : cId,
                              "video_id" : vRL,
                              "timestamp" : new Date().getTime()
                             }
                })
          .end(function (response) {
                console.log(response.body);
                var user_note = User_Note.find({googleId: gId, videoURL: vRL}, //{ sort: {instant: 1} }, 
                  function(err, data) {
                    if (err) 
                      return console.log(err);
                    else {
                      res.writeHead(200, {'content-type': 'application/json' });
                      val = JSON.stringify(data);
                      res.write(val);
                      res.end('\n');
                    }
                  }); 
          }); 
});

app.get('/getLectureNotesExtn', function(req, res) {
  
  uId = req.query.uId.trim();
  vId = req.query.vId.trim();

  var user_note = User_Note.find({googleId: {'$ne' : uId}, videoURL: vId, ispublic : true}, {}, {skip:0, sort:{noteId: 1}}, 
                    function(err, data) {
                      if (err) 
                        return console.log(err);
                      else {
                        res.writeHead(200, {'content-type': 'application/json', 'Access-Control-Allow-Origin': 'https://class.coursera.org' });
                        val = JSON.stringify(data);
                        res.write(val);
                        res.end('\n');
                      }
                  });
  
/*  unirest.post('http://localhost:7474/db/data/cypher')
          .headers({ 'Accept' : 'application/json', 'Content-Type' : 'application/json' })
          .send({ "query" : "MATCH (video : Video { video_id: { video_id }})-[hn : has_note]->(n:Note{ispublic : true }) WHERE hn.created_by <> {user_id} RETURN n, hn",
                  "params" : {
                              "user_id" : uId,
                              "video_id" : vId
                             }
                })
          .end(function (response) {
                console.log(response.body);
                data = response.body.data;
                entries = data.length;
                val = "{\"values\": [" ;
                for (i=0; i<entries; i++) {
                  val += JSON.stringify(data[i][0].data);
                  val = val.substring(0, val.length-1) + ",";
                  val2 = JSON.stringify(data[i][1].data);
                  val2 = val2.substring(1, val2.length);
                  val += val2;
                  if (i < entries-1)
                    val += ",";
                }
                val += "]}";
                res.writeHead(200, {'content-type': 'text/plain', 'Access-Control-Allow-Origin': 'https://class.coursera.org' });
                res.write(val);
                res.end('\n');
          });
*/
});

app.get('/subscriptions', function (req, res) {
  var usr = req._passport.session.user;
  youtube.user('default', function(err, data) {
    if ( err instanceof Error ) {
        console.log("user error " +  err );
    } else {
        console.log("user log " + data);
        arrs = data;
    }
  }).subscriptions( {accessToken: usr.accessToken}, function(err, data) {
    if ( err instanceof Error ) {
        console.log("subscription  error " +  err );
    } else {
        var subsEntries = data.feed.entry;

        vals = '{"vals":['; //reset the value of vals, else it keeps accumulating
        //console.log("there are %d entries of subscriptions", subsEntries.length)
        for (i = 0; i < subsEntries.length; i++) {
            title = subsEntries[i].title.$t;
            title = title.split(":")[1].trim();
            pic = subsEntries[i].media$thumbnail.url;
            url = 'http://www.youtube.com/channel/' + subsEntries[i].yt$channelId.$t;
            if (i>0)
              vals += ',';
            vals += '{"title": "' + title + '", "pic": "' + pic + '", "url": "' + url + '"}';
        }
        subHeader = data.feed.title.$t;
        vals += '],'
        vals += '"subHeader": "' + subHeader + '",';
        vals += '"googleId": "' + usr.googleId + '"';
        vals += '}';
        res.writeHead(200, {'content-type': 'text/json' });
                      res.write( JSON.stringify(vals));
                      res.end('\n');
                      console.log("subscriptions returned successfully");
    }
  });  
});

app.get('/get_course_videos', function (req, res) {
  cId = req.query.cId.trim();
  var usr = req._passport.session.user;

  Course_Video.find({courseId : cId}).sort({groupId: 1, videoId: 1}).exec(
         function(err, data) {
          if (err) 
            return console.log(err);
          else{
            res.writeHead(200, {'content-type': 'text/json' });
            vals = '{"data": ' + JSON.stringify(data) + ',"googleId": "' + usr.googleId + '"}';
            res.write( vals );
            res.end('\n');
            console.log("got the course videos successfully");
          }
         }); 
});

app.get('/watch_history', function (req, res) {
  var usr = req._passport.session.user;
  youtube.user('default', function(err, data) {
    if ( err instanceof Error ) {
        console.log("user error " +  err );
    } else {
        console.log("user log " + data);
        arrs = data;
    }
  }).watch_history( {accessToken: usr.accessToken}, function(err, data) {
    if ( err instanceof Error ) {
        console.log("subscription  error " +  err );
    } else {
        var subsEntries = data.feed.entry;

        vals = '{"vals":['; //reset the value of vals, else it keeps accumulating
        for (i = 0; i < subsEntries.length; i++) {
            title = subsEntries[i].title.$t;
            title = title.split(":")[0].trim();
            pic = subsEntries[i].media$group.media$thumbnail[0].url
            url = subsEntries[i].media$group.media$player.url;
            
            if (i>0)
              vals += ',';
            vals += '{"title": "' + title + '", "pic": "' + pic + '", "url": "' + url + '"}';
        }
        subHeader = data.feed.title.$t;
        vals += '],'
        vals += '"subHeader": "' + subHeader + '"';
        vals += '}';
        
        res.writeHead(200, {'content-type': 'text/json' });
        res.write(vals);
        res.end('\n');
        console.log("watch history returned successfully");
    }
  });
});




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}
