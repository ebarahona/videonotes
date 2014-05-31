
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Play n Note - Watch · Note · Share', signin: 'Please sign in' }); //original line
};