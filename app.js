/**
 * Module dependencies.
 */
var express = require('express'),
	http = require('http'),
	nodemailer = require('nodemailer'),
	path = require('path'),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	serveStatic = require('serve-static'),
	DataAccess = require('./core/dataaccess.js').DataAccess,
	properties = require('properties'),
	log4js = require('log4js'),
	core = require('./core/core.js').Core;

var root = require('./routes/root'),
	users = require('./routes/users'),
	courses = require('./routes/courses'),
	courseforms = require('./routes/courseforms'),
	students = require('./routes/students');

var app = express();

log4js.configure('./log4js.json', {cwd: '.'});
var log = log4js.getLogger('app');
var logA = log4js.getLogger('http');
app.use(log4js.connectLogger(logA));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(session({secret: 'ssshhhhh'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//app.use(express.methodOverride());

app.use(serveStatic('public/stylesheets', {}));
app.use(serveStatic('public/scripts', {}));

// development only
if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
}

var core = null;

app.use(function(req, res, next) {
	var options = {
		path: true,
		namespaces: false,
		sections: false,
		variables: false,
		include: false
	};

	properties.parse("./mongo.properties", options, function (error, config) {
		host = config.host;
		port = config.port;
		user = config.userName;
		pass = config.password;
		name = config.db;
		console.log("Connecting to "+user+"@"+host+":"+port);
		console.log("Database: "+name);
		var dal = new DataAccess(host, port, user, pass, name, function(err, result) {
			if (result === false) {
				console.log("Failed to connect to database");
				var err1 = {
					Message: "Could not establish connection to the database."
				};
				next(err1);
			} else {
				req.dal = dal;
				req.log = log;
				
				core = new Core(dal, log);
				req.core = core;
				
				next();
			}
		});
	});
});

// Middleware to identify the credentials in headers and auto login the user
app.use(function(req, res, next) {
	console.log(req.headers);
	var hdrs = req.headers;
	var uName = "", pwd = "";
	if (hdrs.na_user) { uName = hdrs.na_user; }
	if (hdrs.na_pwd) { pwd = hdrs.na_pwd; }
	
	if (uName.length > 0) {
		core.loginUser(uName, pwd, function(err, user) {
			req.session.user = user;
			next();
		});
	} else {
		next();
	}
});

app.use('/', root);
app.use('/users', users);
app.use('/courses', courses);
app.use('/courseforms', courseforms);
app.use('/students', students);

app.use(function errorHandler(err, req, res, next) {
	log.error(err);
	res.status(500);
	res.render('error', { error: err });
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
