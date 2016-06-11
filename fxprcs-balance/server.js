var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('mongo-balance:27017/fxbalance');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// Make our db accessible to our router
app.use(function(req, res, next) {
        req.db = db;
        next();
});

var balance = require('./routes/balance.js')(app);

var server = app.listen(3001, function() {
	var addr = server.address();
	console.log("Server listening at", addr.address + ":" + addr.port);
});
