
exports.createCourses = function() {
  Course.create({
    courseId: 'startup-001'
    , courseName: 'Startup Engineering'
    , instructor: ['Balaji S. Srinivasan', 'Vijay S. Pande']
    , provider: 'Coursera'
    , college: 'Stanford University'
  }, function(err, data) {
              if (err) {
                return console.log('error in createing courses ' + err);
              } else {
                console.log('Refeernce data for courses created successully');
              }
            });  
};