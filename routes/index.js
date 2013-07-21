
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Sign in · Social Tube1', signin: 'Please sign in' }); //original line
};