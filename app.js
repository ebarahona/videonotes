
/**
 * Module dependencies.
 * req._passport.user._json gives the json format of the user stored in the passport session
 */

 //start google API info
var GOOGLE_CLIENT_ID = "309473016272.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "0neorTALhqcfKXxa8BT-YLaR";
var API_KEY = "AIzaSyCciggh3go3UwUCZMQ6ILe9C4Oz2EXzGrk";
var REDIRECT_URL = "http://localhost:3000/oauth2callback";


var express = require('express')
  , routes = require('./routes')
  , dbutils = require('./dbutils')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , util = require('util')
  , passport = require('passport')
  , youtube = require('youtube-feeds')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/return',
    authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
    tokenURL: 'https://accounts.google.com/o/oauth2/token'
  },
    function (accessToken, refreshToken, profile, done) {
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
              if (err) return done(err);
              done(null, user);
            });
        } else {
          done(err, user);
        }
      });
    } 
));

passport.serializeUser(function(user, done) {
  done(null, user); 
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

var app = express();
var conn = dbutils();

//module.exports = app;


// all environments
app.set('port', process.env.PORT || 3000);
app.set('host', 'localhost');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser()); //if this is not added, this error is thrown - Cannot read property 'connect.sid' of undefined
app.use(express.methodOverride());
app.use(express.session({secret: 'nodetube'}));

var local_db_name = "local";

//TODO: Passport login sessions should be saved in a database. 
//These functions should be invoked --
app.use(passport.initialize()); 
app.use(passport.session()); //BEWARE - Uncommenting this leads to call to authenticate in an infinite loop


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//production settings
//app.set('view cache', true);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
    

youtube.httpProtocol = 'https';
var vals = "";
var subHeader = "";

app.get('/landing', function (req, res) {
  var usr; 
  try {
    usr = req._passport.session.user
    if (usr != undefined && usr != null) 
      res.render('landing', {googleId: usr.googleId}); 
  } catch (e) {
      res.render('index', { title: 'Sign in · Social Tube1', signin: 'Please sign in' });
  }
  
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

app.get('/getNotes', function(req, res) {
  
  gId = req.query.googleId.trim();
  vRL = req.query.videoURL.trim();

  user_note = User_Note.find({googleId : gId, videoURL : vRL}, 
                  function(err, data) {
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

app.get('/deleteNote', function(req, res) {
  
  gId = req.query.googleId.trim();
  vRL = req.query.videoURL.trim();
  commentId = parseFloat(req.query.noteId.trim());

  user_note = User_Note.findOneAndRemove({googleId : gId, videoURL : vRL, noteId: commentId}, 
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

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                           'https://www.googleapis.com/auth/userinfo.email',
                                           'https://www.googleapis.com/auth/youtube',
                                           'https://www.googleapis.com/auth/youtube.readonly',
                                           'https://www.googleapis.com/auth/youtube.upload'],
                                    successRedirect: '/landing',
                   failureRedirect: '/'}));
app.get('/auth/google/return',
  passport.authenticate('google', {successRedirect: '/landing',
									 failureRedirect: '/'}));
  



app.get('/logout', function(req, res){
  res.clearCookie('connect.sid');
  req.logout();
  res.redirect('/');
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
  res.redirect('/login');
}
