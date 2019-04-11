// modules
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

// configure body-parser for express
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


// login page
app.get('/', function(req, res, next) {
	res.sendFile(__dirname + '/public/login.html');
});

// home page (database control)
app.post('/database', function(req, res, next) {
	if (req.body.admin == 'admindb' && req.body.password == 'passworddb') {
		res.sendFile(__dirname + '/public/insert.html');
	}
	else {
		res.sendFile(__dirname + '/public/wrong-login.html');
	}
});

// add user to the database
app.post('/insert', function(req, res, next) {
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("users-db");
		function capitalizeFirstLetter(string) {
    		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
		}
		var user = {
		firstName: capitalizeFirstLetter(req.body.firstName),
		lastName: capitalizeFirstLetter(req.body.lastName),
		age: req.body.age,
		phoneNumber: req.body.phoneNumber
		};
		dbo.collection("users-collection").insertOne(user, function(err, res) {
	    	if (err) throw err;
	    	console.log("1 user inserted");
	    	db.close();
	  	});
	  	res.sendFile(__dirname + '/public/insert.html');
	});	
});

// display the users-collection in the database
app.get('/usersdb', function(req, res, next) {
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("users-db");
	  	dbo.collection("users-collection").find({}).toArray(function(err, result) {
	    	if (err) throw err;
	    	console.log(result);
	    	res.writeHead(200, {'Content-Type': 'text/html'});
	    	res.write('<!DOCTYPE html>\n');
	    	res.write('<html>\n');
	    	res.write('<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">\n');
	    	res.write('<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>\n');
	    	res.write('<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>\n');
	    	res.write('<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>\n');
	    	res.write('</head>\n');
	    	res.write('<head>\n');
	    	res.write('<body>\n');
	    	res.write('<div ng-app="tableApp" ng-controller="tableController">\n');
	    	res.write('<table class="table table-striped table-hover text-center">\n');
	    	res.write('<tr>\n');
	    	res.write('<th class="text-center">Number</th>\n <th class="text-center">Id</th>\n <th class="text-center">First Name</th>\n <th class="text-center">Last Name</th>\n <th class="text-center">Age</th>\n <th class="text-center">Phone Number</th>\n');
	    	res.write('</tr>\n');
	    	res.write('<tr ng-repeat="x in result">\n');
	    	res.write('<td>{{ $index+1 }}</td> <td>{{ x._id }}</td> <td>{{ x.firstName }}</td> <td>{{ x.lastName }}</td> <td>{{ x.age }}</td> <td>{{ x.phoneNumber }}</td>\n');
	    	res.write('</tr>\n');
	    	res.write('</table><br>\n');
	    	res.write('</div>\n');
	    	res.write('<script>\n');
	    	res.write('var app = angular.module("tableApp", []);\n');
	    	res.write('app.controller("tableController", function($scope) { $scope.result = ' + JSON.stringify(result) + ' });\n');
	    	res.write('</script>\n');
	    	res.write('</body>\n');
	    	res.write('</html>');
	    	res.end();
	    	db.close();
	  	});
	});	
});

// clear the database
app.post('/delete', function(req, res, next) {
	MongoClient.connect(url, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("users-db");
	  dbo.collection("users-collection").drop(function(err, delOK) {
	    if (err) throw err;
	    if (delOK) console.log("Collection deleted");
	    db.close();
	  });
	  res.sendFile(__dirname + '/public/insert.html');
	});
});

//server listening port
app.listen(port);

//errors handling
var errors = require('./errorsHandling');
app.use(errors.onError404);
app.use(errors.onError500);