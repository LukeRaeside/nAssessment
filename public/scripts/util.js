var Util = {
	//_baseUrl: "http://vps145093.ovh.net:3000/",
	//_baseUrl: "http://localhost:3000/",
	_baseUrl: "http://192.168.1.16:3000/",
	
	_init: function () {
		$.ajaxSetup({xhrFields: {
			withCredentials: true
		}});
	},
	
	ajaxPost: function (url, inputObj, success, failure) {
		var dataobj = {};
		$.extend(dataobj, inputObj);
		console.log("Input for the POST CALL: "+url);
		console.log(dataobj);
		$.post(this._baseUrl+url, dataobj, function(result) {
			try {
				//result = JSON.parse(result);
				var status = true;
				if (result.hasError) {
					status = false;
					alert('Something broke');
				}
				if (status){
					console.log("Result for the POST CALL: "+url);
					console.log(result);
					success(result);
				}
			} catch (ex) {
				console.log('Unexpected Error'+JSON.stringify(ex));
			}
		}).error(function(err) {
			if ('function' == typeof failure) {
				failure();
			}
		});
	},
	
	ajaxGet: function (url, callback, failure) {
		$.get(this._baseUrl+url, function(data) {
			console.log("Result for the GET CALL: "+url);
			console.log(data);
			
			callback(data);
		}).error(function(err) {
			if ('function' == typeof failure) {
				failure();
			}
		});
	}
};

var Shell = {
	CurrentUser : null
};
