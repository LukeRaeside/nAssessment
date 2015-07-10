var express = require('express'),
	mongodb = require('mongodb');
var router = express.Router();
var ObjectID = mongodb.BSONPure.ObjectID;

var dal = null,
	log = null,
	core = null;

// middleware specific to this router
router.use(function (req, res, next) {
	dal = req.dal;
	log = req.log;
	core = req.core;
	
	next();
});

/*
 * Retrieves all the coruses in the database
 */
router.get('/', function(req, res) {
	dal.queryCollection("Course", {}, {}, function(err, courses) {
		res.json({ Status: true, Courses: courses });
	});
});

/*
 * Retrieves the course info identified by courseid
 */
router.get('/get/:courseid', function(req, res) {
	var criteria = {
		_id: ObjectID.createFromHexString(req.params.courseid)
	};
	
	dal.queryCollection("Course", criteria, {}, function(err, courses) {
		res.json({ Status: true, Courses: courses });
	});
});

// Retrieves the students registered for the requested course
router.get('/:courseid/students', function(req, res) {
	core.getCourseStudents(req.params.courseid, function(err, students) {
		if (err) {
			res.json({ Status: false, Message:"Unknown Error" });
		} else {
			res.json({ Status: true, Students: students });
		}
	});
});

router.post('/save', function(req, res) {
	var course = req.body.criteria.course;
	var user = req.session.user;
	var facultyId=user._id.toString();
	var coursenew={
			Name:course.Name,
			FacultyId:facultyId,
			StartDate:course.StartDate,
			EndDate:course.EndDate
	}
	if (course._id) {
	} else {
		core.isUserFaculty(facultyId, function(err, isFaculty) {
			if (!isFaculty) { res.json({Status:false, Messgae:"User is not a faculty"}); }
			else {
				core.createNewCourse(coursenew, function(err, newCourse) {
					if (err) {
						res.json({Status: false, Message: "Failed to create Course", Error: err});
					} else {
						res.json({Status: true, Course: newCourse});
						//get updated user record from db and save in req.session.user
						core.getUpdatedUserInfo(facultyId, function(err, user) {
							req.session.user = user;
						});
					}
				});
			}
		});
	}
});

/*
 * Retrieves the list of courses I offer as a faculty
 */
router.get('/igive', function(req, res) {
	var user = req.session.user;
	facultyId = user._id
	/*if (user.IGive) {
		var igive = [];
		user.IGive.forEach(function(id1) {
			igive.push(ObjectID.createFromHexString(id1));
		});*/
	core.getUpdatedUserInfo(facultyId, function(err, user) {
		if (user.IGive) {
			var igive = [];
			user.IGive.forEach(function(id1) {
				igive.push(ObjectID.createFromHexString(id1));
			});
			core.getCourses(igive, {view:"faculty"}, function(err, courses) {
				res.json({ Status: true, Courses: courses });
			});
		}
		else {
			res.json({ status: true, Courses: [] });
		}
	})
		
	/**/
});

/*
 * Retrieves the list of course I amd registered as a Student
 */
router.get('/itake', function(req, res) {
	var user = req.session.user;
	if (user.ITake) {
		var itake = [];
		user.ITake.forEach(function(id1) {
			itake.push(ObjectID.createFromHexString(id1));
		});
		core.getCourses(itake, {view:"student"}, function(err, courses) {
			res.json({ Status: true, Courses: courses });
		});
	} else {
		res.json({ Status: true, Courses: [] });
	}
});

router.get('/forms/:courseid', function(req, res) {
	core.getCourseForms(req.params.courseid, function(err, forms) {
		if (err) { res.json({Status: false}); }
		else { res.json({ Status: true, CourseForms: forms }); }
	});
});

module.exports = router;
