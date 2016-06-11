var http = require('http');
var async = require('async');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('mongo-main:27017/fxorders');
var xml2js = require('xml2js');

var routes = require('./routes/index');
var orders = require('./routes/orders');

var app = express();
var server = http.createServer(app);

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, 'client')));


// Make our db accessible to our router
app.use(function(req, res, next) {
	req.db = db;
	next();
});

app.use('/', routes);
app.use('/order', orders);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

module.exports = app;

server.listen(3002,  "0.0.0.0", function() {
	var addr = server.address();
	console.log("Server listening at", addr.address + ":" + addr.port);
});
