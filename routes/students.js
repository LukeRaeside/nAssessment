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
	dal.queryCollection("Student", {}, {}, function(err, students) {
		res.json({ Status: true, Students: students });
	});
});

/*
 * Retrieves the course info identified by courseid
 */
router.get('/:studentid', function(req, res) {
	var criteria = {
		_id: ObjectID.createFromHexString(req.params.studentid)
	};
	
	dal.queryCollection("Student", criteria, {}, function(err, students) {
		res.json({ Status: true, Student: students[0] });
	});
});

module.exports = router;
