var encryptor = require('./encryptor.js').Encryptor,
	mongodb = require('mongodb'),
	nodemailer = require('nodemailer');

var ObjectID = mongodb.BSONPure.ObjectID;
var dal = null,
	log = null;

Core = function(da, logger) {
	dal = da;
	log = logger;
};

/*
 * The following set of functions are User specific
 */

// Retrieves the list of users
Core.prototype.getUsers = function(cb) {
	dal.queryCollection("User", {}, {}, function(err, users) {
		if (err) { cb(err, null); }
		else {
			users.forEach(function(user) {
				delete user.Password;
			});
			cb(null, users);
		}
	});
};

// Retrieves a single user
Core.prototype.getUser = function(userId, cb) {
	var criteria = {
		_id: ObjectID.createFromHexString(userId)
	};
	
	dal.queryCollection('User', criteria, {}, function(err, users) {
		if (err) {
			cb(err, null);
			return;
		}
		
		if (users.length == 0) {
			cb({Message: "No user found"}, null);
			return;
		}
		var user = users[0];
		delete user.Students;
		delete user.IGive;
		delete user.ITake;
		delete user.Password;
		
		cb(null, user);
	});
};

//Retrieves the updated user information from database
Core.prototype.getUpdatedUserInfo = function(userId, cb) {
	var criteria = {
		_id: ObjectID.createFromHexString(userId)
	};
	
	dal.queryCollection('User', criteria, {}, function(err, users) {
		if (err) {
			cb(err, null);
			return;
		}
		
		if (users.length == 0) {
			cb({Message: "No user found"}, null);
			return;
		}
		var user = users[0];
		delete user.Password;
		
		cb(null, user);
	});
};

Core.prototype.activate=function(criteria,cb){
	dal.queryCollection('User', criteria, {}, function(err, users) {
		if (err) {
			cb(err, null);
			return;
		}
		
		if (users.length == 0) {
			cb({Message: "No user found"}, null);
			return;
		}
		var user = users[0];
		delete user.Students;
		delete user.IGive;
		delete user.ITake;
		delete user.Password;
		var criteri = {
				_id: user._id
			};
			var setobj = {
				Status:'Active'
			};
			var updObj = { $set: setobj };
			dal.updateRecords("User", criteri, updObj, function(err, result) {
				if (err) { res.json({ Status: false }); }
				else {
					cb(null,result);
				}
			});
		
		//cb(null, user);
	});
	
	
	
};
//forgot password
Core.prototype.forgotPassword = function (fgtpassw,cb){
	var encrypt = new Encryptor();
	var criteria = {
			Name: fgtpassw.Name
		};
	dal.queryCollection('User', criteria, {}, function(err, users) {
		if (err) {
			cb(err, null);
			return;
		}
		
		if (users.length == 0) {
			cb({Message: "No user found"}, null);
			return;
		}
		var user = users[0];
		delete user.Students;
		delete user.IGive;
		delete user.ITake;
		delete user.Password;
		var criteri = {
				_id: user._id
			};
			var setobj = {
					Password: encrypt.encrypt(fgtpassw.Password)
			};
			var updObj = { $set: setobj };
			dal.updateRecords("User", criteri, updObj, function(err, result) {
				if (err) { res.json({ Status: false }); }
				else {
					cb(null,result);
				}
			});
		
		//cb(null, user);
	});
	
	
	
}

// Registers a User
Core.prototype.registerUser = function(user, cb) {
	var encrypt = new Encryptor();
	user.Password = encrypt.encrypt(user.Password);
	
	var criteria = { Name: user.Name };
	var smtpTransport = nodemailer.createTransport("SMTP",{
		service: "Gmail",
		auth: {
		user: "nassessment2015@gmail.com",
		pass: "nassessment1234"
		}
		});
	if (user.IsStudent == "true") { user.IsStudent = true; }
	if (user.IsFaculty == "true") { user.IsFaculty = true; }

	dal.queryCollection("User", criteria, {}, function(err, users) {
		if (users.length == 0) {
			dal.insertIntoCollection("User", user, function(err, users) {
				
				console.log("namaadsfdfsdfsdfdsfsd%%%%%%%%%%%%%%%%%%%%%%%"+users.FirstName);
				console.log(users);
				if (err) { cb(err, null); }
				else {
					var user = users[0];
					console.log("namaadsfdfsdfsdfdsfsd%%%%%%%%%%%%%%%%%%%%%%%"+user.FirstName);
					delete user.Password;
					cb(null, user);
					console.log("useremailuseremailuseremailuseremailuseremail"+user.Email);
					var mailOptions={
							to : user.Email,
							subject : "confirmation mail",
							text : "you have been successfully registered and the activation key is "+user.Key
							}
							console.log(mailOptions);
							smtpTransport.sendMail(mailOptions, function(error, response){
							if(error){
							console.log(error);
							//res.end("error");
							}else{
							console.log("Message sent: " + response.message);
							//res.end("sent");
							}
							});
				}
			});
		} else {
			cb({Message: "User already exist"}, null);
		}
	});
};

// Authenticates the user and returns the user object without the password
Core.prototype.loginUser = function(user, pwd, cb) {
	var encrypt = new Encryptor();
	var criteria = {
		"Name": user,
		"Password": encrypt.encrypt(pwd),
		"Status" : "Active"
	};
	
	dal.queryCollection("User", criteria, {}, function(err, users) {
		if (err) {
			cb(err, null);
			return;
		}

		if (users.length == 1) {
			delete users[0].Password;
			cb(null, users[0]);
		} else {
			cb({"Message": "User Auth failed"}, null);
		}
	});
};

// Sets/Clears the IsFaculty flag for the provided user 
Core.prototype.recordFacultyFlag = function(userId, isFaculty, cb) {
	var criteria = {
		_id: ObjectID.createFromHexString(userId)
	};
	var updateObj = {
		$set: {
			IsFaculty: isFaculty
		}
	};
	
	dal.updateRecords("User", criteria, updateObj, function(err, result) {
		if (err) { cb(err, null); }
		else { cb(null, result); }
	});
};

// Sets/Clears the IsStudent flag for the provided user 
Core.prototype.recordStudentFlag = function(userId, isStudent, cb) {
	var criteria = {
		_id: ObjectID.createFromHexString(userId)
	};
	var updateObj = {
		$set: {
			IsStudent: isStudent
		}
	};
	
	dal.updateRecords("User", criteria, updateObj, function(err, result) {
		if (err) { cb(err, null); }
		else { cb(null, result); }
	});
};

// Checks if the User is a student or not
Core.prototype.isUserStudent = function(userId, cb) {
	var criteria = {
		_id: ObjectID.createFromHexString(userId),
		IsStudent: true
	};
	
	dal.queryCollection("User", criteria, {}, function(err, users) {
		if (err) { cb(err, null); }
		else { cb(null, (users.length == 1)); }
	});
};

// Checks if the User is a student or not
Core.prototype.isUserFaculty = function(userId, cb) {
	var criteria = {
		_id: ObjectID.createFromHexString(userId),
		IsFaculty: true
	};
	
	dal.queryCollection("User", criteria, {}, function(err, users) {
		if (err) { cb(err, null); }
		else { cb(null, (users.length == 1)); }
	});
};

// Registers the user to a course
Core.prototype.regsiterUserToCourse = function(userId, courseId, cb) {
	var criteria = {
		_id: ObjectID.createFromHexString(userId)
	};
	var updateObj = {
		$push: { ITake: courseId }
	};
	
	dal.updateRecords("User", criteria, updateObj, function(err, result) {
		if (err) { cb(err, null); return; }
		criteria = { _id: ObjectID.createFromHexString(courseId) };
		updateObj = { $push: { Students: userId } };

		dal.updateRecords("Course", criteria, updateObj, function(err, result) {
			if (err) { cb(err, null); }
			else { cb(null, result); }
		});
	});
};
/*
 * End of the User specific functions
 */

/*
 * The following set of functions are Course specific
 */

// Create a new course
Core.prototype.createNewCourse = function(course, cb) {
	course.StartDate = getDate(course.StartDate);
	course.EndDate = getDate( course.EndDate );
	dal.insertIntoCollection("Course", course, function(err, courses) {
		if (err) { cb(err, null); }
		else {
			if (courses.length > 0) {
				var crit = {_id: ObjectID.createFromHexString(course.FacultyId)};
				var updateObj = {$push: {IGive: courses[0]._id.toString()}};
				
				// Update User record's IGive array
				dal.updateRecords("User", crit, updateObj, function(err, result) {
					if (err) { cb(err,null); }
					else { cb(null, courses[0]); }
				});
			} else {
				cb({ Message: "Something went wrong" }, null);
			}
		}
	});
};

// Searches and retrieves the list of courses for the provided course ids
// and performs cleanup function on the list based on options provided
Core.prototype.getCourses = function(courseIds, options, cb) {
	var criteria = {};
	if (courseIds.length > 0) {
		criteria = {
			_id : { $in: courseIds }
		};
	}
	dal.queryCollection("Course", criteria, {}, function(err, courses) {
		if (err) {
			cb(err, null);
			return;
		}
		
		courses.forEach(function(course) {
			if (options.view == "faculty") {
				if (Array.isArray(course.Students)) {
					course.StudentsCount = course.Students.length;
				}
				delete course.Students;
			}
			if (options.view == "student") {
				delete course.Students;
			}
		});
		cb(null, courses);
	});
};

// Returns the Student User objects who are registered in the given course
Core.prototype.getCourseStudents = function(courseId, cb) {
	var criteria = {
		ITake : {$in: [courseId] },
		IsStudent: true
	};
	dal.queryCollection("User", criteria, {}, function(err, users) {
		if (err) {
			cb(err, null);
			return;
		}
		
		users.forEach(function(user) {
			delete user.Password;
			delete user.IGive;
			delete user.ITake;
			delete user.IsFaculty;
			delete user.IsStudent;
			delete user.Name;
			delete user.RegisteredOn;
		});
		cb(null, users);
	});
};

// Returns the assessment forms for the provided course ID
Core.prototype.getCourseForms = function(courseId, cb) {
	var criteria = {};
	if ("function" == typeof courseId) {
		cb = courseId;
		delete courseId;
	} else {
		criteria.CourseId = courseId;
	}
	
	dal.queryCollection("CourseForm", criteria, {}, function(err, forms) {
		if (err) { cb(err, null); return; }
		
		var formIds = [];
		forms.forEach(function(form) {
			formIds.push(ObjectID.createFromHexString(form.CourseId));
		});
		
		var crit = { _id: {$in: formIds} };
		dal.queryCollection("Course", crit, {}, function(err, courses) {
			if (err) { cb(err, null); return; }
			
			forms.forEach(function(form) {
				var course = findEntity(courses, "_id", ObjectID.createFromHexString(form.CourseId));
				if (course) {
					form.CourseName = course.Name;
				}
			});
			cb(null, forms);
		});
	});
};
/*
 * End of the Course specific functions
 */

/*
 * The following set of functions are Course Forms specific
 */

// Adds a new Course Form
Core.prototype.createNewCourseForm = function(form, cb) {
	form.MaxMarks = computeTaskMarks(form.Tasks, "MaxMarks");
	
	dal.insertIntoCollection("CourseForm", form, function(err, forms) {
		if (err) { cb(err, null); }
		else {
			if (forms.length > 0) { cb(null, forms[0]); }
			else { cb({ Message:"Unknown" }, null); }
		}
	});
};

// Updates an existing Course Form
Core.prototype.updateCourseForm = function(form, cb) {
	var formMarks = computeTaskMarks(form.Tasks, "MaxMarks");
	var criteria = {
		_id: ObjectID.createFromHexString(form._id)
	};
	var updateObj = {
		$set: {
			FormName: form.FormName,
			Tasks: form.Tasks,
			MaxMarks: formMarks,
			UpdatedOn: new Date(),
			FormStatus: "Prepared"
		}
	};
	
	dal.updateRecords("CourseForm", criteria, updateObj, function(err, forms) {
		if (err) { cb(err, null); }
		else {
			cb(null, forms);
		}
	});
};

//Returns the assessment form for the provided Form ID
Core.prototype.getCourseForm = function(formId, cb) {
	var criteria = { _id: ObjectID.createFromHexString(formId) };
	
	dal.queryCollection("CourseForm", criteria, {}, function(err, forms) {
		if (err) { cb(err, null); return; }
		
		var formIds = [];
		forms.forEach(function(form) {
			formIds.push(ObjectID.createFromHexString(form.CourseId));
		});
		
		var crit = { _id: {$in: formIds} };
		dal.queryCollection("Course", crit, {}, function(err, courses) {
			if (err) { cb(err, null); return; }
			
			forms.forEach(function(form) {
				var course = findEntity(courses, "_id", ObjectID.createFromHexString(form.CourseId));
				if (course) {
					form.CourseName = course.Name;
					form.FacultyId = course.FacultyId;
				}
			});
			cb(null, forms[0]);
		});
	});
};

// Returns the Assessment for the provided user and form
Core.prototype.getStudentAssessmentForm = function(userId, formId, cb) {
	var criteria = { StudentId: userId, CourseFormId: formId };
	
	dal.queryCollection("StudentCourseForm", criteria, {}, function(err, forms) {
		if (err) { cb(err, null); return; }
		else {
			if (forms.length != 1) { cb({Message:"Found none or more than 1 student assessment form"}, null); }
			else { cb(null, forms[0]); }
		}
	});
};

// Returns the course form status
Core.prototype.getFormStatus = function(formId, cb) {
	var criteria = { _id: ObjectID.createFromHexString(formId) };
	
	dal.queryCollection("CourseForm", criteria, {}, function(err, forms) {
		if (err) { cb(err, null); return; }
		
		if (forms.length == 1) { cb(null, forms[0].FormStatus); }
		else { cb({Message:"Form not found"}, null); }
	});
};
//returns student courseForm for given studentId AND courseId
Core.prototype.getStudentCourseForm = function(courseId, studentId, cb){
	
	var criteria = { 
		StudentId: studentId,
		CourseId: courseId
	};

	dal.queryCollection("StudentCourseForm", criteria, {}, function(err, forms) {
		if (err) { cb(err, null); return; }
			cb(null, forms);
	});
};


// Returns Course Object for the CourseForm
Core.prototype.getCourseForForm = function(formId, cb) {
	var criteria = { _id: ObjectID.createFromHexString(formId) };
	
	dal.queryCollection("CourseForm", criteria, {}, function(err, forms) {
		if (err) { cb(err, null); return; }
		
		if (forms.length == 0) {
			cb({Message: "No Course found"}, null);
			return;
		}
		
		var crit = { _id: ObjectID.createFromHexString(forms[0].CourseId) };
		dal.queryCollection("Course", crit, {}, function(err, courses) {
			if (err) { cb(err, null); return; }

			if (courses.length == 1) {
				cb(null, courses[0]);
			} else {
				cb({Message: "No Course found"}, null);
			}
		});
	});
};

// Send forms to student
Core.prototype.sendForm = function(studForm, cb) {
	var self = this;
	
	var updCrit = {
		_id: ObjectID.createFromHexString(studForm.CourseFormId)
	};
	var updObj = {
		$set: { FormStatus: "Sent" }
	};
	var smtpTransport = nodemailer.createTransport("SMTP",{
		service: "Gmail",
		auth: {
		user: "nassessment2015@gmail.com",
		pass: "nassessment1234"
		}
		});
	
	dal.updateRecords("CourseForm", updCrit, updObj, function(err, result) {
		if (err) { cb(err, null); return; }
		
		dal.insertIntoCollection("StudentCourseForm", studForm, function(err, safs) {
			
			if (err) { cb(err); }
			else { 
				cb(null);
				self.getUser(studForm.StudentId,function(err,user){
					console.log("useruseruseruseruseruseruseruseruseruseruser"+user);
					if(err){
						cb(err,null);
					}
					else{
						console.log("useruseruseruseruseruseruseruseruseruseruser"+user.Email);
						studentid=user.Email;
						var mailOptions={
								to : user.Email,
								subject : "confirmation mail",
								text : "Assessment form has been sent to you"
								};
								console.log(mailOptions);
								smtpTransport.sendMail(mailOptions, function(error, response){
								if(error){
								console.log(error);
								//res.end("error");
								}else{
								console.log("Message sent: " + response.message);
								//res.end("sent");
								}
								});
						
					
					}
				});
				//console.log("useruseruseruseruseruseruseruseruseruseruser"+studentid);
				}
				});
	});
};
// Returns the forms submitted to the faculty
Core.prototype.getSubmittedForms = function(facultyId, cb) {
	var found="";
	var criteria = {
		FacultyId : facultyId,
		FormStatus: "In Preview"
	};
	dal.queryCollection("StudentCourseForm", criteria, {}, function(err, submittedForms) {
		if (err) { cb(err, null);  return; }
		var courseids = [];
		var studentids = [];
		submittedForms.forEach(function(submitted) {
			courseids.push(ObjectID.createFromHexString(submitted.CourseId));
			studentids.push(ObjectID.createFromHexString(submitted.StudentId));
		});
		var c_crit = { _id: { $in: courseids } };
		var s_crit = { _id: { $in: studentids } };
		dal.queryCollection("Course", c_crit, {}, function(errc, courses) {
			if (errc) { cb(errc, null); return; }
			courses.forEach(function(course) {
				//var form = findEntity(submittedForms, "CourseId", course._id.toString());
				submittedForms.forEach(function(item) {
					if ((item["CourseId"] == course._id.toString()) || (course._id.toString()._bsontype === "ObjectID" && course._id.toString().equals(item["CourseId"]))) {
						found = item;
						//return false;
						found.CourseName=course.Name;
						console.log("-------------------------------------------------found");
						console.log(found);
					}
				});
				//form.CourseName = course.Name;
			});
			dal.queryCollection("User", s_crit, {}, function(errs, students) {
				if (errs) { cb(errs, null); return; }
				students.forEach(function(student) {
					//var form = findEntity(submittedForms, "StudentId", student._id.toString());
					submittedForms.forEach(function(item) {
						if ((item["StudentId"] == student._id.toString()) || (student._id.toString()._bsontype === "ObjectID" && student._id.toString().equals(item["StudentId"]))) {
							found = item;
							//return false;
							found.StudentName=student.FirstName + " " + student.LastName;
							console.log("-------------------------------------------------found");
							console.log(found);
						}
					});
					//form.StudentName = student.FirstName + " " + student.LastName;
				});
				cb(null, submittedForms);
			});
		});
	});
};
// Returns the forms still pending for the student to submit
Core.prototype.getPendingForms = function(studentId, cb) {
	var criteria = {
		StudentId : studentId,
		FormStatus: "In Progress"
	};
	dal.queryCollection("StudentCourseForm", criteria, {}, function(err, submittedForms) {
		if (err) { cb(err, null); return; }
		var courseids = [];
		var facultyids = [];
		var formids = [];
		var errors = [];
		var count = 3;
		
		submittedForms.forEach(function(submitted) {
			courseids.push(ObjectID.createFromHexString(submitted.CourseId));
			facultyids.push(ObjectID.createFromHexString(submitted.FacultyId));
			formids.push(ObjectID.createFromHexString(submitted.CourseFormId));
		});
		var c_crit = { _id: { $in: courseids } };
		var f_crit = { _id: { $in: facultyids } };
		var f_crit1 = { _id: { $in: formids } };
		dal.queryCollection("Course", c_crit, {}, function(errc, courses) {
			submittedForms.forEach(function(submittedForm) {
				var course = findEntity(courses, "_id", ObjectID.createFromHexString(submittedForm.CourseId));
				submittedForm.CourseName = course.Name;
			});
			/*courses.forEach(function(course) {
				var form = findEntity(submittedForms, "CourseId", course._id.toString());
				form.CourseName = course.Name;
			});*/
			returnCall(errc);
		});
		dal.queryCollection("User", f_crit, {}, function(errs, faculties) {
			submittedForms.forEach(function(submittedForm) {
				var faculty = findEntity(faculties, "_id", ObjectID.createFromHexString(submittedForm.FacultyId));
				submittedForm.FacultyName = faculty.FirstName + " " + faculty.LastName;
			});
			/*faculties.forEach(function(faculty) {
				var form = findEntity(submittedForms, "FacultyId", faculty._id.toString());
				form.FacultyName = faculty.FirstName + " " + faculty.LastName;
			});*/
			returnCall(errs);
		});
		dal.queryCollection("CourseForm", f_crit1, {}, function(errcf, coruseForms) {
			submittedForms.forEach(function(submittedForm) {
				var courseForm = findEntity(coruseForms, "_id", ObjectID.createFromHexString(submittedForm.CourseFormId));
				submittedForm.FormName = courseForm.FormName;
			});
			/*coruseForms.forEach(function(f1) {
				var form = findEntity(submittedForms, "CourseFormId", f1._id.toString());
				form.FormName = f1.FormName;
			});*/
			returnCall(errcf);
		});
		function returnCall(erra) {
			--count;
			if (erra) { errors.push(erra); }
			if (count == 0) {
				if (errors.length > 0) {
					cb({Message:" Unknown reason", Error: errors }, null);
				} else {
					cb(null, submittedForms);
				}
			}
		}
	});
};
// Save the Self assessment marks for a course form template
Core.prototype.saveSelfAssessment = function(form, cb) {
	var criteria = {
		_id: form._id
	};
	var updObj = {
		$set: {
			Tasks: form.Tasks,
			TotalSelfMarks: computeTaskMarks(form.Tasks, "SelfAssessment"),
			SelfAssessedCount: countAssessmentMarks(form.Tasks, "SelfAssessment")
		}
	};
	
	dal.updateRecords("StudentCourseForm", criteria, updObj, function(err, result) {
		if (err) { cb(err, null); }
		else { cb(null, result); }
	});
};
//Save the Self assessment marks for a course form template
Core.prototype.saveFacultyAssessment = function(form, cb) {
	var criteria = {
		_id: form._id
	};
	var updObj = {
		$set: {
			Tasks: form.Tasks,
			TotalFacultyMarks: computeTaskMarks(form.Tasks, "FacultyAssessment"),
			FacultyAssessedCount: countAssessmentMarks(form.Tasks, "FacultyAssessment")
		}
	};
	dal.updateRecords("StudentCourseForm", criteria, updObj, function(err, result) {
		if (err) { cb(err, null); }
		else { cb(null, result); }
	});
};
// Submit a course form template
Core.prototype.submitSelfAssessment = function(form, cb) {
	var allSubmitted = true;
	
	form.Tasks.forEach(function(task) {
		if ("undefined" == typeof task.SelfAssessment) {
			allSubmitted = false;
			return false;
		}
	});
	
	if (!allSubmitted) { cb({Message: "Form is not complete"}, null); return; }
	
	var criteria = {_id: form._id };
	var updObj = {
		$set: {
			FormStatus: "In Preview",
			SubmittedOn: new Date()
		}
	};
	
	dal.updateRecords("StudentCourseForm", criteria, updObj, function(err, result) {
		cb(err, result);
	});
};
//Submit a course form template
Core.prototype.approveAssessment = function(form, cb) {
	var allSubmitted = true;
	
	form.Tasks.forEach(function(task) {
		if ("undefined" == typeof task.FacultyAssessment) {
			allSubmitted = false;
			return false;
		}
	});
	
	if (!allSubmitted) { cb({Message: "Faculty assessment is not yet complete"}, null); return; }
	
	var criteria = {_id: form._id };
	var updObj = {
		$set: {
			FormStatus: "Approved",
			ApprovedOn: new Date()
		}
	};
	
	dal.updateRecords("StudentCourseForm", criteria, updObj, function(err, result) {
		cb(err, result);
	});
};

//Private function to sum the given column Name in the collection
function computeTaskMarks(tasks, colName) {
	var marks = 0;
	
	// Compute the max marks based on the tasks
	tasks.forEach(function(task) {
		marks += parseFloat(task[colName]);
	});
	
	return marks;
}

// Private function to sum the given column Name in the collection
function countAssessmentMarks(tasks, colName) {
	var count = 0;
	
	// Compute the max marks based on the tasks
	tasks.forEach(function(task) {
		if ("undefined" != typeof task[colName]) ++count;
	});
	
	return count;
}
/*
 * End of the CourseForms specific functions
 */

/*
 * The following set of functions are Student specific
 */

// Returns the student object
Core.prototype.getStudent = function(studentId, cb) {
	var criteria = {
		_id: ObjectID.createFromHexString(studentId),
		IsStudent: true
	};
	var c = this;

	dal.queryCollection("User", criteria, {}, function(err, students) {
		if (err) {
			cb(err, null);
			return;
		}
		
		if (students.length == 1) {
			var student = students[0];
			delete student.IGive;
			var itake = getObjectIdArray(student.ITake);
			
			// Get the courses and return updated student info 
			c.getCourses(itake, {view: "student"}, function(err1, courses) {
				if (err1) {
					cb(null, student);
				} else {
					student.CoursesIAttend = course;
					cb(null, student);
				}
			});
		} else {
			cb ({ Message: "Too many students found" }, null);
		}
	});
};
// Returns the list of students with the courseForms
Core.prototype.getStudentsWithOutCourseForm = function(formId, cb) {
	var self = this;
	self.getCourseForForm(formId, function(err, course){
		if (err) { cb(err, null); }
		else {
			var criteria = {
				CourseId: course._id.toString(),
				CourseFormId: formId,
				StudentId: { $in: course.Students }
			};
			dal.queryCollection("StudentCourseForm", criteria, {}, function(err, students) {
				if (err) { cb(err, null); }
				else {
					var studs = [];
					course.Students.forEach(function(student) {
						var studentId = findEntity(students, "StudentId", student);
						
						if (studentId == null) {
							studs.push(student);
						}
					});
					
					cb(null, studs);
				}
			});
		}
	});
};
/*
 * End of the Course specific functions
 */

/*
 * Private methods
 */
// Given an array of id in hex strings, this function returns an array of corresponding Object IDs
function getObjectIdArray(strArray) {
	var oIdArray = [];
	strArray.forEach(function(str) {
		oIdArray.push(ObjectID.createFromHexString(str));
	});
	return oIdArray;
}
function isString(n) {
	return (typeof n) == 'string' && !isNumber(n);
}
function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
function getDate(n) {
	if (isNumber(n)) {
		return new Date(n);
	} else if (isString(n)) {
		return new Date(Date.parse(n));
	} else {
		// assume this is a date
		return n;
	}
}
function findEntity(col, key, val) {
	var found = null;
	col.forEach(function(item) {
		if ((item[key] == val) || (val._bsontype === "ObjectID" && val.equals(item[key]))) {
			found = item;
			return false;
		}
	});
	
	return found;
}
/*
 * End of Private Methods
 */
exports.Core = Core;
