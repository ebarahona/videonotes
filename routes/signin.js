/*
This has been added by Ashish to show the bootsrap signin page
*/

var passport = require('passport')
    , GoogleStrategy = require('passport-google').Strategy;

var signin = function(req, res) {
	//res.render('signin');
	console.log("Present in exports.signin");

    passport.use(new GoogleStrategy({
      //returnURL: 'http://' + app.get('host') + ':' + app.get('port') + '/success',
      //realm: 'http://' + app.get('host') + ':' + app.get('port')
      returnURL: 'http://localhost:3000/auth/google/return',
      realm: 'http://localhost:3000'
    },
    function(identifier, profile, done) {
    	res.render('identifier value ' + identifier);
    	console.log('profile value is ' + profile);
      //User.findOrCreate({ openId: identifier }, function(err, user) {
      //  done(err, user);
      //});
    }
    ));
}
module.exports = exports = signin;