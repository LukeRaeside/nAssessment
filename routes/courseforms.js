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

// Returns the list of assessment forms for a given course
router.get('/', function(req, res) {
	core.getCourseForms(function(err, forms) {
		if (err) { res.json({ Status: false, Message: "Unknown" }); }
		else {
			res.json({ Status: true, CourseForms: forms });
		}
	});
});

// Returns a specific course form
router.get('/get/:courseFormId', function(req, res) {
	var formId = req.params.courseFormId;
	
	core.getCourseForm(formId, function(err, form) {
		if (err) { res.json({ Status: false, Message: "Unknown" }); }
		else {
			res.json({ Status: true, CourseForm: form });
		}
	});
});

// Create/Save a Course Form
router.post('/save', function(req, res) {
	var form = req.body.criteria.courseForm;
	
	if (form._id) {
		core.getFormStatus(form._id, function(err, status) {
			if (status == "Sent") {
				res.json({ Status: false, Message:"A Course Form once sent to students cannot be modified" });
				return;
			}
			core.updateCourseForm(form, function(err, updatedForm) {
				if (err) { res.json({ Status: false, Message: "Unknown" }); }
				else {
					res.json({ Status: true });
				}
			});
		});
	} else {
		core.createNewCourseForm(form, function(err, newform) {
			if (err) { res.json({ Status: false, Message: "Unknown" }); }
			else {
				res.json({ Status: true, CourseForm: newform });
			}
		});
	}
});

// Send Course Forms to Students
router.post('/send/:formid', function(req, res) {
	var formId = req.params.formid;
	var errors = [];
	var studCount = 0;
	
	core.getCourseForm(formId, function(err, form) {
		if (err) { res.json({ Status: false, Message:"No Assessment Form found" }); }
		else {
			core.getStudentsWithOutCourseForm(formId, function(err, students) {
				if (err) { res.json({ Status: false, Message:"Unknown error while trying to sending forms to students" }); }
				else {
					var tasks = [];
					form.Tasks.forEach(function(task) {
						tasks.push({
							Number: task.Number,
							MaxMarks: task.MaxMarks
						});
					});
					studCount = students.length;
					var date = new Date();
					var hrs= date.getHours();
					hrs=hrs+1;
					var date1=date.setHours(hrs);
					
					
					if (studCount > 0) {
						students.forEach(function(student) {
							var inputObj = {
								StudentId: student,
								CourseId: form.CourseId,
								CourseFormId: formId,
								FormStatus: "In Progress",
								Tasks: tasks,
								FacultyId: form.FacultyId,
								DueDate: new Date(date1)
							};
							core.sendForm(inputObj, function(err1) {
								if (err1) { errors.push(err1); }
								returnResponse();
							});
						});
					} else {
						studCount = 1;
						returnResponse();
					}
				}
			});
		}
	});
	
	function returnResponse() {
		--studCount;
		if (studCount == 0) {
			if (errors.length > 0) {
				res.json({ Status: false, Message: "Failed to send the forms to some of the students" });
			} else {
				res.json({ Status:true });
			}
		}
	}
});

// Returns the currently submitted course forms for the faculty
router.get('/submitted', function(req, res) {
	var user = req.session.user;
	if (user.IsFaculty === true) {
		core.getSubmittedForms(user._id.toString(), function(err, submittedForms) {
			if (err) {
				res.json({ Status: false });
			} else {
				res.json({ Status: true, SubmittedForms: submittedForms });
			}
		});
	} else {
		res.json({ Status: false, Message: "You are not registered as a Faculty Member" });
	}
});

//Returns the currently submitted course forms for the faculty
router.get('/submitted/:facultyId', function(req, res) {
	var facultyId = req.params.facultyId;
	
	core.isUserFaculty(facultyId, function(err, isFaculty) {
		if (err) { res.json({ Status: false, Message:"Not a faculty" }); return; }
		
		if (isFaculty) {
			core.getSubmittedForms(facultyId, function(err, submittedForms) {
				if (err) {
					res.json({ Status: false });
				} else {
					res.json({ Status: true, SubmittedForms: submittedForms });
				}
			});
		} else {
			res.json({ Status: false, Message: "You are not registered as a Faculty Member" });
		}
	});
});

// Returns the currently course forms that have been sent to me, I need to self assess and submit
router.get('/pending', function(req, res) {
	var user = req.session.user;
	if (user.IsStudent === true) {
		core.getPendingForms(user._id.toString(), function(err, pendingForms) {
			if (err) {
				res.json({ Status: false });
			} else {
				res.json({ Status: true, PendingForms: pendingForms });
			}
		});
	} else {
		res.json({ Status: false, Message: "You are not registered as a Student Member" });
	}
});

// Returns the currently course forms that have been sent to me, I need to self assess and submit
router.get('/pending/:studentId', function(req, res) {
	var studentId = req.params.studentId;
	
	core.isUserStudent(studentId, function(err, isStudent) {
		if (err) { res.json({ Status: false, Message:"Not a Student" }); return; }
		
		if (isStudent) {
			core.getPendingForms(studentId, function(err, pendingForms) {
				if (err) {
					res.json({ Status: false });
				} else {
					res.json({ Status: true, PendingForms: pendingForms });
				}
			});
		} else {
			res.json({ Status: false, Message: "You are not registered as a Student Member" });
		}
	});
});

// Return the self assessed form
router.get('/assess/self/:formId', function(req, res) {
	var formId = req.params.formId;
	var user = req.session.user;
	var studentId = user._id.toString();

	core.getCourseForForm(formId, function(err, course) {
		if (err) { res.json({ Status:false, Message:"Unknown error" }); return; }
		
		var student = findEntity(course.Students, "", studentId);
		if (student == null) {
			res.json({ Status: false, Message: "User is not attending the selected course" });
			return;
		}
		
		core.getStudentAssessmentForm(studentId, formId, function(errf, form){
			if (errf) { res.json({ Status: false, Error: errf }); return; }
			
			res.json({ Status: true, Form: form });
		});
	});
});

// Save self assessment marks
router.post('/assess/self/:formId', function(req, res) {
	var formId = req.params.formId;
	var user = req.session.user;
	var studentId = user._id.toString();
	var submittedForm = req.body.criteria.SubmittedForm;
	
	core.getCourseForForm(formId, function(err, course) {
		if (err) { resj.json({ Status:false, Message:"Unknown error" }); return; }
		
		var student = findEntity(course.Students, "", studentId);
		if (student == null) {
			res.json({ Status: false, Message: "User is not attending the selected course" });
			return;
		}
		
		core.getStudentAssessmentForm(studentId, formId, function(errf, form){
			if (errf) { res.json({ Status: false, Error: errf }); return; }
			
			if (form.FormStatus != "In Progress") {
				res.json({ Status: false, Message:"Already submitted forms cannot be modified"});
				return;
			}
			submittedForm.Tasks.forEach(function(sTask) {
				var fTask = null;
				fTask = findEntity(form.Tasks, "Number", sTask.Number);
				if (fTask) {
					if (sTask.SelfAssessment) {
						fTask.SelfAssessment = sTask.SelfAssessment;
						fTask.DateSelfEntered = new Date();
						if (sTask.SelfComments) { fTask.SelfComments = sTask.SelfComments; }
					} else {
						delete fTask.SelfAssessment;
						delete fTask.DataSelfEntered;
						delete fTask.SelfComments;
					}
				} else {
					fTask = {
						Number: sTask.Number,
						SelfAssessment: sTask.SelfAssessment,
						DateSelfEntered: new Date()
					};
					if (sTask.SelfComments) { fTask.SelfComments = sTask.SelfComments; }
					form.Tasks.push(fTask);
				}
			});
			
			core.saveSelfAssessment(form, function(errfs, result) {
				if (errfs) { res.json({ Status: false, Error: errfs}); }
				else {
					if (result) { res.json({ Status: true }); }
					else { res.json({ Status: false }); }
				}
			});
		});
	});
});

// Submit Self Assessment form
router.post('/assess/self/:formId/submit', function(req, res) {
	var formId = req.params.formId;
	var user = req.session.user;
	var studentId = user._id.toString();
	
	core.getCourseForForm(formId, function(err, course) {
		if (err) { resj.json({ Status:false, Message:"Unknown error" }); return; }
		
		var student = findEntity(course.Students, "", studentId);
		if (student == null) {
			res.json({ Status: false, Message: "User is not attending the selected course" });
			return;
		}
		
		core.getStudentAssessmentForm(studentId, formId, function(errf, form){
			if (errf) { res.json({ Status: false, Error: errf }); return; }
			
			if (form.FormStatus != "In Progress") {
				res.json({ Status: false, Message:"Already submitted forms cannot be modified"});
				return;
			}
			
			core.submitSelfAssessment(form, function(errs, result) {
				if (errs) { res.json({ Status: false, Error: errs }); return; }
				else {
					if (result) { res.json({ Status: true }); }
					else { res.json({ Status: false }); }
				}
			});
		});
	});
});
//returns the student course form for given studentId and courseId
router.get('/on/:courseId', function(req, res) {
	var courseId = req.params.courseId;
	var user = req.session.user;
	var studentId = user._id.toString();
	core.getStudentCourseForm(courseId,studentId,function(err,studentForm){
		if (err) { res.json({ Status: false, Error: err }); return; }
		
		res.json({ Status: true, Form: studentForm });
	});
});



//Return the student's assessed form
router.get('/assess/faculty/:formId/:studentId', function(req, res) {
	var formId = req.params.formId;
	var user = req.session.user;
	var facultyId = user._id.toString();
	var studentId = req.params.studentId;

	core.getCourseForForm(formId, function(err, course) {
		if (err) { res.json({ Status:false, Message:"Unknown error" }); return; }
		
		if (course.FacultyId != facultyId) {
			res.json({ Status: false, Message: "User is not the faculty fo the selected course" });
			return;
		}
		var student = findEntity(course.Students, "", studentId);
		if (student == null) {
			res.json({ Status: false, Message: "User is not attending the selected course" });
			return;
		}
		
		core.getStudentAssessmentForm(studentId, formId, function(errf, form){
			if (errf) { res.json({ Status: false, Error: errf }); return; }
			
			res.json({ Status: true, Form: form });
		});
	});
});

// Save Faculty Assessment marks
router.post('/assess/faculty/:formId/:studentId', function(req, res) {
	
	var formId = req.params.formId;
	var user = req.session.user;
	var facultyId = user._id.toString();
	var studentId = req.params.studentId;
	var assessedForm = req.body.criteria.AssessedForm;
	
	core.getCourseForForm(formId, function(err, course) {
		if (err) { resj.json({ Status:false, Message:"Unknown error" }); return; }
		
		if (course.FacultyId != facultyId) {
			res.json({ Status: false, Message: "User is not the faculty fo the selected course" });
			return;
		}
		if (findEntity(course.Students, "", studentId) == null) {
			res.json({ Status: false, Message: "Student is not registered for this course" });
			return;
		}
		
		core.getStudentAssessmentForm(studentId, formId, function(errf, form){
			if (errf) { res.json({ Status: false, Error: errf }); return; }
			
			if (form.FormStatus != "In Preview") {
				res.json({ Status: false, Message:"Student has not yet submitted the assessment form."});
				return;
			}
			assessedForm.Tasks.forEach(function(sTask) {
				var fTask = null;
				fTask = findEntity(form.Tasks, "Number", sTask.Number);
				if (fTask) {
					if (sTask.FacultyAssessment) {
						fTask.FacultyAssessment = sTask.FacultyAssessment;
						fTask.DateFacultyEntered = new Date();
						if (sTask.FacultyComments) { fTask.FacultyComments = sTask.FacultyComments; }
					} else {
						delete fTask.FacultyAssessment;
						delete fTask.DateFacultyEntered;
						delete fTask.FacultyComments;
					}
				} else {
					fTask = {
						Number: sTask.Number,
						FacultyAssessment: sTask.FacultyAssessment,
						DateFacultyEntered: new Date()
					};
					if (sTask.FacultyComments) { fTask.FacultyComments = sTask.FacultyComments; }
					form.Tasks.push(fTask);
				}
			});
			
			core.saveFacultyAssessment(form, function(errfs, result) {
				if (errfs) { res.json({ Status: false, Error: errfs}); }
				else {
					if (result) { res.json({ Status: true }); }
					else { res.json({ Status: false }); }
				}
			});
		});
	});
});

//Submit Self Assessment form
router.post('/assess/faculty/:formId/:studentId/approve', function(req, res) {
	var formId = req.params.formId;
	var user = req.session.user;
	var facultyId = user._id.toString();
	var studentId = req.params.studentId;
	
	core.getCourseForForm(formId, function(err, course) {
		if (err) { resj.json({ Status:false, Message:"Unknown error" }); return; }
		
		if (course.FacultyId != facultyId) {
			res.json({ Status: false, Message: "User is not the faculty for the selected course" });
			return;
		}
		var student = findEntity(course.Students, "", studentId);
		if (student == null) {
			res.json({ Status: false, Message: "User is not attending the selected course" });
			return;
		}
		
		core.getStudentAssessmentForm(studentId, formId, function(errf, form){
			if (errf) { res.json({ Status: false, Error: errf }); return; }
			
			if (form.FormStatus == "In Progress") {
				res.json({ Status: false, Message:"Student has not yet submitted"});
				return;
			}
			if (form.FormStatus == "Approved") {
				res.json({ Status: false, Message:"Assessment form is already approved"});
				return;
			}
			
			core.approveAssessment(form, function(errs, result) {
				if (errs) { res.json({ Status: false, Error: errs }); return; }
				else {
					if (result) { res.json({ Status: true }); }
					else { res.json({ Status: false }); }
				}
			});
		});
	});
});

function findEntity(col, key, val) {
	var found = null;
	col.forEach(function(item) {
		if ((key != "" && item[key] == val) ||
			(key == "" && item == val)){
			found = item;
			return false;
		}
	});
	
	return found;
}

module.exports = router;
