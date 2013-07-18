
/*
 * GET home page.
 */

exports.index = function(req, res){
  try {
  	usr = req._passport.session.user;
	if (usr != null && usr != undefined)
		res.render('landing', {googleId: usr.googleId});
	else 
		res.render('index', { title: 'Sign in · Social Tube1', signin: 'Please sign in' });	
  } catch (e) {
    res.render('index', { title: 'Sign in · Social Tube1', signin: 'Please sign in' });	
  }
  //res.render('index', { title: 'Sign in · Social Tube1', signin: 'Please sign in' }); //original line
};