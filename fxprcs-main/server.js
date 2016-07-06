var http = require('http');
var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('mongo-main:27017/fxdealing');
var xml2js = require('xml2js');

var routes = require('./routes/index');
var orders = require('./routes/orders');
var users = require('./routes/users');
var referencedata = require('./routes/ref');
var login = require('./routes/login');

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

// view engine setup
//app.set('views', path.join(__dirname, 'client/views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.resolve(__dirname, 'client')));


// Make our db accessible to our router
app.use(function(req, res, next) {
	req.db = db;
	next();
});

app.use('/', routes);
app.use('/orders', orders);
app.use('/users', users);
app.use('/ref', referencedata);
app.use('/login', login);
//app.use('/symbol', symbol);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

module.exports = app;

var tickers = [];
var sockets = [];
var FETCH_INTERVAL = 3000;
var NEWS_FETCH_INTERVAL = 30000;
var kafka = require('kafka-node'),
     Producer = kafka.Producer,
     client = new kafka.Client('104.155.231.216:2181'),
     producer = new Producer(client);

io.on('connection', function(socket) {

	sockets.push(socket);

	socket.on('ticker', function(msg) {
		var ticker = String(msg || '');
		console.log("Request to provide quotes for new ticker: " + ticker);
		trackTicker(socket, ticker);
	});

	socket.on('error', function(msg) {
		console.log("Socket.io error. Message: " + msg);
	});
});

function trackTicker(socket, ticker) {
	if (!ticker)
		return;

	var data = {
		ticker: ticker,
		socket: socket
	};

	//not very elegant. If length is 6 assume ticker is an FX currency pair
	var fx = false;
	if (ticker.length == 6) {
		fx = true;
	}

	tickers.push(data);
	if (fx) {
		sendFXQuoteToClients(socket, ticker);
	}
	else {
		sendEquityQuoteToClients(socket, ticker);
	}
	
	//Every N seconds
	var timer = setInterval(function() {
		if (fx) {
			sendFXQuoteToClients(socket, ticker);
		}
		else {
			sendEquityQuoteToClients(socket, ticker);
		}
	}, FETCH_INTERVAL);

	//Send news on startup and every N seconds
	//sendFXNewsToClients(socket);
	//var timerNews = setInterval(function() {
	//	sendFXNewsToClients(socket);
	//}, NEWS_FETCH_INTERVAL);

	socket.on('disconnect', function() {
		clearInterval(timer);
		sockets.splice(sockets.indexOf(socket), 1);
	});
}

function sendEquityQuoteToClients(socket, ticker) {
	var req = http.get({
		host: 'www.google.com',
		port: 80,
		path: '/finance/info?client=ig&q=' + ticker
	}, function(response) {
		response.setEncoding('utf8');
		var data = "";

		response.on('data', function(chunk) {
			data += chunk;
		});

		response.on('error', function(error) {
			console.log("Response error on http get sendEquityQuoteToClients = " + error);
		});

		response.on('end', function() {
			if (data.length > 0) {
				try {
					var data_object = JSON.parse(data.substring(3));
				}
				catch (e) {
					return;
				}

				var quote = {};
				quote.ticker = data_object[0].t;
				quote.exchange = data_object[0].e;
				quote.price = data_object[0].l_cur;
				quote.change = data_object[0].c;
				quote.change_percent = data_object[0].cp;
				quote.last_trade_time = data_object[0].lt;
				quote.dividend = data_object[0].div;
				quote.yield = data_object[0].yld;
				socket.emit('quote', quote);
			}
		});
	});
	req.on('error', function(e) {
		console.log("HTTP get request error sendEquityQuoteToClients: " + e);
	});
}

function sendFXQuoteToClients(socket, ticker) {
	var url = 'http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.xchange where pair in ("' + ticker + '")&format=json&env=store://datatables.org/alltableswithkeys';

	var req = http.get(url, function(response) {
		response.setEncoding('utf8');
		var data = "";

		response.on('data', function(chunk) {
			data += chunk;
		});

		response.on('error', function(error) {
			console.log("Response error on http get sendFXQuoteToClients = " + error);
		});

		response.on('end', function() {
			if (data.length > 0) {
				try {
					var data_object = JSON.parse(data);
				}
				catch (e) {
					console.log(e + " " + data);
					return;
				}
				
				//ensure the response contains a valid quote
				if (!data_object.query.results) {
					return;
				}
				console.log("Sending quote to client for ticker: " + ticker);
				var quote = {};
				quote.ticker = data_object.query.results.rate.id;
				quote.bid = data_object.query.results.rate.Bid;
				quote.ask = data_object.query.results.rate.Ask;
				quote.rate = data_object.query.results.rate.Rate;
				quote.price = data_object.query.results.rate.Rate;
				quote.date = data_object.query.results.rate.Date;
				quote.time = data_object.query.results.rate.Time;
				socket.emit('quote', quote);

				//publish to kafka
	//			kafka_payload = [
       //  				{ topic: 'pricequote', messages: quote, partition: 0 },
     //				];
//				producer.send(kafka_payload, function(err, data){
  //       				console.log(data)
    // 				});
			}
		});
	});
	req.on('error', function(e) {
		console.log("HTTP get request error sendFXQuoteToClients: " + e);
	});
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
	var addr = server.address();
	console.log("Server listening at", addr.address + ":" + addr.port);
});
