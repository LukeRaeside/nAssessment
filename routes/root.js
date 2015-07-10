var express = require('express');
var router = express.Router();

var log = null;

// middleware specific to this router
router.use(function timeLog(req, res, next) {
  log = req.log;
  
  next();
});

// define the home page route
router.get('/', function(req, res) {
	var sess = req.session;
	if (sess.user) {
		res.render('home', { title: 'nAssessment - Student Assessment Analytics Engine', username:sess.user.FirstName });
	} else {
		res.render('index', { title: 'nAssessment - Student Assessment Analytics Engine', welcometo:'nAssessment' });
	}
});

router.get('/test', function(req, res) {
	var sess = req.session;
	if (sess.user) {
		res.render('testhome', { title: 'nAssessment - Student Assessment Analytics Engine', username:sess.user.FirstName });
	} else {
		res.render('test', { title: 'nAssessment - Student Assessment Analytics Engine', welcometo:'nAssessment' });
	}
});

module.exports = router;