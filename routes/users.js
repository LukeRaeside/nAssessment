var express = require('express'),
	router = express.Router(),
	mongodb = require('mongodb');
var randomstring = require('just.randomstring');
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
 * Retrieves list of Users in the database
 */
router.get('/', function(req, res){
	core.getUsers(function(err, users) {
		if (err) { res.json({ Status: false }); }
		else {
			res.json({ Status: true, Users: users });
		}
	});
});

// Add a new user to the database
router.post('/add', function(req, res) {
	var rs = randomstring(8);
	var user = ""; 
	console.log("------------------------ Beforreeeee");
		console.log(req.body.criteria.user);
		user = req.body.criteria.user;
		user.Key = rs;
		user.Status = "Inactive";
		console.log(user);
		console.log("-------------------------kkk");
	core.registerUser(user, function(err, nu) {
		if (err) { res.json({ Status: false }); }
		else {
			delete nu.Password;
			res.json({ Status: true, data: nu });
		}
	});
});

// Retrieve a user object
router.get('/user/:userid', function(req, res) {
	var userId = req.params.userid;
	
	core.getUser(userId, function(err, user) {
		if (err) {
			res.json({ Status: false, Error: err, Message: "no User found"});
		} else {
			res.json({ Status: true, User: user });
		}
	});
});

// Updates the user record
router.post('/save/:id', function(req, res) {
	var criteria = {
		_id: ObjectID.createFromHexString(req.params.id)
	};
	var setobj = req.body.criteria.user;
	var updObj = { $set: setobj };
	dal.updateRecords("User", criteria, updObj, function(err, result) {
		if (err) { res.json({ Status: false }); }
		else {
			res.json({ Status: true, data: result });
		}
	});
});
//sets activation key

router.post('/activate',function(req,res){
	console.log("iiinnnn  uuuseerrrrrr aacctttiivvatrerrrrr");	
	var ackey = req.body.criteria.ackey;
	console.log("aaaccccccccccaaaatttttttttttttttiiiiibvvvvvvvvvvvvvvvvva"+ackey);
	core.activate(ackey,function(err,result){
	if(err){
		console.log("errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrraaccccctiiii"+err);
		res.json({ Status: false, Error: err, Message: "not activated"});
	}	
	else{
		res.json({ Status: true, User: user });
	}
	})
	
})
//forgot password
router.post('/forgotpassword',function(req,res){
	var fgtpassw = req.body.criteria.fgtpassw;
	core.forgotPassword(fgtpassw,function(err,user){
		if(err){
			console.log("errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrraaccccctiiii"+err);
			res.json({ Status: false, Error: err, Message: "not activated"});
		}
		else{
			res.json({ Status: true, User: user });
		}
	})
})
/*
 * Sets/Clears the IsFaculty flag for the User
 */
router.post('/save/isfaculty/:userId/:flag', function(req, res) {
	var flag = req.params.flag;
	core.recordFacultyFlag(req.params.userId, (flag === "1"), function(err, user) {
		if (err) { res.json({ Status: false, Error: err }); }
		else { res.json({ Status: true, User: user }); }
	});
});

// Sets/Clears the IsStudent flag for the User
router.post('/save/isstudent/:userId/:flag', function(req, res) {
	var flag = req.params.flag;
	core.recordStudentFlag(req.params.userId, (flag === "1"), function(err, user) {
		if (err) { res.json({ Status: false, Error: err }); }
		else { res.json({ Status: true, User: user }); }
	});
});

// Registers the current user as a student to the course
router.post('/registercourse/:courseid', function(req, res) {
	var courseId = req.params.courseid;
	var userId = req.session.user._id.toString();
	
	core.isUserStudent(userId, function(err, result) {
		if (result) {
			core.regsiterUserToCourse(userId, courseId, function(err, user) {
				if (err) { res.json({ Status: false, Error: err }); }
				else { res.json({ Status: true, User: user }); }
			});
		} else {
			res.json({ Status: false, Message:"User is not registered as a Student" });
		}
	});
});

//Registers the provided user as a student to the course
router.post('/registercourse/:courseid/:userid', function(req, res) {
	var courseId = req.params.courseid;
	var userId = req.params.userid;
	
	core.isUserStudent(userId, function(err, result) {
		if (result) {
			core.regsiterUserToCourse(userId, courseId, function(err, user) {
				if (err) { res.json({ Status: false, Error: err }); }
				else { res.json({ Status: true, User: user }); }
			});
		} else {
			res.json({ Status: false, Message:"User is not registered as a Student" });
		}
	});
});

// Retrieves the current user from the session
router.get('/current', function(req, res) {
	if ("undefined" != typeof req.session.user) {
		res.json({ Status: true, User: req.session.user });
	} else {
		res.json({ Status: false, "Message": "No Current User found" });
	}
});

// Logins the user
router.post('/login', function(req, res) {
	core.loginUser(req.body.criteria.userName, req.body.criteria.password, function(err, user) {
		if (err) {
			res.json({ Status: false, "Message": "User Auth failed" });
		} else {
			req.session.user = user;
			res.json({ Status: true, User: user });
		}
	});
});

// Logs out the user and removes the user info from session
router.post('/logout', function(req, res) {
	var sess = req.session;
	delete sess.user;
	res.json({Status: true});
});
module.exports = router;
