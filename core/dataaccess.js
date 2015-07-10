var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
    
DataAccessLayer = function(host, port, user, pass, name, cb) {
    var self = this;
    this.db = new Db(name, new Server(host, port, {auto_reconnect : true, ha : true}), {native_parser:false});
    this.db.open(function(err, driver_db) {
        if(err) {
        	cb(err, false);
        	return;
        }
        self.authdb = driver_db;
        driver_db.authenticate(user, pass, function(err, result) {
            console.log("authentication: "+result);
            cb(err, result);
        });
    });
};

DataAccessLayer.prototype.getCollection = function(colName, callback) {
	var self = this;
	this.authdb.collection(colName, function(err, coll) {
		if(err) {callback(err);return;}
		if (coll === null) {
			self.authdb.createCollection(colName, function(err, collection) {
				if (err) throw(err);
				callback(err, collection);
			});
		} else {
            callback(null, coll);
		}
	});
};

DataAccessLayer.prototype.queryCollection = function(colName, criteria, options, callback) {
	this.getCollection(colName, function(err, coll) {
		if (err) { callback(err, {}); }
		else {
			coll.find(criteria, options, function(err, cursor) {
				if (err) { callback(err, {}); }
				cursor.toArray(function(err, docs) {
					callback(null, docs);
				});
			});
		}
	});
};

DataAccessLayer.prototype.insertIntoCollection = function(colName, obj, callback) {
	this.getCollection(colName, function(err, coll) {
		if (err) { callback(err, {}); }
		else {
			console.log("-------------------");
			console.log(obj);
			coll.insert(obj, {safe: true}, function(err, docs) {
				callback(err, docs);
			});
		}
	});
};

DataAccessLayer.prototype.updateRecords = function(colName, criteria, updateObj, callback) {
	this.getCollection(colName, function(err, coll) {
		if (err) { callback(err, {}); }
		else {
			var options = {
				multi: false,
				upsert: false,
				safe: true
			};
			coll.update(criteria, updateObj, options, function(err, result) {
				callback(err, result);
			});
		}
	});
};

DataAccessLayer.prototype.deleteRecords = function(colName, criteria, updateObj, callback) {
	this.getCollection(colName, function(err, coll) {
		if (err) { callback(err, {}); }
		else {
			var options = {
				safe: true
			};
			coll.remove(criteria, options, function(err, result) {
				callback(err, result);
			});
		}
	});
};

/*DataAccessLayer.prototype.getUsers = function(callback) {
	var self = this;
	this.authdb.collection('User', function(err, coll) {
		if(err) {callback(err);return;}
		if (coll === null) {
			self.authdb.createCollection('User', function(err, collection) {
				if (err) throw(err);
				callback(err, collection);
			});
		} else {
            callback(null, coll);
		}
	});
};*/

exports.DataAccess = DataAccessLayer;
