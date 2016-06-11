var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('mongo-order:27017/fxorder');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// Make our db accessible to our router
app.use(function(req, res, next) {
        req.db = db;
        next();
});

var balance = require('./routes/order.js')(app);

var server = app.listen(3002, function() {
	var addr = server.address();
	console.log("fxprcs order server listening at", addr.address + ":" + addr.port);
});
